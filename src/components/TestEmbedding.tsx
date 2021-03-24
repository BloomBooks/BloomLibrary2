import css from "@emotion/css/macro";
import React, { useEffect } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
import Container from "@material-ui/core/Container";
/** @jsx jsx */

export const TestEmbeddingPage: React.FunctionComponent<{ code: string }> = (
    props
) => {
    console.log("code:" + props.code);
    useEffect(() => {
        let embedScriptRoot = "https://share.bloomlibrary.org/assets";
        if (window.location.hostname === "localhost")
            embedScriptRoot = window.origin;
        if (window.location.hostname.startsWith("alpha"))
            embedScriptRoot = "https://share.bloomlibrary.org/alpha-assets";

        const script = document.createElement("script");

        script.src = `${embedScriptRoot}/embed-bloomlibrary.js`;
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const iframeRoot =
        window.location.hostname === "localhost"
            ? "http://" + window.location.host
            : "https://" + window.location.host;

    const iframeSrc =
        `${iframeRoot}/${props.code}` +
        (props.code === "education-for-life-org"
            ? "?bl-domain=mytalkingbooks.org"
            : "");
    const badUrl = !props.code || props.code.split("/").length < 1;
    return (
        <Container
            css={css`
                height: 100%;
            `}
        >
            {(badUrl && (
                <div>
                    <h1>
                        To use this test embedding page, you need to add the
                        Contentful "Collection" Key of the embedding. E.g., your
                        URL should look like:
                    </h1>
                    <a
                        href="/test-embedding/education-for-life-org"
                        target="_blank"
                    >
                        /test-embedding/education-for-life-org
                    </a>
                    <br />
                    <a href="/test-embedding/chetana" target="_blank">
                        /test-embedding/chetana
                    </a>
                    <br></br>
                    <a href="/test-embedding/turka" target="_blank">
                        /test-embedding/turka
                    </a>
                    <br></br>
                    <a href="/test-embedding/sil-lead" target="_blank">
                        /test-embedding/sil-lead
                    </a>
                </div>
            )) || (
                <div
                    css={css`
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
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
                                a {
                                    color: white;
                                }
                            `}
                        >
                            {"iframe is pointing at "}
                            <a
                                href={iframeSrc}
                                target={"_blank"}
                                rel="noopener noreferrer"
                            >
                                {iframeSrc}
                            </a>
                        </div>

                        <div
                            css={css`
                                margin-left: 5px;
                                margin-top: 1em;
                            `}
                        >
                            {
                                "Important: a real test requires clicking the above url making sure the new tab shows the same thing."
                            }
                        </div>
                    </div>
                    <iframe
                        id="bloomlibrary"
                        src={iframeSrc}
                        title="embed test"
                        style={{ flexGrow: 1 }}
                        // both of these are needed to handle older and newer browsers
                        allow="fullscreen"
                        allowFullScreen={true}
                    ></iframe>
                </div>
            )}
        </Container>
    );
};
