import React from "react";
import { Book } from "../../model/Book";
import { MissingFontNotice } from "./MissingFontNotice";
import { HarvesterFailedNotice } from "./HarvesterFailedNotice";
import { InvalidFontNotice } from "./InvalidFontNotice";

export const HarvesterProblemNotice: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    if (
        props.book.getMissingFontNames().length > 0 &&
        props.book.getInvalidFontNames().length > 0
    ) {
        return (
            <div>
                <MissingFontNotice book={props.book} />
                <InvalidFontNotice book={props.book} />
            </div>
        );
    }
    if (props.book.getInvalidFontNames().length > 0)
        return <InvalidFontNotice book={props.book} />;
    if (props.book.getMissingFontNames().length > 0)
        return <MissingFontNotice book={props.book} />;

    if (props.book.harvestState === "Failed") return <HarvesterFailedNotice />;

    return null;
};
