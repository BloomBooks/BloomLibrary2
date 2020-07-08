import { Book } from "../../model/Book";
import { Link } from "@material-ui/core";
import { observer } from "mobx-react";
import React from "react";
import { getAnchorProps } from "../../embedded";

export const KeywordLinks: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    if (props.book.keywords?.length > 0) {
        return (
            <span>
                {props.book.keywords.map(
                    (keyword: string, index: number, arr: string[]) => {
                        let delimiter = ", ";

                        if (keyword.endsWith(",")) {
                            // It already ends with a comma, so no need to insert a duplicate comma. Just a space.
                            delimiter = " ";
                        } else if (index === arr.length - 1) {
                            // The very last tag. No need for any delimiter.
                            delimiter = "";
                        }

                        return (
                            <span>
                                <Link
                                    color="secondary"
                                    // we decided not to do this href={`/:keyword:${keyword}`}
                                    // because we think it's more helpful to show *all* the books that might
                                    // have this word in their title or summary, not just the ones that we
                                    // have so far marked with this keyword
                                    {...getAnchorProps(`/:search:${keyword}`)}
                                >
                                    {keyword}
                                </Link>
                                {delimiter}
                            </span>
                        );
                    }
                )}
            </span>
        );
    } else {
        return null;
    }
});
