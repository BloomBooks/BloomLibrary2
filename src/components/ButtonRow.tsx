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
import { Link } from "react-router-dom";

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
                // use the react-router link instead an an <a> element, so that we don't reload the page when we follow the href.
                // But ONLY for internal refs...Link will convert something like https://community.software.sil.org/c/bloom
                // into something like http://localhost:3000/https://community.software.sil.org/c/bloom and try to feed
                // it through our own router.
                component={(linkProps) =>
                    externalLink ? (
                        <a href={href} {...linkProps} />
                    ) : (
                        <Link to={href} {...linkProps} />
                    )
                }
                css={css`
                    margin-right: 10px !important;
                    &:last-of-type {
                        margin-right: 0 !important;
                    }
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
                target={externalLink ? "_blank" : undefined}
                rel="noopener noreferrer"
            >
                {b.fields.label}
            </Button>
        );
    });
    return (
        <ul
            css={css`
                margin-bottom: 0;
            `}
        >
            {buttons}
        </ul>
    );
};
