import React, { ReactElement } from "react";
import { IFilter } from "../IFilter";
import {
    IBasicBookInfo,
    getBestLevelStringOrEmpty,
} from "../connection/LibraryQueryHooks";
import { ExternalLink } from "../components/banners/ExternalLink";

/* From original design: Each collection has
    id
    label
    child collections [ 0  or more ] (potentially ordered?)
    book query (optional)
    pageType (optional)
    banner specification (optional)
    card icon (optional)
    A (potentially ordered) set of books ←- this comes from Parse, not Contentful

    Banner
        ID
        Background Image (optional) We use the “card icon” if this is missing (e.g. all publishers)
        Image Credits
        Blurb
*/

export interface ICollection {
    key?: string; // used to look it up in router code in app; defaults to title
    title: string;
    hideTitle?: boolean;
    filter: IFilter;
    secondaryFilter?: (basicBookInfo: IBasicBookInfo) => boolean;
    pageType: string;
    homePage?: string;
    homePageText?: string; // defaults to title if needed
    logoUrl?: string;
    // descriptionLinks?: ILink[];
    // description: string[]; // one per paragraph
    blurbHardCoded?: ReactElement;
    //blurbContentfulJson: object;
    order?: string;
    // todo:
    // bannerUrl
}

export interface ILink {
    url: string;
    text: string;
}

export const collections = new Map<string, ICollection>();

export const digitalBibleLibraryLink = {
    url: "https://www.digitallibrary.io/",
    text: "Global Digital Library",
};

// currently only used for 'more'
collections.set("all", {
    title: "All books",
    filter: {},
    pageType: "unknown",
});

collections.set("African Storybook", {
    title: "African Storybook",
    hideTitle: true,
    filter: { bookshelf: "African Storybook" },
    pageType: "bylevel",
    homePage: "https://www.africanstorybook.org/",
    logoUrl:
        "https://share.bloomlibrary.org/bookshelf-images/African Storybook.png",
    blurbHardCoded: (
        <React.Fragment>
            <ExternalLink href="https://www.africanstorybook.org/">
                African Storybook
            </ExternalLink>
            's generosity allows us to host many of their books. Some of these
            books were translated using Bloom and then uploaded here. Others
            were automatically converted from the{" "}
            <ExternalLink href="https://www.digitallibrary.io/">
                Global Digital Library
            </ExternalLink>
            . All of them can be translated into your language using Bloom.
        </React.Fragment>
    ),
});

collections.set("3Asafeer", {
    title: "3Asafeer",
    hideTitle: true,
    filter: { bookshelf: "3Asafeer" },
    pageType: "bylevel",
    homePage: "https://3Asafeer.com/",
    logoUrl: "https://share.bloomlibrary.org/bookshelf-images/Asafeer.png",
    blurbHardCoded: (
        <React.Fragment>
            <ExternalLink href="https://3Asafeer.com/">3Asafeer</ExternalLink>
            's generosity allows us to host many of their books. Some of these
            books were translated using Bloom and then uploaded here. Others
            were automatically converted from the{" "}
            <ExternalLink href="https://www.digitallibrary.io/">
                Global Digital Library
            </ExternalLink>
            . All of them can be translated into your language using Bloom.
        </React.Fragment>
    ),
});

collections.set("Pratham", {
    title: "Pratham - StoryWeaver",
    key: "Pratham",
    filter: { bookshelf: "Pratham" },
    pageType: "bylevel",
    homePage: "https://prathambooks.org",
    homePageText: "Pratham Books",
    blurbHardCoded: (
        <React.Fragment>
            <ExternalLink href="https://prathambooks.org">
                Pratham Books
            </ExternalLink>{" "}
            is a non-profit publisher of children's books.
            <p>
                Pratham's generosity allows us to host many of their books. Some
                of these books were translated using Bloom and then uploaded
                here. Others were automatically converted from Pratham's{" "}
                <ExternalLink href="https://storyweaver.org.in/">
                    StoryWeaver
                </ExternalLink>{" "}
                platform or the{" "}
                <ExternalLink href="https://www.digitallibrary.io/">
                    Global Digital Library
                </ExternalLink>
                . All of them can be translated into your language using Bloom.
            </p>
        </React.Fragment>
    ),
});

collections.set("Book Dash", {
    title: "Book Dash",
    hideTitle: true,
    filter: { bookshelf: "Book Dash" },
    pageType: "bylevel",
    homePage: "https://bookdash.org/",
    logoUrl: "https://share.bloomlibrary.org/bookshelf-images/Book Dash.png",
    blurbHardCoded: (
        <React.Fragment>
            <ExternalLink href="https://bookdash.org/">Book Dash</ExternalLink>{" "}
            gathers creative volunteers to create new, African storybooks in
            just one day that anyone can freely print, translate and distribute.
            <p>
                Book Dash's generosity allows us to host many of their books.
                Some of these books were translated using Bloom and then
                uploaded here. Others were automatically converted from the{" "}
                <ExternalLink href="https://www.digitallibrary.io/">
                    Global Digital Library
                </ExternalLink>
                . All of them can be translated into your language using Bloom.
            </p>
        </React.Fragment>
    ),
});

collections.set("The Asia Foundation", {
    title: "The Asia Foundation",
    hideTitle: true,
    filter: { bookshelf: "The Asia Foundation" },
    pageType: "bylevel",
    homePage: "https://asiafoundation.org/",
    logoUrl:
        "https://share.bloomlibrary.org/bookshelf-images/The Asia Foundation.png",
    blurbHardCoded: (
        <React.Fragment>
            <ExternalLink href="https://asiafoundation.org/">
                The Asia Foundation
            </ExternalLink>{" "}
            is a nonprofit international development organization committed to
            improving lives across a dynamic and developing Asia.
            <p>
                The Asia Foundation's generosity allows us to host many of their
                books. Some of these books were translated using Bloom and then
                uploaded here. Others were automatically converted from the{" "}
                <ExternalLink href="https://www.digitallibrary.io/">
                    Global Digital Library
                </ExternalLink>
                . All of them can be translated into your language using Bloom.
            </p>
        </React.Fragment>
    ),
});

collections.set("Room to Read", {
    title: "Room to Read",
    hideTitle: true,
    filter: { bookshelf: "Room to Read" },
    pageType: "bylevel",
    homePage: "https://www.roomtoread.org/",
    logoUrl:
        "https://share.bloomlibrary.org/bookshelf-images/The Asia Foundation.png",
    // First sentence should be <i>
    blurbHardCoded: (
        <React.Fragment>
            <i>
                Founded in 2000 on the belief that World Change Starts with
                Educated Children<sup>®</sup>,{" "}
                <ExternalLink href="https://www.roomtoread.org/">
                    Room to Read
                </ExternalLink>{" "}
                is creating a world free from illiteracy and gender inequality.
                We are achieving this goal by helping children in low-income
                communities develop literacy skills and a habit of reading, and
                by supporting girls to build skills to succeed in school and
                negotiate key life decisions.
            </i>
            <p>
                Room to Read's generosity allows us to host many of their books.
                Some of these books were translated using Bloom and then
                uploaded here. Others were automatically converted from the{" "}
                <ExternalLink href="https://www.digitallibrary.io/">
                    Global Digital Library
                </ExternalLink>
                . All of them can be translated into your language using Bloom.
            </p>
        </React.Fragment>
    ),
});

collections.set("SIL LEAD", {
    title: "SIL LEAD",
    hideTitle: true,
    filter: { bookshelf: "SIL LEAD" },
    pageType: "bylevel",
    homePage: "https://www.sil-lead.org/",
    logoUrl: "https://share.bloomlibrary.org/bookshelf-images/SIL%20LEAD.png",
    blurbHardCoded: (
        <React.Fragment>
            <p>
                <ExternalLink href="https://www.sil-lead.org/">
                    SIL LEAD
                </ExternalLink>{" "}
                is a faith-based nonprofit helping local, community-based
                organizations use their own languages to improve their quality
                of life.
            </p>
        </React.Fragment>
    ),
});

collections.set("Enabling Writers Workshops", {
    title: "Enabling Writers Workshops",
    hideTitle: true,
    filter: { bookshelf: "Enabling Writers Workshops" },
    pageType: "EnablingWritersPage",
    homePage:
        "https://www.globalreadingnetwork.net/publications-and-research/enabling-writers-workshop-program-guides-and-toolkits",
    homePageText: "The Enabling Writers",
    logoUrl:
        "https://share.bloomlibrary.org/bookshelf-images/Enabling Writers Workshops.png",
    // unused, custom page...just in case we make it smarter or use it for something additional.
    blurbHardCoded: (
        <React.Fragment>
            <p>
                <ExternalLink href="https://www.globalreadingnetwork.net/publications-and-research/enabling-writers-workshop-program-guides-and-toolkits">
                    The Enabling Writers
                </ExternalLink>{" "}
                workshops (2016-2018) were sponsored by All Children Reading. In
                these workshops, teams of local writers were trained to produce
                hundreds of decodable and leveled books with content that
                reflect local children's culture and language.
            </p>
            <p>
                This initiative is an offshoot of a previous{" "}
                <ExternalLink href="https://allchildrenreading.org/competition/enabling-writers-prize/">
                    All Children Reading: A Grand Challenge for Development
                </ExternalLink>{" "}
                competition (2014-2015) to produce a book authoring software
                that can be used globally to develop books for use in early
                grade reading programs. The competition was supported by United
                States Agency for International Development, World Vision and
                the Australian government. This competition spurred us to add
                major new capabilities to Bloom, and we won the competition.
            </p>
        </React.Fragment>
    ),
});

export function getSecondaryFilterFunction(
    key: string,
    aspectValue?: string
): (basicBookInfo: IBasicBookInfo) => boolean {
    switch (key) {
        case "getBestLevelStringOrEmpty": {
            // A primary query for a particular level has given us books that have both level=level, and computedLevel=level
            // Here we drop those in which there is a level that is different than what we want, still keeping
            // books without a level in which there is still a computedLevel matching what we want.
            const level = aspectValue!.substring("level=".length);
            return (bookInfo) => getBestLevelStringOrEmpty(bookInfo) === level;
        }
        default:
            throw new Error("unexpected secondary filter function key");
    }
}
