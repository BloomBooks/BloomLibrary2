import { observable } from "mobx";
import { updateBook } from "../connection/LibraryUpdates";
import { ArtifactVisibilitySettingsGroup } from "./ArtifactVisibilitySettings";
import { ArtifactType } from "../components/BookDetail/ArtifactHelper";
import { ILanguage } from "./Language";

export function createBookFromParseServerData(pojo: any): Book {
    const b = Object.assign(new Book(), pojo);
    // change to a more transparent name internally, and make an observable object
    b.artifactsToOfferToUsers = ArtifactVisibilitySettingsGroup.createFromParseServerData(
        pojo.show
    );

    b.languages = pojo.langPointers;
    b.finishCreationFromParseServerData(pojo.objectId);
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
    public country: string = "";
    public credits: string = "";
    public pageCount: string = "";
    public bookOrder: string = "";
    public downloadCount: number = -1;
    public features: string[] = [];
    public bookshelves: string[] = [];
    public harvestLog: string[] = [];
    public harvestState: string = "";

    // things that can be edited on the site are observable so that the rest of the UI will update if they are changed.
    @observable public summary: string = "";
    @observable public tags: string[] = [];
    @observable public level: string = "";
    @observable public librarianNote: string = "";
    @observable public inCirculation: boolean = true;
    @observable public publisher: string = "";
    @observable public originalPublisher: string = "";

    @observable
    public artifactsToOfferToUsers: ArtifactVisibilitySettingsGroup = new ArtifactVisibilitySettingsGroup();
    public uploader: { username: string } | undefined;
    // this is the raw ISO date we get from the query. These dates are automatically included
    // in every real query, even when not listed in the keys list. However, they may be omitted
    // in instances created by test code, so we make the public one optional.
    private createdAt: string = "";
    public updatedAt?: string = "";
    // which we parse into
    public uploadDate: Date | undefined;
    public updateDate: Date | undefined;
    // conceptually a date, but uploaded from parse server this is what it has.
    public harvestStartedAt: { iso: string } | undefined;
    public importedBookSourceUrl?: string;
    // todo: We need to handle limited visibility, i.e. by country
    public ePUBVisible: boolean = false;

    public languages: ILanguage[] = [];

    public getHarvestLog() {
        // enhance: what does it mean if there are multiple items? Is only the last still true?
        return this.harvestLog.join(" / ");
    }
    // Make various changes to the object we get from parse server to make it more
    // convenient for various BloomLibrary uses.
    public finishCreationFromParseServerData(bookId: string): void {
        // Enhance: possibly we can get this from the data object we got from parse?
        this.id = bookId;

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
            inCirculation: this.inCirculation,
            summary: this.summary,
            librarianNote: this.librarianNote,
            bookshelves: this.bookshelves,
            publisher: this.publisher,
            originalPublisher: this.originalPublisher,
        });
    }

    public saveArtifactVisibilityToParseServer() {
        updateBook(this.id, { show: this.artifactsToOfferToUsers });
    }

    // e.g. system:Incoming
    public setBooleanTag(name: string, value: boolean) {
        const i = this.tags.indexOf(name);
        if (i > -1 && !value) {
            this.tags.splice(i, 1);
        }
        if (i < 0 && value) {
            this.tags.push(name);
        }
    }
}
