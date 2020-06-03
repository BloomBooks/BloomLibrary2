// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { ICollection } from "../model/Collections";

import { Button } from "@material-ui/core";
import { commonUI } from "../theme";
import { getUrlForTarget } from "./Breadcrumbs";

export const ButtonRow: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    if (
        !props.collection.childCollections ||
        props.collection.childCollections.length === 0
    ) {
        return null;
    }
    const childCollections = props.collection.childCollections;

    const buttons: JSX.Element[] = childCollections.map((b: any) => {
        const key = b.fields.urlKey;
        const externalLink = key.startsWith("http");
        const href = externalLink ? key : `/page/${getUrlForTarget(key)}`;

        return (
            <Button
                css={css`
                    margin-right: 10px !important;

                    background-color: white !important;
                    span {
                        font-weight: 600;
                        color: ${commonUI.colors
                            .createAreaTextOnWhite} !important;
                    }
                `}
                key={key}
                variant="contained"
                color="primary"
                href={href}
                target={externalLink ? "_blank" : undefined}
                rel="noopener noreferrer"
            >
                {b.fields.label}
            </Button>
        );
    });
    return <ul css={css``}>{buttons}</ul>;
};
