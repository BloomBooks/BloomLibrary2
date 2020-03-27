import React from "react";

import { storiesOf, addDecorator } from "@storybook/react";

import { BookCard } from "../components/BookCard";
import { BookGroup } from "../components/BookGroup";
import { LanguageGroup } from "../components/LanguageGroup";
import { LanguagePage, BookGroupForEachTopic } from "../components/Pages";
import { HomePage } from "../components/HomePage";
import { BookshelfGroup } from "../components/BookShelfGroup";
import { SearchBox } from "../components/SearchBox";
import "../index.css";
import { StandAloneHarvesterArtifactUserControl } from "../components/BookDetail/ArtifactVisibilityPanel/ArtifactVisibilityPanel";
import { ArtifactAndChoice } from "../components/BookDetail/ArtifactVisibilityPanel/ArtifactAndChoice";
import { ArtifactVisibilitySettings } from "../model/ArtifactVisibilitySettings";
import { ArtifactType } from "../components/BookDetail/ArtifactHelper";
import { Router, RouterContext } from "../Router";
import BookDetail from "../components/BookDetail/BookDetail";
import { ThemeProvider } from "@material-ui/styles";
import theme from "../theme";
import { ReadBookPage } from "../components/ReadBookPage";
import { FeaturePage } from "../components/FeaturePage";
import { FeatureGroup } from "../components/FeatureGroup";
import { ListOfBookGroups } from "../components/ListOfBookGroups";

// Provide all stories with a router in their context:
const router = new Router();
addDecorator(storyFn => (
    <RouterContext.Provider value={router}>{storyFn()}</RouterContext.Provider>
));
addDecorator(storyFn => (
    <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>
));
const sampleUrl =
    "https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org%2f32916f6b-02bd-4e0b-9b2b-d971096259b7%2fGrandpa+Fish+and+the+Radio%2f";

storiesOf("BookDetail", module)
    .add("Beautiful Day", () => <BookDetail id={"lhQnYpvD9p"} />)
    .add("ReadBookPage", () => (
        <ReadBookPage
            id={
                // this is "the women who married bats" from dev.bloomlibrary.org
                "0oh7hURGtT"
            }
        />
    ));
storiesOf("BookCard", module).add("simple", () => {
    const book = {
        title: "Grandpa Fish and the Radio",
        objectId: "6rvW9OSAe9",
        baseUrl: sampleUrl,
        languages: [
            {
                name: "English",
                englishName: "English",
                isoCode: "en",
                usageCount: 3
            },
            {
                name: "Francais",
                englishName: "French",
                isoCode: "fr",
                usageCount: 3
            },
            {
                name: "Deutsch",
                englishName: "German",
                isoCode: "de",
                usageCount: 3
            }
        ],
        tags: ["level:2"],
        features: [
            "motion",
            "talkingBook",
            "talkingBook:en",
            "talkingBook:fr",
            "blind",
            "blind:en",
            "activity",
            "comic"
        ],
        license: "",
        copyright: "",
        pageCount: "",
        createdAt: ""
    };

    return <BookCard handleYourOwnLaziness={false} onBasicBookInfo={book} />;
});
storiesOf("BookGroup", module)
    .add("Featured", () => (
        <BookGroup
            title="Featured Shell Books You Can Translate"
            filter={{ otherTags: "bookshelf:Featured" }}
        />
    ))
    .add("All Topics", () => (
        <BookGroupForEachTopic filter={{ language: "th" }} />
    ))

    .add("Sign Language", () => (
        <BookGroup title="Sign Language" filter={{ feature: "signLanguage" }} />
    ))
    .add("Accessible", () => (
        <BookGroup
            title="Visually Impaired"
            filter={{ feature: "visuallyImpaired" }}
        />
    ))
    .add("All Bookshelves", () => (
        <BookshelfGroup title="All Bookshelves" bookShelfCategory="" />
    ))
    .add("All books by date", () => (
        <BookGroup title="All books by date" filter={{}} order={"-createdAt"} />
    ))
    .add("Math books", () => (
        <BookGroup title="Math Books" filter={{ topic: "Math" }} />
    ))

    .add("Thai books", () => (
        <BookGroup title="Thai books" filter={{ language: "th" }} />
    ));
storiesOf("LanguageGroup", module).add("By book count", () => (
    <ul>
        <LanguageGroup />
    </ul>
));
storiesOf("BookShelfGroup", module)
    .add("Publishers", () => (
        <BookshelfGroup title="Publishers" bookShelfCategory="publisher" />
    ))
    .add("A specific project with multiple workshops: Enabling Writers", () => (
        <BookshelfGroup
            title="Enabling Writers"
            bookShelfCategory="project"
            pathToTheCurrentLevel="Enabling Writers Workshops/"
        />
    ))
    .add("Projects", () => (
        <BookshelfGroup title="Projects" bookShelfCategory="project" />
    ))
    .add("Organizations & Governments", () => (
        <BookshelfGroup
            title="Organizations & Governments"
            bookShelfCategory="org"
        />
    ));

storiesOf("FeatureGroup", module).add("Feature Group", () => (
    <ListOfBookGroups>
        <FeatureGroup title="Book Features" />
    </ListOfBookGroups>
));

storiesOf("Pages", module)
    .add("Home Page", () => <HomePage />)
    .add("Thai Book Page", () => (
        <LanguagePage title="some title" filter={{ language: "th" }} />
    ))
    .add("Talking Book Feature Page", () => (
        <FeaturePage
            title={"Talking Books"}
            filter={{ feature: "talkingBook" }}
        />
    ))
    .add("Motion Book Feature Page", () => (
        <FeaturePage title={"Motion Books"} filter={{ feature: "motion" }} />
    ));

storiesOf("Components", module).add("SearchBox", () => {
    const bloomRed: string = theme.palette.primary.main;
    return (
        <div
            style={{
                height: "48px",
                backgroundColor: bloomRed
            }}
        >
            <SearchBox />
        </div>
    );
});

const triStateBooleanOptions = [undefined, false, true];
let i = 0;
const toTriStateString = (value: boolean | undefined) => {
    if (value === undefined) return "undefined";
    return value.toString();
};
storiesOf("Harvester Artifact Control", module)
    .add("Entire Control", () => (
        // <StandAloneHarvesterArtifactUserControl bookId="65XiBsxtYS" /> //dev
        // <StandAloneHarvesterArtifactUserControl bookId="WQvJ1kBoHE" /> //dev
        // <StandAloneHarvesterArtifactUserControl bookId="TgERGZnLVW" /> //dev
        <StandAloneHarvesterArtifactUserControl bookId="jnG2YFeIIG" /> //prod
    ))
    .add("ArtifactAndChoice", () => (
        <>
            {triStateBooleanOptions.map(user => {
                return triStateBooleanOptions.map(librarian => {
                    return triStateBooleanOptions.map(harvester => {
                        return (
                            <div key={i++} style={{ marginBottom: 15 }}>
                                <div>
                                    {`(harvester: ${toTriStateString(
                                        harvester
                                    )}, librarian: ${toTriStateString(
                                        librarian
                                    )}, user: ${toTriStateString(user)}):`}
                                </div>
                                <ArtifactAndChoice
                                    type={ArtifactType["epub"]}
                                    visibilitySettings={
                                        new ArtifactVisibilitySettings(
                                            harvester,
                                            librarian,
                                            user
                                        )
                                    }
                                    url="https://google.com"
                                    onChange={() => {}}
                                    currentUserIsUploader={false}
                                />
                            </div>
                        );
                    });
                });
            })}
        </>
    ));
