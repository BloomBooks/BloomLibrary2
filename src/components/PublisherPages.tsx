import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { LevelGroups } from "./LevelGroups";
import { ExternalLink } from "./banners/ExternalLink";
import { ListOfBookGroups } from "./ListOfBookGroups";

export const AfricanStorybookPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "African Storybook" };
    const description = (
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
    );
    return (
        <div>
            <PublisherBanner
                title="African Storybook Project"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/African Storybook.png`}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <LevelGroups filter={filter} />
            </ListOfBookGroups>
        </div>
    );
};
export const AsafeerPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "3Asafeer" };
    const description = (
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
    );
    return (
        <div>
            <PublisherBanner
                title="3Asafeer"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/Asafeer.png`}
                collectionDescription={description}
            />

            <ListOfBookGroups>
                <LevelGroups filter={filter} />
            </ListOfBookGroups>
        </div>
    );
};

export const PrathamPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Pratham" };
    const description = (
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
    );

    return (
        <div>
            <PublisherBanner
                title="Pratham - StoryWeaver"
                showTitle={true}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/Pratham-banner.jpg`}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <LevelGroups filter={filter} />
            </ListOfBookGroups>
        </div>
    );
};

export const BookDashPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Book Dash" };
    const description = (
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
    );
    return (
        <div>
            <PublisherBanner
                title="Book Dash"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/Book Dash.png`}
                collectionDescription={description}
            />

            <ListOfBookGroups>
                <LevelGroups filter={filter} />
            </ListOfBookGroups>
        </div>
    );
};
export const AsiaFoundationPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "The Asia Foundation" };
    const description = (
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
    );
    return (
        <div>
            <PublisherBanner
                title="The Asia Foundation"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/The Asia Foundation.png`}
                collectionDescription={description}
            />

            <ListOfBookGroups>
                <LevelGroups filter={filter} />
            </ListOfBookGroups>
        </div>
    );
};

export const RoomToReadPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Room to Read" };
    const description = (
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
    );
    return (
        <div>
            <PublisherBanner
                title="Room to Read"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/Room to Read.png`}
                collectionDescription={description}
            />

            <ListOfBookGroups>
                <LevelGroups filter={filter} />
            </ListOfBookGroups>
        </div>
    );
};
