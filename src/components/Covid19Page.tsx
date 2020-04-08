import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx, SerializedStyles } from "@emotion/core";
/** @jsx jsx */
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";

const imageBase = "https://share.bloomlibrary.org/bookshelf-images/";

export const Covid19Page: React.FunctionComponent = () => {
    const filter = { bookshelf: "COVID-19" };
    return (
        <div>
            <CustomizableBanner
                title="COVID-19"
                filter={filter}
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
                <BookGroup title="All" filter={filter} rows={99} />
            </ListOfBookGroups>
        </div>
    );
};
