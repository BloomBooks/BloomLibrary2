import React, { Component } from "react";
import BookCard from "./BookCard";
import { css, cx } from "emotion";
import useAxios from "@use-hooks/axios";
import { LanguageCard } from "./LanguageCard";

interface IProps {
    title: string;
}

export const LanguageGroup: React.SFC<IProps> = props => {
    const { response, loading, error, reFetch } = useAxios({
        url: `https://bloom-parse-server-production.azurewebsites.net/parse/classes/language`,
        method: "GET",
        trigger: "true",
        options: {
            headers: {
                "Content-Type": "text/json",
                "X-Parse-Application-Id":
                    "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
                "X-Parse-REST-API-Key":
                    "bAgoDIISBcscMJTTAY4mBB2RHLfkowkqMBMhQ1CD"
            },

            params: {
                include: "langPointers",
                keys: "name,usageCount",
                limit: 10,
                //   where: props.filter || "",
                order: "-usageCount"
            }
        }
    });

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
