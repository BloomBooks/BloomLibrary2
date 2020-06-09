import { observable, observe } from "mobx";
import {
    updateBook,
    retrieveCurrentBookData,
} from "../connection/LibraryUpdates";
import { ArtifactVisibilitySettingsGroup } from "./ArtifactVisibilitySettings";
import { ArtifactType } from "../components/BookDetail/ArtifactHelper";
import { ILanguage } from "./Language";
import { removePunctuation } from "../Utilities";
const stem = require("wink-porter2-stemmer");

export function createBookFromParseServerData(pojo: any): Book {
    const b = Object.assign(new Book(), pojo);

    // change to a more transparent name internally, and make an observable object
    b.artifactsToOfferToUsers = ArtifactVisibilitySettingsGroup.createFromParseServerData(
        pojo.show
    );

    b.allTitlesRaw = pojo.allTitles;
    b.allTitles = parseAllTitles(pojo.allTitles);
    b.languages = pojo.langPointers;
    b.finishCreationFromParseServerData(pojo.objectId);

    return b;
}

// This is basically the data object we get from Parse Server about a book.
// We can't reasonably improve the data model there, but we improve it in
// various ways as we construct this object from the Parse Server data.
export class Book {
    public id: string = "";
    //public debugInstance: number = Math.random();
    public allTitles = new Map<string, string>();
    public allTitlesRaw = "";
    public license: string = "";
    public baseUrl: string = "";
    public copyright: string = "";
    public country: string = "";
    public credits: string = "";
    public pageCount: string = "";
    public bookOrder: string = "";
    public downloadCount: number = -1;
    public harvestLog: string[] = [];
    public harvestState: string = "";
    public phashOfFirstContentImage: string = "";

    // things that can be edited on the site are observable so that the rest of the UI will update if they are changed.
    @observable public title: string = "";
    @observable public summary: string = "";
    @observable public tags: string[] = [];
    @observable public level: string = "";
    @observable public librarianNote: string = "";
    @observable public inCirculation: boolean = true;
    @observable public publisher: string = "";
    @observable public originalPublisher: string = "";
    @observable public features: string[] = [];
    @observable public bookshelves: string[] = [];

    // This scalar string format is easier for the user/UI to modify,
    // but in the database, we store it as an array of strings instead
    // StaffPanel component observes this
    @observable public keywordsText: string = "";

    // KeywordLinks component observes this
    @observable public keywords: string[] = [];
    public keywordStems: string[] = [];

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
    public getBestLevel(): string | undefined {
        if (this.level) return this.level;
        return this.getTagValue("computedLevel");
    }
    public getTagValue(tag: string): string | undefined {
        const axisAndValue = this.tags.find((t) => t.startsWith(tag + ":"));
        if (axisAndValue) {
            return axisAndValue.split(":")[1].trim();
        } else return undefined;
    }

    private updateTagsFromParseServerData(tags1: string[]) {
        const tags = [...tags1];
        for (let i = 0; i < tags.length; i++) {
            const tag: string = tags[i];
            const parts = tag.split(":");
            if (parts.length !== 2) {
                continue;
            }
            if (parts[0].trim() === "level") {
                this.level = parts[1].trim();
                tags.splice(i, 1);
                break;
            }
        }
        this.tags = tags;
    }
    // Make various changes to the object we get from parse server to make it more
    // convenient for various BloomLibrary uses.
    public finishCreationFromParseServerData(bookId: string): void {
        // Enhance: possibly we can get this from the data object we got from parse?
        this.id = bookId;

        if (this.tags) {
            this.updateTagsFromParseServerData(this.tags);
        }
        // work around https://issues.bloomlibrary.org/youtrack/issue/BL-8327 until it is fixed
        if (
            !this.phashOfFirstContentImage ||
            this.phashOfFirstContentImage.indexOf("null") > -1
        )
            this.phashOfFirstContentImage = "";

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

        // Keeping this around as an example, becuase it is helpful in debugging because you
        // can see what in the callstack changed the value.
        // observe(this, "tags", (change: any) => {
        //     console.log("Changed tags: " + change.newValue);
        // });

        Book.sanitizeFeaturesArray(this.features);

        this.keywordsText = this.getKeywordsText();
    }

    // Modifies the given array of features in place.
    // Currently, replaces "quiz" with "activity" so we can treat them the same because
    // we don't actually want a "quiz" feature. Just "activity."
    public static sanitizeFeaturesArray(features: string[]) {
        if (features?.length) {
            const indexOfQuiz = features.indexOf("quiz");
            if (indexOfQuiz > -1) {
                features.splice(indexOfQuiz, 1);
                if (!features.includes("activity")) features.push("activity");
            }
        }
    }

    public saveAdminDataToParse() {
        // In finishCreationFromParseServerData(), we stripped level out of tags
        // now we want to put it back in the version we send to Parse if it exists
        const tags = [...this.tags];
        if (this.level) {
            tags.push("level:" + this.level);
        }

        const reconstructedLanguagePointers = this.languages.map((l) => {
            return {
                __type: "Pointer",
                className: "language",
                objectId: l.objectId,
            };
        });

        [this.keywords, this.keywordStems] = Book.getKeywordsAndStems(
            this.keywordsText
        );

        updateBook(this.id, {
            tags,
            inCirculation: this.inCirculation,
            summary: this.summary?.trim(),
            librarianNote: this.librarianNote,
            bookshelves: this.bookshelves,
            publisher: this.publisher,
            originalPublisher: this.originalPublisher,
            langPointers: reconstructedLanguagePointers,
            features: this.features,
            title: this.title?.trim(),
            keywords: this.keywords,
            keywordStems: this.keywordStems,
        });
    }

    private static readonly keywordDelimiter: string = " ";
    public getKeywordsText(): string {
        if (!this.keywords) {
            return "";
        }
        return this.keywords.join(Book.keywordDelimiter);
    }

    // Returns a tuple containing first the raw keywords and then the stemmed versions of the keywords.
    // These are both string arrays with the exact same length. (Thus,the stemmed array might contain duplicate values)
    // Keywords preserve casing. keywordStems do not (they're always lowercase)
    public static getKeywordsAndStems(
        keywordsText: string
    ): [string[], string[]] {
        const keywords = this.splitKeywordsText(keywordsText);
        const keywordStems = keywords.map(Book.stemKeyword);
        return [keywords, keywordStems];
    }

    private static splitKeywordsText(keywordsText: string): string[] {
        const tokens = keywordsText.split(Book.keywordDelimiter);
        const keywords = tokens.filter((token) => token.length > 0); // Remove empty entries
        return keywords;
    }

    public static stemKeyword(keyword: string): string {
        return stem(removePunctuation(keyword.toLowerCase()));
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

    // For a check box control, we typically want to change that one thing and nothing else.
    // But it's quite possible that other things have been changed on the server.
    // For example, the user may be in grid view, open the book in a new tab,
    // make changes there, notice that system:incoming has not updated, and change it.
    // If we aren't careful, that will overwrite all the changes made in the other tab
    // with the old values we still have here.
    // To avoid this, when making such an update we fetch the most current book data
    // before changing anything.
    public async setBooleanTagAndSave(name: string, value: boolean) {
        const currentData = await retrieveCurrentBookData(this.id);
        Object.assign(this, currentData);
        this.finishCreationFromParseServerData(this.id);
        this.setBooleanTag(name, value);
        this.saveAdminDataToParse();
    }

    public getBestTitle(langISO?: string): string {
        const t = langISO ? this.allTitles.get(langISO) : this.title;
        return t || this.title; // if we couldn't get this lang out of allTitles, use the official title
    }
}

// This is used where we only have an IBasicBookInfo, not a full book, but need to get a language-specific title for the book
export function getBestBookTitle(
    defaultTitle: string,
    rawAllTitlesJson: string,
    contextLangIso?: string
): string {
    if (!contextLangIso) return defaultTitle;

    const map = parseAllTitles(rawAllTitlesJson);
    return map.get(contextLangIso) || defaultTitle;
}

function parseAllTitles(allTitlesString: string): Map<string, string> {
    const map = new Map<string, string>();
    try {
        const allTitles =
            (allTitlesString &&
                JSON.parse(
                    allTitlesString
                        // replace illegal characters that we have in allTitles with spaces
                        .replace(/[\n\r]/g, " ")
                        // now remove any extra spaces
                        .replace(/\s\s/g, " ")
                )) ||
            {};
        Object.keys(allTitles).forEach((lang) => {
            map.set(lang, allTitles[lang]);
            //console.log(`allTitles ${lang}, ${allTitles[lang]}`);
        });
    } catch (error) {
        console.error(error);
        console.error(`While parsing allTitles ${allTitlesString}`);
    }
    return map;
}
