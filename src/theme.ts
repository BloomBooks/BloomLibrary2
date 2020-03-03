import { createMuiTheme } from "@material-ui/core";

export const commonUI = {
    colors: {
        bloomRed: "#D65649",
        bloomBlue: "#1d94a4",
        dialogTopBottomGray: "#F1F3F4",
        lightestAccessibleGrayAgainstWhite: "#767676"
    },

    // Some of these aren't very global, but this is a convenient place to put
    // constants shared by various components to keep them consistent
    languageCardHeightInPx: 100,
    cheapCardMarginBottomInPx: 10,
    bookGroupTopMarginPx: 30,
    bookCardHeightPx: 200,

    detailViewMargin: "1em",
    detailViewMainButtonWidth: "250px",
    detailViewMainButtonHeight: "80px"
};

// lots of examples: https://github.com/search?q=createMuiTheme&type=Code
const theme = createMuiTheme({
    palette: {
        primary: { main: commonUI.colors.bloomRed },
        secondary: { main: commonUI.colors.bloomBlue },
        warning: { main: "#F3AA18" }
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
        MuiDialogTitle: {
            root: {
                backgroundColor: commonUI.colors.dialogTopBottomGray,
                "& h6": { fontWeight: "bold" }
            }
        },
        MuiDialogActions: {
            root: {
                backgroundColor: commonUI.colors.dialogTopBottomGray
            }
        }
        // MuiTypography: {
        //     h6: {
        //         fontSize: "1rem"
        //     }
        // }
    }
});

export default theme;
