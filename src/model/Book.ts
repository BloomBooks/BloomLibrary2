import { observable } from "mobx";
import { updateBook } from "../connection/LibraryUpdates";
import { ArtifactVisibilitySettings } from "./ArtifactVisibilitySettings";

export function createBookFromParseServerData(
    pojo: object,
    bookId: string
): Book {
    const b = Object.assign(new Book(), pojo);
    // just change to a more transparent name internally
    b.artifactsToOfferToUsers = (pojo as any).show;
    b.finishCreationFromParseServerData(bookId);
    return b;
}

// This is basically the data object we get from Parse Server about a book.
// We can't reasonably improve the data model there, but we improve it in
// various ways as we construct this object from the Parse Server data.
export class Book {
    public id: string = "";
    public title: string = "";
    @observable public summary: string = "";
    public license: string = "";
    public baseUrl: string = "";
    public copyright: string = "";
    public credits: string = "";
    public pageCount: string = "";
    @observable public tags: string[] = [];
    public features: string[] = [];
    public harvesterLog: string = "";
    public harvestState: string = "";
    @observable public level: string = "";
    public artifactsToOfferToUsers: {
        pdf: ArtifactVisibilitySettings | undefined;
        epub: ArtifactVisibilitySettings | undefined;
        bloomReader: ArtifactVisibilitySettings | undefined;
        readOnline: ArtifactVisibilitySettings | undefined;
    } = {
        pdf: undefined,
        epub: undefined,
        bloomReader: undefined,
        readOnline: undefined
    };
    public uploadDate: string = "";
    public updateDate: string = "";
    @observable public librarianNote: string = "";

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
        this.uploadDate = "2020/1/30";
        this.updateDate = "2020/2/23";
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
