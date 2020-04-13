import css from "@emotion/css/macro";
import React, { useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { ListOfBookGroups } from "./ListOfBookGroups";

import { ByLanguageGroups } from "./ByLanguageGroups";

export const Covid19Page: React.FunctionComponent = () => {
    const filter = { bookshelf: "COVID-19" };
    const [counts, setCounts] = useState("");
    return (
        <div>
            <CustomizableBanner
                title="COVID-19"
                filter={filter}
                bookCountMessage={counts}
                spec={{
                    key: "COVID-19",
                    bannerCss: css`
                        background-image: url("https://share.bloomlibrary.org/bookshelf-images/COVID-19.svg");
                        background-size: cover;
                        background-color: transparent;
                        * {
                            color: white;
                        }
                        #contrast-overlay {
                            background-color: transparent; // this picture doesn't need the overlay
                        }
                    `,
                    about: (
                        <div
                            css={css`
                                font-size: 24pt;
                            `}
                        >
                            {"Spread the Word, Not the Virus"}
                        </div>
                    ),
                }}
            />
            <ListOfBookGroups>
                <ByLanguageGroups
                    titlePrefix={""} //"COVID-19 books in"}
                    filter={filter}
                    reportBooksAndLanguages={(books, langs) =>
                        setCounts(`${books} books in ${langs} languages`)
                    }
                />
                {/* <BookGroup
                    rows={99}
                    title="COVID-19 books"
                    filter={{ topic: "COVID-19" }}
                /> */}
                {/* <BookGroup
                    rows={99}
                    title="All COVID-19 books"
                    filter={{ ...filter }}
                /> */}
            </ListOfBookGroups>
        </div>
    );
};
