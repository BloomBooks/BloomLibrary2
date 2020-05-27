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
                        const includeDelimiter = index < arr.length - 1;

                        return (
                            <span>
                                <Link
                                    color="secondary"
                                    href={`/?title=search%20for%20"${keyword}"&pageType=grid&filter%5BkeywordsText%5D=${keyword}`}
                                >
                                    {keyword}
                                </Link>
                                {includeDelimiter ? ", " : ""}
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
