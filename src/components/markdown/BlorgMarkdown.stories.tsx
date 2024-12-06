import { BlorgMarkdown } from "./BlorgMarkdown";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof BlorgMarkdown> = {
    component: BlorgMarkdown,
};

export default meta;
type Story = StoryObj<typeof BlorgMarkdown>;

export const MarkdownHello: Story = {
    args: {
        markdown: `**Hello**, world!`,
    },
};

export const MarkdownWithBookCards: Story = {
    args: {
        markdown: `With \`<BookCards>2kC3MzBcrv</BookCards>\`, we can show multiple cards:
<BookCards>2kC3MzBcrv</BookCards>

With \`<BookCards>iaDIPe26vp 2kC3MzBcrv, tGgzjvnG5v</BookCards>\`, we can show multiple cards:
<BookCards>iaDIPe26vp 2kC3MzBcrv, tGgzjvnG5v</BookCards>

Id eiusmod velit cupidatat qui enim esse esse nostrud. In eiusmod nisi amet culpa Lorem laborum ut ipsum anim minim esse. Qui adipisicing aute magna incididunt. Laborum eiusmod reprehenderit quis qui amet qui mollit officia. Dolor commodo esse laborum cupidatat culpa.
`,
    },
};
