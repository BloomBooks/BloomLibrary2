import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";

import React from "react";
export const commonUI = {
    colors: {
        bloomRed: "#D65649",
        // would prefer "#1d94a4", but insufficient contrast for text on white according to accessibility rules.
        // Got this color by reducing the "V" value in the HSV equivalent of "#1d94a4"
        // from 64 to 56, which according to https://juicystudio.com/services/luminositycontrastratio.php#specify
        // yields a contrast ratio of 4.58.
        bloomBlue: "#1a818f",
        bloomBlueTransparent: "#1d94a438",
        dialogTopBottomGray: "#F1F3F4",
        creationArea: "#509E2F", // this is the SIL Intl green
        createAreaTextOnWhite: "#226B04", // a bit darker for contrast
        minContrastGray: "#767676", // lightest grey that is accessible on white background"
        disabledIconGray: "#DDD",
    },

    // Some of these aren't very global, but this is a convenient place to put
    // constants shared by various components to keep them consistent
    cheapCardMarginBottomInPx: 10,
    bookGroupTopMarginPx: 30,
    bookCardHeightPx: 200,

    detailViewMargin: "1em",
    detailViewMainButtonWidth: "250px",
    detailViewMainButtonHeight: "80px",
    detailViewBreakpointForTwoColumns: "540px",
};

// lots of examples: https://github.com/search?q=createMuiTheme&type=Code
const theme = createMuiTheme({
    palette: {
        primary: { main: commonUI.colors.bloomRed },
        secondary: {
            main: commonUI.colors.bloomBlue,
            light: commonUI.colors.bloomBlueTransparent,
        },
        warning: { main: "#F3AA18" },
        info: { main: "#1d94a4" },
    },
    // typography: {
    //     fontSize: 12,
    //     fontFamily: ["NotoSans", "Roboto", "sans-serif"].join(",")
    // },
    props: {
        // MuiLink: {
        //     variant: "body1" // without this, they come out in times new roman :-)
        // },
        // MuiTypography: {
        //     variantMapping: {
        //         h6: "h1"
        //     }
        // }
    },
    overrides: {
        // MuiOutlinedInput: {
        //     input: {
        //         padding: "7px"
        //     }
        // },
        MuiDialog: {
            paper: {
                padding: "24px",
            },
        },
        MuiDialogTitle: {
            root: {
                // we're using the padding on the enclosing dialog-paper instead, so that everything on the edge is consistent distance from the edge.
                padding: 0,
            },
        },
        MuiDialogContent: {
            root: {
                // we're using the padding on the enclosing dialog-paper instead, so that everything on the edge is consistent distance from the edge.
                paddingLeft: 0,
                paddingRight: 0,
            },
        },
        MuiDialogActions: {
            root: {
                // we're using the padding on the enclosing dialog-paper instead, so that everything on the edge is consistent distance from the edge.
                padding: 0,
            },
        },
        // MuiTypography: {
        //     h6: {
        //         fontSize: "1rem"
        //     }
        // }
    },
});

export default theme;

const creationPalette = {
    primary: { main: commonUI.colors.creationArea, light: "white" },
};
const creationTheme = createMuiTheme({ ...theme, palette: creationPalette });
export function CreationThemeProvider(props: any) {
    return (
        <MuiThemeProvider theme={creationTheme}>
            {props.children}
        </MuiThemeProvider>
    );
}
