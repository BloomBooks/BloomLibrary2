import { observable, computed, makeObservable } from "mobx";
import { Book } from "../model/Book";
import { IntlShape } from "react-intl";

// This is related to the "show" column on book in ParseServer
export class ArtifactVisibilitySettings {
    public harvester: boolean | undefined;
    public harvesterReasonToHideId: string | undefined;
    public librarian: boolean | undefined;
    public user: boolean | undefined;
    public exists: boolean | undefined;

    constructor(
        harvester?: boolean | undefined,
        harvesterReasonToHideId?: string | undefined,
        librarian?: boolean | undefined,
        user?: boolean | undefined,
        exists?: boolean | undefined
    ) {
        makeObservable(this, {
            harvester: observable,
            harvesterReasonToHideId: observable,
            librarian: observable,
            user: observable,
            exists: observable,
            decision: computed,
        });

        this.harvester = harvester;
        this.harvesterReasonToHideId = harvesterReasonToHideId;
        this.librarian = librarian;
        this.user = user;
        this.exists = exists;
    }

    public doesNotExist(): boolean {
        return this.exists === false;
    }

    public isUserHide(): boolean {
        return this.user === false;
    }

    public hasHarvesterDecided = (): boolean => {
        return this.harvester !== undefined;
    };

    public isHarvesterHide(): boolean {
        return this.harvester === false;
    }

    public hasLibrarianDecided = (): boolean => {
        return this.librarian !== undefined;
    };

    public isLibrarianHide = (): boolean => {
        return this.librarian === false;
    };

    public getDecisionSansUser = (): boolean => {
        if (this.hasLibrarianDecided()) {
            return !this.isLibrarianHide();
        }
        return !this.isHarvesterHide();
    };

    public hasUserDecided = (): boolean => {
        //console.log(JSON.stringify(this));
        return this.user !== undefined;
    };

    // returns undefined if it's not hidden and should be available
    public reasonForHiding(
        book: Book,
        l10n: IntlShape,
        ignoreHarvesterState: boolean
    ): string | undefined {
        switch (ignoreHarvesterState ? "Done" : book.harvestState) {
            case "Updated":
            case "New":
                return l10n.formatMessage({
                    id: "book.artifacts.visibility.new",
                    defaultMessage:
                        "Our system has not yet generated this format.",
                });
            case "Failed":
            case "FailedIndefinitely":
                return l10n.formatMessage({
                    id: "book.artifacts.visibility.fail",
                    defaultMessage:
                        "Our system ran into a problem while trying to generate this format.",
                });
            case "Done":
                return (
                    (this.isUserHide() &&
                        l10n.formatMessage({
                            id: "book.artifacts.visibility.userHidden",
                            defaultMessage:
                                "This format has been hidden by the person who uploaded this book.",
                        })) ||
                    (this.isLibrarianHide() &&
                        l10n.formatMessage({
                            id: "book.artifacts.visibility.librarianHidden",
                            defaultMessage:
                                "This format has been hidden by a site moderator.",
                        })) ||
                    (this.isHarvesterHide() &&
                        l10n.formatMessage({
                            id: this.harvesterReasonToHideId
                                ? this.harvesterReasonToHideId
                                : "book.artifacts.visibility.harvesterHidden",
                            defaultMessage: this.harvesterReasonToHideId
                                ? this.harvesterReasonToHideId
                                : "Our system was not confident about scaling the book to this format.",
                        })) ||
                    (this.doesNotExist() &&
                        l10n.formatMessage({
                            id: "book.artifacts.doesnotexist",
                            defaultMessage:
                                "BloomLibrary does not have the book in this format.",
                        })) ||
                    undefined
                );
            default:
                return "Unknown";
        }
    }

    // This duplicates some logic in other methods, but if we use them,
    // they probably have to be @computed too...
    public get decision(): boolean {
        if (this.exists === false) {
            return this.exists;
        }
        if (this.user !== undefined) {
            return this.user;
        }
        if (this.librarian !== undefined) {
            return this.librarian;
        }
        return this.harvester !== false;
    }

    // Make a real (observable, with methods) ArtifactVisibilitySettings
    // out of a pojo with the same basic fields, typically part of a
    // query result from parse server. (If the pojo is undefined, return undefined.
    // This allows us to keep track of which settings occur at all in the database)
    public static createFromParseServerData(
        pojo: any
    ): ArtifactVisibilitySettings | undefined {
        if (pojo) {
            return Object.assign(new ArtifactVisibilitySettings(), pojo);
        } else {
            return undefined;
        }
    }
}

// One ArtifactVisibilitySettings for each of several different publication options.
// Some of them may be undefined, indicating that no choice can be made for that
// artifact because the harvester was not able to make it.
export class ArtifactVisibilitySettingsGroup {
    // Note: pdf and shellbook always exist, because there is always an option to
    // offer these to the user. The other three can be undefined, indicating that
    // the harvester has not created the artifacts, so there is no possibility of
    // making them available.
    public pdf: ArtifactVisibilitySettings = new ArtifactVisibilitySettings();
    public epub: ArtifactVisibilitySettings | undefined;
    public bloomReader: ArtifactVisibilitySettings | undefined;
    public readOnline: ArtifactVisibilitySettings | undefined;
    public shellbook: ArtifactVisibilitySettings = new ArtifactVisibilitySettings();
    public bloomSource: ArtifactVisibilitySettings | undefined;

    constructor() {
        makeObservable(this, {
            pdf: observable,
            epub: observable,
            bloomReader: observable,
            readOnline: observable,
            shellbook: observable,
            bloomSource: observable,
        });
    }

    // Make a real (observable) ArtifactVisibilitySettingsGroup
    // out of a pojo with the same basic fields, typically part of a
    // query result from parse server.
    public static createFromParseServerData(
        pojo: any
    ): ArtifactVisibilitySettingsGroup {
        const result = new ArtifactVisibilitySettingsGroup();
        if (pojo) {
            // I don't think we can just use Object.assign here,
            // because we want to make the child objects real, too.
            result.bloomReader = ArtifactVisibilitySettings.createFromParseServerData(
                pojo.bloomReader
            );
            result.epub = ArtifactVisibilitySettings.createFromParseServerData(
                pojo.epub
            );
            result.readOnline = ArtifactVisibilitySettings.createFromParseServerData(
                pojo.readOnline
            );
            result.bloomSource = ArtifactVisibilitySettings.createFromParseServerData(
                pojo.bloomSource
            );
            // These two are not allowed to be undefined; keep the constructor-created
            // defaults if the parse data doesn't have anything.
            result.pdf =
                ArtifactVisibilitySettings.createFromParseServerData(
                    pojo.pdf
                ) || result.pdf;
            result.shellbook =
                ArtifactVisibilitySettings.createFromParseServerData(
                    pojo.shellbook
                ) || result.shellbook;
        }
        return result;
    }
}
