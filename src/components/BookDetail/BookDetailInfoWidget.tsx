import React from "react";
import Tooltip from "react-tooltip-lite";

import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

export const BookDetailInfoWidget: React.FunctionComponent<{}> = (props) => {
    return (
        <Tooltip
            className={"infoTooltip"}
            content={<React.Fragment>{props.children}</React.Fragment>}
            arrow
            useDefaultStyles
        >
            <InfoOutlinedIcon style={{ height: "15px" }} />
        </Tooltip>
    );
};
