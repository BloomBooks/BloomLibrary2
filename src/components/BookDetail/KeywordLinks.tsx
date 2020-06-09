import { Book } from "../../model/Book";
import { Link } from "@material-ui/core";
import { observer } from "mobx-react";
import React from "react";

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
                                    href={`/:keyword:${keyword}`}
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
