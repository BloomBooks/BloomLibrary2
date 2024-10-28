import { Meta } from "@storybook/react";
import { ConfirmationDialog } from "./ConfirmationDialog";

const meta: Meta = {
    title: "Components/ConfirmationDialog",
    component: ConfirmationDialog,
    argTypes: {
        open: { control: "boolean" },
    },
};

export default meta;

export const Default = (args: { open: boolean }) => (
    <ConfirmationDialog
        title="Delete this book?"
        open={args.open}
        onClose={(confirm: boolean) => {
            if (confirm) alert("confirmed");
        }}
    >
        If you continue, this version of the book will be removed from
        BloomLibrary.org. There is no way to undo this except by uploading it
        again.
    </ConfirmationDialog>
);

Default.args = {
    open: true,
};
