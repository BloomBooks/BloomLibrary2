import React, { Component } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { LanguageCard } from "./LanguageCard";
import { useQueryBlorgClass } from "./useAxiosBlorg";

interface IProps {
    title: string;
}

export const LanguageGroup: React.SFC<IProps> = props => {
    const { response, loading, error, reFetch } = useQueryBlorgClass(
        "language",
        {
            include: "langPointers",
            keys: "name,usageCount",
            limit: 10,
            //   where: props.filter || "",
            order: "-usageCount"
        }
    );

    if (loading) return <div>"loading..."</div>;
    if (error) return <div>{"error: " + error.message}</div>;
    if (!response) return <div>"response null!"</div>;
    const langs: Array<Object> = response["data"]["results"];
    //console.log(langs);
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
                {langs.map(l => {
                    const lang = l as any;
                    return (
                        <LanguageCard
                            name={lang.name}
                            bookCount={lang.usageCount}
                        />
                    );
                })}
            </ul>
        </li>
    );
};
