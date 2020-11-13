import css from "@emotion/css/macro";
import React, { useEffect } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

export const TestEmbeddingPage: React.FunctionComponent<{ code: string }> = (
    props
) => {
    console.log("code:" + props.code);
    const s3location = window.location.hostname.startsWith("alpha")
        ? "https://share.bloomlibrary.org/alpha-assets"
        : "https://share.bloomlibrary.org/assets";
    const root =
        window.location.hostname === "localhost"
            ? "http://" + window.location.host
            : s3location;
    useEffect(() => {
        const script = document.createElement("script");

        script.src = `${root}/embed-bloomlibrary.js`;
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [root]);
    const iframeSrc = `${root}/${props.code}`;
    const badUrl = !props.code || props.code.split("/").length < 1;
    return (
        (badUrl && (
            <h1>
                To use this test embedding page, you need to add the Contentful
                "Collection" Key of the embedding. E.g., your URL should look
                like "http://localhost:3000/test-embedding/chetana"
            </h1>
        )) || (
            <div
                css={css`
                    height: 100%;
                `}
            >
                <div
                    css={css`
                        background-color: blue;
                        color: white;
                    `}
                >
                    <div
                        css={css`
                            font-size: 72px;
                        `}
                    >
                        Embed Test
                    </div>
                    <div
                        css={css`
                            margin-left: 5px;
                        `}
                    >
                        {"iframe is pointing at " + iframeSrc}
                    </div>

                    <div
                        css={css`
                            margin-left: 5px;
                            margin-top: 1em;
                        `}
                    >
                        {
                            "Important: a real test requires copying the url to a new tab and making sure it shows the same thing."
                        }
                    </div>
                </div>
                <iframe
                    id="bloomlibrary"
                    src={iframeSrc}
                    title="embed test"
                    height="100%"
                    width="100%"
                    // both of these are needed to handle older and newer browsers
                    allow="fullscreen"
                    allowFullScreen={true}
                ></iframe>
            </div>
        )
    );
};
