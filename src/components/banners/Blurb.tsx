import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ICollection, IBanner } from "../../model/ContentInterfaces";
import { ButtonRow } from "../ButtonRow";

export const Blurb: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    width?: string;
    padding?: string;
    hideTitle: boolean;
}> = (props) => {
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
            {props.hideTitle || <CollectionTitle {...props} />}

            <div
                css={css`
                    font-weight: normal;
                    max-width: 600px;
                    margin-bottom: 10px;
                    overflow: hidden;
                `}
            >
                {documentToReactComponents(
                    props.banner.blurb as any //actually we know it's a "Document", but that type is not exported
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
                {/* just a placeholder to push the imagecredits to the right
                 */}
                <div></div>
                {props.banner.buttonRow && (
                    <ButtonRow collection={props.banner.buttonRow.fields} />
                )}
            </div>
        </div>
    );
};

const CollectionTitle: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    width?: string;
    padding?: string;
    hideTitle: boolean;
}> = (props) => {
    let bannerTitle: React.ReactNode = (
        <React.Fragment>{props.banner.title}</React.Fragment>
    );

    // e.g. we have collection with titles [Default banner], [Default topic banner], [Default Language Banner].
    if (props.banner.title.startsWith("[Default")) {
        // enhance: move to IBanner.useCollectionLabel
        if (props.collection?.label) {
            bannerTitle = (
                <React.Fragment>{props.collection.label}</React.Fragment>
            );
        }
        if (props.collection?.richTextLabel) {
            bannerTitle = documentToReactComponents(
                props.collection.richTextLabel
            );
        }
    }
    return (
        (!props.hideTitle && (
            <h1
                css={css`
                    font-size: 36px;
                    margin-top: 0;
                    /*flex-grow: 1; // push the rest to the bottom*/
                    // For the sake of uniformity, the only styling we allow in richTextLabel is normal, h1, h2, and h3.
                    // Here we define what they will look like. H1 continues to get the default
                    // 36px we use for plain labels. (Review: or, make H2 that, and let H1 be a way to get bigger?)
                    h1 {
                        font-size: 36px; // rich text will produce an h1 nested inside the h1 above.
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
            >
                {bannerTitle}
            </h1>
        )) || <React.Fragment />
    );
};
