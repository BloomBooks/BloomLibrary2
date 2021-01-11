//import { debounce } from "throttle-debounce";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";

// Do not use this all over, it's expensive
export function useRefreshWhenScreenSizeChanges() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
            // Set window width/height to state
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            //console.log("resize");
        }

        // Add event listener
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
    // I don't get how this can be so large: return
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
        smallest: number | string,
        largest: number | string
    ): number | string => {
        return isSmall ? smallest : largest;
    };
}
