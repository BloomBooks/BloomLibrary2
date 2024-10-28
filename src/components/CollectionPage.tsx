// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React, { useMemo, useState } from "react";

import { ContentfulBanner } from "./banners/ContentfulBanner";
import { useGetCollection } from "../model/Collections";
import { CardGroup } from "./CardGroup";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LanguageGroup } from "./LanguageGroup";

import { useTrack } from "../analytics/Analytics";
import { IEmbedSettings } from "../model/ContentInterfaces";
import { getCollectionAnalyticsInfo } from "../analytics/CollectionAnalyticsInfo";
import { useIntl } from "react-intl";
import { useGetLocalizedCollectionLabel } from "../localization/CollectionLabel";
import { PageNotFound } from "./PageNotFound";
import { useResponsiveChoice } from "../responsiveUtilities";
import { CollectionLayout } from "./CollectionLayout";
import { DownloadBundleButton } from "./banners/DownloadBundleButton";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { readerPadding } from "./banners/ReaderBannerLayout";
import {
    useAppHostedCollectionLabel,
    useIsAppHosted,
} from "./appHosted/AppHostedUtils";
import { AlphaTilesButton } from "./AlphaTilesButton";

const kLeftMarginOnCollectionPages = "20px";

export const CollectionPage: React.FunctionComponent<{
    collectionName: string;
    embeddedSettings?: IEmbedSettings;
}> = (props) => {
    const l10n = useIntl();
    const getResponsiveChoice = useResponsiveChoice();
    // remains empty (and unused) except in byLanguageGroups mode, when a callback sets it.
    const [booksAndLanguages, setBooksAndLanguages] = useState("");
    const { collection, loading } = useGetCollection(props.collectionName);
    const { params, sendIt } = getCollectionAnalyticsInfo(collection);
    const localizedLabel = useGetLocalizedCollectionLabel(collection);
    const location = useLocation();

    // generated collections (topics, language) fill in a good title
    let title = collection?.title
        ? collection?.title
        : // enhance: ideally, we'd want localizedLabel + "books", also localized (with correct word order)
          localizedLabel;
    // Review: should we make this a prop instead? And pass all the way down from router?
    const appHostedMode = useIsAppHosted();
    const label = useAppHostedCollectionLabel(
        collection?.label,
        [], // root page has no filters
        appHostedMode
    );
    if (appHostedMode) {
        // We want a very specific title for language collections when app-hosted (BL-11254)
        title = l10n.formatMessage(
            {
                id: "appHosted.getMoreBooks",
                defaultMessage: "Get more {label} books",
            },
            { label }
        );
    }

    useTrack("Open Collection", params, sendIt);

    // We seem to get some spurious renders of CollectionPage (at least one extra one on the home page)
    // where nothing significant has changed. Keeping the results in a memo saves time.
    const result = useMemo(() => {
        if (loading) {
            // Typically the display of a collection fills the screen, pushing the footer off the bottom.
            // Until we have a collection, we can't make much of a guess how big its display should be,
            // but a very large guess like this prevents the footer flashing in and out of view.
            return <div style={{ height: "2000px" }}></div>;
        }

        if (!collection) {
            return <PageNotFound />;
        }
        const collectionRows = collection.childCollections.map(
            (childCollection) => {
                if (childCollection.urlKey === "language-chooser") {
                    return <LanguageGroup key="lang" />;
                }

                // Ref BL-10063.
                const rows = collection.expandChildCollectionRows ? 1000 : 1;

                return (
                    <CardGroup
                        key={childCollection.urlKey}
                        urlKey={childCollection.urlKey}
                        rows={rows}
                        useCollectionLayoutSettingForBookCards={
                            collection.urlKey !== "root.read"
                        }
                    />
                );
            }
        );

        const booksComponent: React.ReactElement | null = (
            <CollectionLayout
                collection={collection}
                setBooksAndLanguagesCallback={setBooksAndLanguages}
            />
        );

        const banner = (
            <ContentfulBanner
                id={collection.bannerId}
                collection={collection}
                filter={collection.filter}
                bookCount={
                    // if not by-language, we want this to be undefined, which triggers the usual
                    // calculation of a book count using the filter. If it IS by-language,
                    // we want an empty string until we have a real languages-and-books count,
                    // so we don't waste a query (and possibly get flicker) trying to compute
                    // the filter-based count.
                    collection.layout.startsWith("by-language")
                        ? booksAndLanguages
                        : undefined
                }
            />
        );

        return (
            <div>
                <Helmet>
                    <title>{title}</title>
                    <meta
                        name="Description"
                        // enhance: what should we do about localizing?
                        content={collection.metaDescription}
                    />
                    <link
                        rel="canonical"
                        // trying to avoid having search engines consider this canonical: https://bloomlibrary.org/#!/language:tpi
                        href={document.location.origin + location.pathname}
                    />
                </Helmet>
                {!!props.embeddedSettings || banner}
                {/* This is used (at least) for PNG collections where they host a bloombundle and then provide a link to it in the description. See  http://localhost:3000/PNG-EERRP/PNG-EERRP-SJ-S2*/}
                {collection.urlForBloomPubBundle && (
                    <span
                        css={css`
                            margin-left: ${kLeftMarginOnCollectionPages};
                            display: block;
                        `}
                    >
                        <DownloadBundleButton
                            url={collection.urlForBloomPubBundle}
                        >
                            {l10n.formatMessage({
                                id: "banner.downloadAllBloomPUBsToBloomReader",
                                defaultMessage:
                                    "Download this set of books to Bloom Reader",
                            })}
                        </DownloadBundleButton>
                    </span>
                )}
                {/* At the moment we don't have an example of this */}
                {collection.urlForBloomSourceBundle && (
                    <span
                        css={css`
                            margin-left: ${kLeftMarginOnCollectionPages};
                            display: block;
                        `}
                    >
                        <DownloadBundleButton
                            url={collection.urlForBloomSourceBundle}
                        >
                            {l10n.formatMessage({
                                id: "banner.downloadAllShellsToBloomEditor",
                                defaultMessage:
                                    "Download this set of shellbooks for translating in Bloom Editor",
                            })}
                        </DownloadBundleButton>
                    </span>
                )}

                {collection.urlForAlphaTiles && (
                    <div
                        css={css`
                            margin-top: 10px;
                            margin-left: ${kLeftMarginOnCollectionPages};
                            display: block;
                        `}
                    >
                        <AlphaTilesButton
                            languageName={collection.label}
                            url={collection.urlForAlphaTiles}
                        />
                    </div>
                )}
                {/* This is the main content of the collection page */}

                <ListOfBookGroups
                    // tighten things up a bit in a view designed for a phone.
                    css={css`
                        ${appHostedMode
                            ? "padding-left: " +
                              readerPadding +
                              " !important; margin-block-start: 0"
                            : ""}
                    `}
                >
                    {collectionRows}
                    {booksComponent}

                    {collection.sponsorshipImage && (
                        <div
                            css={css`
                                margin-bottom: 2em;
                            `}
                        >
                            <h1
                                css={css`
                                    font-size: ${getResponsiveChoice(10, 14)}pt;
                                    margin-bottom: 5px;
                                `}
                            >
                                {l10n.formatMessage({
                                    id: "sponsorshipHeading",
                                    defaultMessage:
                                        "This project was supported by",
                                })}
                            </h1>
                            {/* Note: the spacing that looks right here really depends on whether there is
                            one or multiple rows in the sponsorship image. If one row, the 5px is fine. But
                            if multiple rows, well USAID requires a huge space all around, and then a much
                            bigger spacing on top looks good. That spacing has to be added to the image when
                            it is uploaded to Contentful, as we don't know from here. See Begin with Books Mali for example. */}
                            <img
                                src={collection.sponsorshipImage.url}
                                alt={"sponsor logos"}
                                css={css`
                                    max-height: ${getResponsiveChoice(
                                        75,
                                        100
                                    )}%;
                                    max-width: 90vw;
                                `}
                            ></img>
                        </div>
                    )}
                </ListOfBookGroups>
            </div>
        );
    }, [
        booksAndLanguages,
        collection,
        getResponsiveChoice,
        l10n,
        loading,
        props.embeddedSettings,
        title,
        location.pathname,
        appHostedMode,
    ]);
    return result;
};
