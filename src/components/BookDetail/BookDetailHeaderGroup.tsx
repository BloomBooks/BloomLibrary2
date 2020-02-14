// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import { ReadButton } from "./ReadButton";
import { TranslateButton } from "./TranslateButton";
import { LanguageLink } from "../LanguageLink";

export const BookDetailHeaderGroup: React.FunctionComponent<{
    book: Book;
}> = observer(props => (
    <div
        id={"primaryInfoAndButtons"}
        css={css`
            display: flex;
            justify-content: space-between;
        `}
    >
        <section
            css={css`
                display: flex;
                margin-bottom: 1em;
                flex-direction: column;
                width: 500px; //hack
            `}
        >
            <div
                id={"left-side"}
                css={css`
                    display: flex;
                    margin-bottom: 1em;
                `}
            >
                <img
                    alt="book thumbnail"
                    src={props.book.baseUrl + "thumbnail-256.png"}
                    css={css`
                        max-width: 125px;
                        max-height: 120px;

                        object-fit: contain; //cover will crop, but fill up nicely
                        margin-right: 16px;
                    `}
                />
                <div>
                    <h1
                        css={css`
                            font-size: 18pt;
                            margin-top: 0;
                            margin-bottom: 12px;
                        `}
                    >
                        {props.book.title}
                    </h1>
                    {/* These are the original credits, which aren't enough. See BL-7990
    <div>{props.book.credits}</div> */}
                    {/* <div>Written by: somebody</div>
                    <div>Illustrated by: somebody</div>
                    <div>Narrated by: somebody else</div> */}
                    {/* <p
                        css={css`
                            white-space: pre-line;
                        `}
                    >
                        {book.credits}
                    </p> */}
                    <ul>
                        {props.book.langPointers.map(l => (
                            <li>
                                <LanguageLink
                                    name={l.name}
                                    englishName={l.englishName}
                                    isoCode={l.isoCode}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div
                css={css`
                    font-size: 14pt;
                    margin-bottom: 12px;
                `}
            >
                {props.book.summary}
            </div>
        </section>
        <div
            id="twoButtons"
            css={css`
                flex-shrink: 2;
            `}
        >
            <ReadButton id={props.book.id} />
            <TranslateButton book={props.book} />
        </div>
    </div>
));
