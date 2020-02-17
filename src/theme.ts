import { createMuiTheme } from "@material-ui/core";

export const commonUI = {
    colors: {
        bloomRed: "#D65649",
        bloomBlue: "#1d94a4",
        dialogTopBottomGray: "#F1F3F4"
    },

    languageCardHeightInPx: 100,
    cheapCardMarginBottomInPx: 10
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
