import { observable } from "mobx";
import { updateBook } from "../connection/LibraryUpdates";
import { ArtifactVisibilitySettingsGroup } from "./ArtifactVisibilitySettings";
import { ArtifactType } from "../components/BookDetail/ArtifactHelper";
import { ILanguage } from "./Language";

export function createBookFromParseServerData(pojo: any, bookId: string): Book {
    const b = Object.assign(new Book(), pojo);
    // change to a more transparent name internally, and make an observable object
    b.artifactsToOfferToUsers = ArtifactVisibilitySettingsGroup.createFromParseServerData(
        pojo.show
    );

    b.languages = pojo.langPointers;
    b.finishCreationFromParseServerData(bookId);
    return b;
}

// This is basically the data object we get from Parse Server about a book.
// We can't reasonably improve the data model there, but we improve it in
// various ways as we construct this object from the Parse Server data.
export class Book {
    public id: string = "";
    public title: string = "";

    public license: string = "";
    public baseUrl: string = "";
    public copyright: string = "";
    public credits: string = "";
    public pageCount: string = "";
    public bookOrder: string = "";

    public features: string[] = [];
    public harvesterLog: string = "";
    public harvestState: string = "";

    // things that can be edited on the site are observable so that the rest of the UI will update if they are changed.
    @observable public summary: string = "";
    @observable public tags: string[] = [];
    @observable public level: string = "";
    @observable public librarianNote: string = "";
    @observable
    public artifactsToOfferToUsers: ArtifactVisibilitySettingsGroup = new ArtifactVisibilitySettingsGroup();
    public uploader: { username: string } | undefined;
    // this is the raw ISO date we get from the query
    private createdAt: string = "";
    private updatedAt: string = "";
    // which we parse into
    public uploadDate: Date | undefined;
    public updateDate: Date | undefined;
    // conceptually a date, but uploaded from parse server this is what it has.
    public harvestStartedAt: { iso: string } | undefined;
    public importedBookSourceUrl?: string;
    // todo: We need to handle limited visibility, i.e. by country
    public ePUBVisible: boolean = false;

    public languages: ILanguage[] = [];

    // Make various changes to the object we get from parse server to make it more
    // convenient for various BloomLibrary uses.
    public finishCreationFromParseServerData(bookId: string): void {
        // Enhance: possibly we can get this from the data object we got from parse?
        this.id = bookId;
        // this is kind of a dummy thing just so that I have something to show in the log, and to trigger
        // UI that would show if there was a problem.
        switch (this.harvestState) {
            case "New":
                this.harvesterLog =
                    "Warning: this book has not yet been harvested.";
                break;
            case "Updated":
                this.harvesterLog =
                    "Warning: this book was re-uploaded and is now waiting to be harvested";
                break;
            default:
                this.harvesterLog = "";
        }
        // ParseServer considers the book's level to be one of its tags.
        // But it's more convenient for (e.g.) the AdminPanel UI to make level
        // a distinct property.
        if (this.tags) {
            for (let i = 0; i < this.tags.length; i++) {
                const tag: string = this.tags[i];
                const parts = tag.split(":");
                if (parts.length !== 2) {
                    continue;
                }
                if (parts[0].trim() === "level") {
                    this.level = parts[1].trim();
                    this.tags.splice(i, 1);
                    break;
                }
            }
        }

        // todo: parse out the dates, in this YYYY-MM-DD format (e.g. with )
        this.uploadDate = new Date(Date.parse(this.createdAt));
        this.updateDate = new Date(Date.parse(this.updatedAt as string));

        //TODO: this is just experimenting with the logic, but what we need
        // is 1) something factored out so we don't have to repeat for each artifact type
        // 2) a way that the ArtifactVisibility panel actually changes some mobx-observed
        // value on this class, which will cause the Detail View to re-render and thus
        // give the user (be it the uploader or staff member) instant feedback on what
        // changing settings will do.
        if (
            this.artifactsToOfferToUsers &&
            this.artifactsToOfferToUsers[ArtifactType.epub]
        ) {
            const x = this.artifactsToOfferToUsers[ArtifactType.epub];
            if (x?.user !== undefined) {
                this.ePUBVisible = x.user;
            } else if (x?.librarian !== undefined) {
                this.ePUBVisible = x.librarian;
            } else if (x?.harvester !== undefined) {
                this.ePUBVisible = x.harvester;
            } else this.ePUBVisible = true;
        }
    }

    public saveAdminDataToParse() {
        // In finishCreationFromParseServerData(), we stripped level out of tags
        // now we want to put it back in the version we send to Parse if it exists
        const tags = [...this.tags];
        if (this.level) {
            tags.push("level:" + this.level);
        }

        updateBook(this.id, {
            tags,
            summary: this.summary,
            librarianNote: this.librarianNote
        });
    }

    public saveArtifactVisibilityToParseServer() {
        updateBook(this.id, { show: this.artifactsToOfferToUsers });
    }
}
