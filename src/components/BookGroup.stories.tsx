import type { Meta, StoryObj } from "@storybook/react";
import { BookGroup } from "./BookGroup"; // Adjust the import path as needed

const meta: Meta<typeof BookGroup> = {
    component: BookGroup,
    title: "Components/BookGroup",
};

export default meta;

type Story = StoryObj<typeof BookGroup>;

export const Featured: Story = {
    args: {
        title: "Featured Shell Books You Can Translate",
        filter: { bookshelf: "Featured" },
    },
};

export const SignLanguage: Story = {
    args: {
        title: "Sign Language",
        filter: { feature: "signLanguage" },
    },
};

export const Accessible: Story = {
    args: {
        title: "Visually Impaired",
        filter: { feature: "visuallyImpaired" },
    },
};

export const AllBooksByDate: Story = {
    args: {
        title: "All books by date",
        filter: {},
        order: "-createdAt",
    },
};

export const MathBooks: Story = {
    args: {
        title: "Math Books",
        filter: { topic: "Math" },
    },
};

export const ThaiBooks: Story = {
    args: {
        title: "Thai books",
        filter: { language: "th" },
    },
};
