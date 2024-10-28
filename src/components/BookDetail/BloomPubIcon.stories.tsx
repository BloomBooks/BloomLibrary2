import { Meta, StoryObj } from "@storybook/react";
import { BloomPubIcon } from "./BloomPubIcon";
import { commonUI } from "../../theme";

const meta: Meta = {
    title: "Components/BloomPubIcon",
    component: BloomPubIcon,
};

export default meta;

export const Unfilled: StoryObj<typeof BloomPubIcon> = {
    args: {},
};

export const Filled: StoryObj<typeof BloomPubIcon> = {
    args: {
        fill: commonUI.colors.bloomBlue,
    },
};
