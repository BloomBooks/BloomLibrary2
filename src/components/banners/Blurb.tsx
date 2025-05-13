import { css } from "@emotion/react";
import React, { useContext } from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ICollection, IBanner } from "../../model/ContentInterfaces";
import { ButtonRow } from "../ButtonRow";
import { CollectionLabel } from "../../localization/CollectionLabel";
import { BlorgMarkdown } from "../markdown/BlorgMarkdown";
import { useIntl } from "react-intl";
import { OSFeaturesContext } from "../OSFeaturesContext";

export const Blurb: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    width?: string;
    padding?: string;
    hideTitle: boolean;
}> = (props) => {
    const l10n = useIntl();
    return (
        <div
            css={css`
                //flex-grow: 2;
                display: flex;
                flex-direction: column;
                color: white;
                width: ${props.width};
                padding: ${props.padding};
            `}
        >
            {props.hideTitle || <BannerTitle {...props} />}

            <div
                css={css`
                    font-weight: normal;
                    max-width: 600px;
                    overflow: hidden auto; // 'hidden' for x; 'auto' for y
                `}
            >
                {props.banner.description && (
                    <BlorgMarkdown
                        markdown={l10n.formatMessage({
                            id: "banner.description." + props.banner.title,
                            defaultMessage: props.banner.description,
                        })}
                    />
                )}
            </div>
            <div
                css={css`
                    margin-top: auto;
                    margin-bottom: 5px;
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                `}
            >
                {props.banner.buttonRow && (
                    <ButtonRow collection={props.banner.buttonRow.fields} />
                )}
            </div>
        </div>
    );
};

export const BannerTitle: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    width?: string;
    padding?: string;
    hideTitle: boolean;
    className?: string;
}> = (props) => {
    const l10n = useIntl();
    let bannerTitle: React.ReactNode;

    const { mobile } = useContext(OSFeaturesContext);

    // e.g. we have collection with titles [Default banner], [Default topic banner], [Default Language Banner].
    if (props.banner.title.startsWith("[Default")) {
        // enhance: move to IBanner.useCollectionLabel
        if (props.collection?.label) {
            bannerTitle = (
                <CollectionLabel
                    collection={props.collection}
                ></CollectionLabel>
            );
        }
        // Currently we don't have a way (or plans) to translate rich text titles
        if (props.collection?.richTextLabel) {
            bannerTitle = documentToReactComponents(
                props.collection.richTextLabel
            );
        }
    } else {
        const isLanguageCollection =
            (props.collection.urlKey ?? "").indexOf("language:") >= 0;
        let label = l10n.formatMessage({
            // NB: the format of this id come from the azure function that reads contenful and writes to crowdin
            id: "banner." + props.banner.title,
            defaultMessage: props.banner.title,
        });
        if (isLanguageCollection) {
            label = l10n.formatMessage(
                { id: "booksTitle", defaultMessage: "{langName} books" },
                { langName: label }
            );
        }
        bannerTitle = <React.Fragment>{label}</React.Fragment>;
    }

    return (
        (!props.hideTitle && (
            <h1
                css={css`
                    font-size: ${mobile ? 24 : 36}px;
                    margin-top: 0;
                    /*flex-grow: 1; // push the rest to the bottom*/
                    // For the sake of uniformity, the only styling we allow in richTextLabel is normal, h1, h2, and h3.
                    // Here we define what they will look like. H1 continues to get the default
                    // 36px we use for plain labels. (Review: or, make H2 that, and let H1 be a way to get bigger?)
                    h1 {
                        font-size: ${mobile
                            ? 18
                            : 36}px; // rich text will produce an h1 nested inside the h1 above.
                    }
                    h2 {
                        font-size: 32px;
                        font-weight: 500; // our master style sheet makes H1 this, don't want h2 bolder
                    }
                    h3 {
                        font-size: 28px;
                        font-weight: 500;
                    }
                    p {
                        font-size: 24px;
                    }
                `}
                className={props.className} // support css
            >
                {bannerTitle}
            </h1>
        )) || <React.Fragment />
    );
};
