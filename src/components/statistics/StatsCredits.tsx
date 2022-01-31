import { BlorgLink } from "../BlorgLink";
import React from "react";

export const StatsCredits = () => {
    return (
        <>
            This site includes IP2Location LITE data available from{" "}
            <BlorgLink href="https://lite.ip2location.com">
                https://lite.ip2location.com
            </BlorgLink>
            .
        </>
    );
};
