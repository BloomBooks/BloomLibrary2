import { useMediaQuery, useTheme } from "@material-ui/core";

export function useSmallScreen() {
    const theme = useTheme();
    // Note that with material's breakpoints, you have to get down to "xs" for
    // phone size.
    // On the noSSr: see
    // https://github.com/mui-org/material-ui/issues/21142#issuecomment-633144987
    // and https://issues.bloomlibrary.org/youtrack/issue/BL-9414
    return useMediaQuery(theme.breakpoints.down("xs"), { noSsr: true });
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
