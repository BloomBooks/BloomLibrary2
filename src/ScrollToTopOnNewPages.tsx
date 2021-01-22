import React, { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTopOnNewPages: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();
    const [locationHistory, setLocationHistory] = useState([location.pathname]);

    useEffect(() => {
        const path = location.pathname;
        if (!path) {
            return;
        }
        const history = locationHistory;
        if (locationHistory.findIndex((loc) => loc === location.pathname) < 0) {
            history.push(location.pathname);
            setLocationHistory(history);
            //console.log("Scrolling to top...");
            window.scrollTo({ top: 0 });
        }
    }, [location, locationHistory]);

    return <Fragment>{props.children}</Fragment>;
};

export default ScrollToTopOnNewPages;
