// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { ThemeForLocation } from "./pages/ThemeForLocation";
import Container from "@material-ui/core/Container";
import useAxios from "@use-hooks/axios";
import { BlorgMarkdown } from "./markdown/BlorgMarkdown";
import { FormattedMessage } from "react-intl";

export const ReleaseNotes: React.FunctionComponent<{ channel: string }> = (
    props
) => {
    const { response, error, loading } = useAxios({
        url: `https://s3.amazonaws.com/versions.bloomlibrary.org/${props.channel}.ReleaseNotes.md`,
        method: "GET",
        trigger: props.channel,
    });

    return (
        <Container maxWidth="md">
            <ThemeForLocation urlKey={"create"}>
                <h1
                    css={css`
                        font-size: 2rem;
                    `}
                >
                    <FormattedMessage
                        id="Release Notes"
                        defaultMessage="Release Notes"
                    />
                </h1>
                {loading && (
                    <h2>
                        <FormattedMessage
                            id="loading"
                            defaultMessage="Loading..."
                        />
                    </h2>
                )}
                {error && (
                    <h2>
                        <FormattedMessage id="error" defaultMessage="Error" />
                    </h2>
                )}
                {/* Release notes themselves cannot be translated, at this time */}
                {response?.data && <BlorgMarkdown markdown={response?.data} />}
            </ThemeForLocation>
        </Container>
    );
};
