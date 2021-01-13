//import { debounce } from "throttle-debounce";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";

// Do not use this all over, it's expensive
export function useRefreshWhenScreenSizeChanges() {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener(
            "resize",
            // this should cause a refresh at most 5 times per second... it didn't seem to help performance, but it did
            // have a problem of often dropping the resize altogether
            //debounce(200, false, handleResize)
            handleResize
        );
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
}
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
