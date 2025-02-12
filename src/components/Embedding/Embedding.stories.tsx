import { Meta } from "@storybook/react";

export default {
    title: "Embedding",
} as Meta;

/* Note, this doesn't test what you get if you also add embed-bloomlibrary.js to your html file. (I.e. can't bookmark and such.)
Just load EmbeddingTest.htm in a browser to test that. */
export const EmbedRisePNG = () => (
    <iframe
        // Note, this requires a Contentful Embedded Settings object with key "embed-rise-png"
        // object that authorizes the rise-png collection. If that changes, you'll get an error here.
        src="https://embed.bloomlibrary.org/rise-png"
        title="embed test"
        height="600px"
        width="600px"
        // Both of these are needed to handle older and newer browsers
        allow="fullscreen"
        allowFullScreen={true}
    />
);
