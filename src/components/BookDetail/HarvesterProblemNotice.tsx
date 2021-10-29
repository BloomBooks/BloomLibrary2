import React from "react";
import { Book } from "../../model/Book";
import { MissingFontNotice } from "./MissingFontNotice";
import { HarvesterFailedNotice } from "./HarvesterFailedNotice";

export const HarvesterProblemNotice: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    if (props.book.getMissingFontNames().length > 0)
        return <MissingFontNotice book={props.book} />;

    if (props.book.harvestState === "Failed") return <HarvesterFailedNotice />;

    return null;
};
