import { Book } from "../../model/Book";
import { Link } from "@material-ui/core";
import React from "react";
export const KeywordLinks: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    if (props.book.keywords?.length > 0) {
        return (
            <span>
                {props.book.keywords.map(
                    (keyword: string, index: number, arr: string[]) => {
                        let delimiter = "";

                        if (keyword?.length >= 1 && keyword.slice(-1) === ",") {
                            // It ends with a comma, so no need to insert a duplicate one
                            delimiter = " ";
                        } else if (index < arr.length - 1) {
                            // The "normal" case for everything except the last tag
                            delimiter = ", ";
                        }

                        return (
                            <span>
                                <Link
                                    color="secondary"
                                    href={`/?title=search%20for%20"${keyword}"&pageType=grid&filter%5BkeywordsText%5D=${keyword}`}
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
};
