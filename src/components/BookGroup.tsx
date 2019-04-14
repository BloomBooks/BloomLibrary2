import React, { Component } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { IFilter } from "../Router";
import { useQueryBlorgClass } from "./useAxiosBlorg";

interface IProps {
    title: string;
    filter: IFilter;
    order?: string;
}

export const BookGroup: React.SFC<IProps> = props => {
    const { response, loading, error, reFetch } = useQueryBlorgClass("books", {
        include: "langPointers",
        keys: "title,baseUrl",
        limit: 10,
        where: props.filter || "",
        order: props.order || "title"
    });

    if (loading) return <div>"loading..."</div>;
    if (error) return <div>{"error: " + error.message}</div>;
    if (!response) return <div>"response null!"</div>;
    const books: Array<Object> = response["data"]["results"];
    console.log(books);
    return (
        <li
            className={css`
                margin-top: 30px;
            `}
        >
            <h1>{props.title}</h1>
            <ul
                className={css`
                    list-style: none;
                    display: flex;
                    padding-left: 0;
                `}
            >
                {books.map(b => {
                    //"https://storage.googleapis.com/story-weaver-e2e-production/illustration_crops/100764/size1/4817793037c30462fd006e506752dce5.jpg"
                    const book = b as any;
                    return (
                        <BookCard title={book.title} baseUrl={book.baseUrl} />
                    );
                })}
            </ul>
        </li>
    );
};
