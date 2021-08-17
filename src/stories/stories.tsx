/* NB: DON'T KEEP PILING EVERYTHING INTO HERE. Instead, make a "stories.tsx" in the folder of the components you are writing a story for. */

import React from "react";
import { storiesOf, addDecorator } from "@storybook/react";
import { withKnobs, boolean } from "@storybook/addon-knobs";

import { LocalizationProvider } from "../localization/LocalizationProvider";
import { BookCard } from "../components/BookCard";
import { BookGroup } from "../components/BookGroup";
import { LanguageGroup } from "../components/LanguageGroup";
import { SearchBox } from "../components/SearchBox";
import "../index.css";
import { StandAloneHarvesterArtifactUserControl } from "../components/BookDetail/ArtifactVisibilityPanel/ArtifactVisibilityPanel";
import { ArtifactAndChoice } from "../components/BookDetail/ArtifactVisibilityPanel/ArtifactAndChoice";
import {
    ArtifactVisibilitySettings,
    ArtifactVisibilitySettingsGroup,
} from "../model/ArtifactVisibilitySettings";
import BookDetail from "../components/BookDetail/BookDetail";
import { ThemeProvider } from "@material-ui/styles";
import theme, { commonUI } from "../theme";
import { ReadBookPageCodeSplit } from "../components/ReadBookPageCodeSplit";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { ArtifactType, Book } from "../model/Book";
import { BrowserRouter as Router } from "react-router-dom";
import { BloomPubIcon } from "../components/BookDetail/BloomPubIcon";
import { DownloadsGroup } from "../components/BookDetail/DownloadsGroup";

addDecorator(withKnobs);
addDecorator((storyFn) => (
    <LocalizationProvider>{storyFn()}</LocalizationProvider>
));
addDecorator((storyFn) => (
    <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>
));
addDecorator((storyFn) => <Router>{storyFn()}</Router>);
const sampleUrl =
    "https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org%2f32916f6b-02bd-4e0b-9b2b-d971096259b7%2fGrandpa+Fish+and+the+Radio%2f";

storiesOf("BookDetail", module)
    .add("Beautiful Day", () => <BookDetail id={"lhQnYpvD9p"} />)
    .add("Look at the Animals", () => <BookDetail id={"ORB2KVJDgT"} />)
    // .add("production test book", () => <BookDetail id={"5rWQGc1d0q"} />)
    // .add("production test book 2", () => <BookDetail id={"BviSvJYwKk"} />)
    .add("ReadBookPage", () => (
        <ReadBookPageCodeSplit
            id={
                // this is "the women who married bats" from dev.bloomlibrary.org
                "0oh7hURGtT"
            }
        />
    ));
storiesOf("BookCard", module).add("simple", () => {
    const book = {
        title: "Grandpa Fish and the Radio",
        allTitles: "",
        objectId: "6rvW9OSAe9",
        baseUrl: sampleUrl,
        languages: [
            {
                name: "English",
                englishName: "English",
                isoCode: "en",
                usageCount: 3,
                objectId: "englishnonsense",
            },
            {
                name: "Francais",
                englishName: "French",
                isoCode: "fr",
                usageCount: 3,
                objectId: "frenchnonsense",
            },
            {
                name: "Deutsch",
                englishName: "German",
                isoCode: "de",
                usageCount: 3,
                objectId: "Germannonsense",
            },
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
            "comic",
        ],
        license: "",
        copyright: "",
        pageCount: "",
        createdAt: "",
        edition: "",
    };

    return <BookCard laziness="swiper" basicBookInfo={book} />;
});
storiesOf("BookGroup", module)
    .add("Featured", () => (
        <BookGroup
            title="Featured Shell Books You Can Translate"
            filter={{ bookshelf: "Featured" }}
        />
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
storiesOf("BookShelfGroup", module);

// .add("A specific project with multiple workshops: Enabling Writers", () => (
//     <BookshelfGroup
//         title="Enabling Writers"
//         bookShelfCategory="project"
//         pathToTheCurrentLevel="Enabling Writers Workshops/"
//     />
// ))
// .add("Projects", () => (
//     <BookshelfGroup title="Projects" bookShelfCategory="project" />
// ))
// .add("Organizations & Governments", () => (
//     <BookshelfGroup
//         title="Organizations & Governments"
//         bookShelfCategory="org"
//     />
// ));

storiesOf("Pages", module);
// REview: want these back in some updated form?
//.add("Home Page", () => <HomePage />)
//.add("Thai Book Page", () => <LanguagePage langCode="th" />)
// .add("Talking Book Feature Page", () => (
//     <FeaturePage featureKey="talkingBook" />
// ))
// .add("Motion Book Feature Page", () => <FeaturePage featureKey="motion" />);

const testBook = new Book();

storiesOf("Components", module)
    .add("SearchBox", () => {
        const bloomRed: string = theme.palette.primary.main;
        return (
            <div
                style={{
                    height: "48px",
                    backgroundColor: bloomRed,
                }}
            >
                <SearchBox />
            </div>
        );
    })
    .add("Confirmation Dialog", () => {
        return (
            <ConfirmationDialog
                title={"Delete this book?"}
                open={boolean("Open", false)}
                onClose={(confirm) => {
                    if (confirm) alert("confirmed");
                }}
            >
                If you continue, this version of the book will be removed from
                BloomLibrary.org. There is no way to undo this except by
                uploading it again.
            </ConfirmationDialog>
        );
    })
    .add("BloomPubIcon -- unfilled", () => {
        return <BloomPubIcon></BloomPubIcon>;
    })
    .add("BloomPubIcon -- Bloom blue filled", () => {
        return <BloomPubIcon fill={commonUI.colors.bloomBlue}></BloomPubIcon>;
    })
    .add("DownloadsGroup", () => {
        const bloomPubAvailable = new ArtifactVisibilitySettings(
            boolean("BloomPub available?", false)
        );
        testBook.artifactsToOfferToUsers = new ArtifactVisibilitySettingsGroup();
        testBook.artifactsToOfferToUsers.bloomReader = bloomPubAvailable;
        testBook.harvestState = "Done";
        return <DownloadsGroup book={testBook}></DownloadsGroup>;
    });

const triStateBooleanOptions = [undefined, false, true];
let i = 0;
const toTriStateString = (value: boolean | undefined) => {
    if (value === undefined) return "undefined";
    return value.toString();
};
storiesOf("Harvester Artifact Control", module)
    .add("Entire Control", () => (
        <StandAloneHarvesterArtifactUserControl bookId="5gELSjYesr" />
    ))
    .add("ArtifactAndChoice", () => (
        <>
            {triStateBooleanOptions.map((user) => {
                return triStateBooleanOptions.map((librarian) => {
                    return triStateBooleanOptions.map((harvester) => {
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

/* Note, this doesn't test what you get if you also add embed-bloomlibrary.js to your html file. (I.e. can't bookmark and such.)
Just load testembed.htm in a browser to test that. */
storiesOf("Embedding", module).add("Should Work", () => (
    <iframe
        // note, this requires a ContentFul Embedded Settings object with key "embed-rise-png" object that authorizes the rise-png
        // collection. If that changes, you'll get an error here.
        src={"http://localhost:3000/rise-png"}
        title="embed test"
        height="600px"
        width="600px"
        // both of these are needed to handle older and newer browsers
        allow="fullscreen"
        allowFullScreen={true}
    ></iframe>
));
