import { Meta, StoryObj } from "@storybook/react";
import { ReadBookPageCodeSplit } from "../ReadBookPageCodeSplit";
import BookDetail from "./BookDetail";

const meta: Meta<typeof BookDetail> = {
    component: BookDetail,
    title: "BookDetail",
};

export default meta;
type Story = StoryObj<typeof BookDetail>;

export const BeautifulDay: Story = {
    args: {
        id: "p2VXl7tZ2D",
    },
};

export const LookAtTheAnimals: Story = {
    args: {
        id: "ORB2KVJDgT",
    },
};
