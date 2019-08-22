import React, { Component, useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { useGetBookDetail } from "./LibraryQueryHooks";

interface IProps {
    id: string;
}
export const BookDetail: React.FunctionComponent<IProps> = props => {
    const book = useGetBookDetail(props.id);
    {
    }
    if (!book) {
        return <div>Loading...</div>;
    } else {
        return (
            <div
                className={css`
                    width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                `}
            >
                <h1
                    className={css`
                        font-size: 32pt;
                        margin-bottom: 12px;
                    `}
                >
                    {book.title}
                </h1>
                <div
                    className={css`
                        font-size: 14pt;
                        margin-bottom: 12px;
                    `}
                >
                    {book.summary}
                </div>
                <img
                    src={book.baseUrl + "thumbnail-256.png"}
                    className={css`
                        height: 300px;
                        object-fit: contain; //cover will crop, but fill up nicely
                    `}
                />
                <div>{book.credits}</div>
                <div>{book.copyright}</div>
                <div>
                    {"License: "}
                    {book.license}
                </div>
                <div>
                    {book.tags.map(t => {
                        const parts = t.split(":");
                        return parts[0] + "-" + parts[1];
                    })}
                </div>
                <div
                    className={css`
                        margin-top: 300px;
                        color: lightgray;
                    `}
                >
                    <div>{"Raw Data:"}</div>
                    {JSON.stringify(book)}
                </div>
            </div>
        );
    }
};
