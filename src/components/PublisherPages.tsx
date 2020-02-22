import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { StandardPublisherGroups } from "./StandardPublisherGroups";
import { ExternalLink } from "./banners/Banners";

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
                filter={filter}
                bannerImageUrl={`https://share.bloomlibrary.org/category-images/African Storybook.png`}
                collectionDescription={description}
            />

            <StandardPublisherGroups filter={filter} />
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
                filter={filter}
                bannerImageUrl={`https://share.bloomlibrary.org/category-images/Pratham-banner.jpg`}
                collectionDescription={description}
            />
            <StandardPublisherGroups filter={filter} />
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
                filter={filter}
                bannerImageUrl={`https://share.bloomlibrary.org/category-images/Book Dash.png`}
                collectionDescription={description}
            />

            <StandardPublisherGroups filter={filter} />
        </div>
    );
};
