import { useMediaQuery, useTheme } from "@material-ui/core";

export function useSmallScreen() {
    const theme = useTheme();
    // Note that iwth material's breakpoints, you have to get down to "xs" for phone size
    return useMediaQuery(theme.breakpoints.down("xs"));
    //useMediaQuery(theme.breakpoints.up("(max-width:600px"));
}
export function useClassForSmallScreen() {
    return useSmallScreen() ? "smallScreen" : "";
}

// export function useShrinkOnSmallScreen() {
//     const x = useSmallScreen(); // review... it wouldn't let me put this in the callback... w
//     return (w: number | undefined, scaleFactor?: number) => {
//         if (w === undefined) return w;
//         return x ? w * (scaleFactor || 0.5) : w;
//     };
// }

export function useResponsiveChoice() {
    const isSmall = useSmallScreen();
    return (
        smallScreenValue: number | string,
        largeScreenValue: number | string
    ): number | string => {
        return isSmall ? smallScreenValue : largeScreenValue;
    };
}
