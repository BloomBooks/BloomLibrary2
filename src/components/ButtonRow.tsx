import { css } from "@emotion/react";

import React from "react";
import { ICollection } from "../model/ContentInterfaces";

import { Button } from "@material-ui/core";
import { commonUI } from "../theme";
import { getUrlForTarget } from "./Routes";
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

                //NB: this gives a console error. But what works for other people in 2019,
                // https://github.com/mui-org/material-ui/issues/15823 and https://github.com/mui-org/material-ui/issues/15171
                // does not compile here in June 2020
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
                    span,
                    // Adding "span font" here is a quick hack to fix a problem Google Translate introduces
                    // where the text ends up white on a white button.
                    span font {
                        font-weight: 600;
                        color: ${commonUI.colors
                            .resourcesAreaTextOnWhite} !important;
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
                list-style: none;
                padding: 0;
            `}
        >
            {buttons}
        </ul>
    );
};
