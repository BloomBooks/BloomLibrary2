import { createMuiTheme } from "@material-ui/core";
export const bloomRed = "#D65649";
const bloomBlue = "#1d94a4";
const kDialogTopBottomGray = "#F1F3F4";

// lots of examples: https://github.com/search?q=createMuiTheme&type=Code
const theme = createMuiTheme({
    palette: {
        primary: { main: bloomRed },
        secondary: { main: bloomBlue },
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
                backgroundColor: kDialogTopBottomGray,
                "& h6": { fontWeight: "bold" }
            }
        },
        MuiDialogActions: {
            root: {
                backgroundColor: kDialogTopBottomGray
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
