import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (!path) {
            return;
        }
        window.scrollTo(0, 0);
    }, [location]);

    return null;
};

export default ScrollToTop;
