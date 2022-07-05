import { css } from "@emotion/react";

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
        <Container
            maxWidth="md"
            css={css`
                img {
                    max-width: 100%;
                }
            `}
        >
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
