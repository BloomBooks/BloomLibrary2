import { createMuiTheme, MuiThemeProvider, useTheme } from "@material-ui/core";

import React, { useState } from "react";
export const commonUI = {
    colors: {
        bloomRed: "#D65649",
        // would prefer "#1d94a4", but insufficient contrast for text on white according to accessibility rules.
        // Got this color by reducing the "V" value in the HSV equivalent of "#1d94a4"
        // from 64 to 56, which according to https://juicystudio.com/services/luminositycontrastratio.php#specify
        // yields a contrast ratio of 4.58.
        bloomBlue: "#1a818f",
        bloomBlueTransparent: "#1a818f38",
        dialogTopBottomGray: "#F1F3F4",
        creationArea: "#509E2F", // this is the SIL Intl green
        createAreaTextOnWhite: "#226B04", // a bit darker for contrast
        minContrastGray: "#767676", // lightest grey that is accessible on white background"
        disabledIconGray: "#DDD",
    },

    // Some of these aren't very global, but this is a convenient place to put
    // constants shared by various components to keep them consistent
    paddingForCollectionAndLanguageCardsPx: 10,
    paddingForSmallCollectionAndLanguageCardsPx: 6,

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
        info: { main: commonUI.colors.bloomBlue },
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
    // currently we're using the same color for "secondary" as for "primary", so that glow on cards is green.
    // eventually when materialui supports more names for the pallette, we can sort this out so that we just define the glow color
    secondary: { main: commonUI.colors.creationArea },
};
const creationTheme = createMuiTheme({ ...theme, palette: creationPalette });
export function CreationThemeProvider(props: any) {
    return (
        <MuiThemeProvider theme={creationTheme}>
            {props.children}
        </MuiThemeProvider>
    );
}

export function convertHexToRGBA(hexCode: string, opacity: number) {
    const hex = hexCode.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity})`;
}

export function useCardHoverStyles() {
    const current = useTheme();
    const [glowColor] = useState(
        convertHexToRGBA(current.palette.secondary.main, 0.5)
    );
    return `box-shadow: 0 1px 5px ${glowColor}, 0 1px 5px ${glowColor};
            &,* {text-decoration: none;
        }`;
}
