import React from "react";
import { storiesOf } from "@storybook/react";
import { MarkdownBookCards } from "./MarkdownBookCards";
import { BlorgMarkdown } from "./BlorgMarkdown";

storiesOf("BlorgMarkdown", module)
    .add("raw card", () => {
        return <MarkdownBookCards>9ynxtMrVxO</MarkdownBookCards>;
    })
    .add("markdown that calls for some Book Cards", () => {
        return (
            <BlorgMarkdown
                markdown={`With \`<BookCards>2kC3MzBcrv</BookCards>\`, we can show multiple cards:
<BookCards>2kC3MzBcrv</BookCards>

With \`<BookCards>iaDIPe26vp 2kC3MzBcrv, tGgzjvnG5v</BookCards>\`, we can show multiple cards:
<BookCards>iaDIPe26vp 2kC3MzBcrv, tGgzjvnG5v</BookCards>

Id eiusmod velit cupidatat qui enim esse esse nostrud. In eiusmod nisi amet culpa Lorem laborum ut ipsum anim minim esse. Qui adipisicing aute magna incididunt. Laborum eiusmod reprehenderit quis qui amet qui mollit officia. Dolor commodo esse laborum cupidatat culpa.
`}
            ></BlorgMarkdown>
        );
    });
