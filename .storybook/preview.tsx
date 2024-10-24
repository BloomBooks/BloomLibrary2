import React from "react";
import { Preview } from "@storybook/react";
import { ThemeProvider } from "@material-ui/core";
import theme from "../src/theme";
import { LocalizationProvider } from "../src/localization/LocalizationProvider";
import { BrowserRouter } from "react-router-dom";

// most parts of blorg rely on various contexts. This automatically wraps all stories with these contexts
const preview: Preview = {
    decorators: [
        (Story) => (
            <LocalizationProvider>
                <ThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Story />
                    </BrowserRouter>
                </ThemeProvider>
            </LocalizationProvider>
        ),
    ],
};

export default preview;
