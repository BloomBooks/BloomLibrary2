import React, { Component } from "react";
import BookCard from "./BookCard";
import { css, cx } from "emotion";
import useAxios from "@use-hooks/axios";

interface IProps {
  title: string;
  filter: {};
  order?: string;
}

export const BookGroup: React.SFC<IProps> = props => {
  const { response, loading, error, reFetch } = useAxios({
    url: `https://bloom-parse-server-production.azurewebsites.net/parse/classes/books`,
    method: "GET",
    trigger: "true",
    options: {
      headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
        "X-Parse-REST-API-Key": "bAgoDIISBcscMJTTAY4mBB2RHLfkowkqMBMhQ1CD"
      },

      params: {
        include: "langPointers",
        keys: "title,baseUrl",
        limit: 10,
        where: props.filter || "",
        order: props.order || "title"
      }
    }
  });

  if (loading) return <div>"loading..."</div>;
  if (error) return <div>{"error: " + error.message}</div>;
  if (!response) return <div>"response null!"</div>;
  const books: Array<Object> = response["data"]["results"];
  console.log(books);
  return (
    <li>
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
          return <BookCard book={book} />;
        })}
      </ul>
    </li>
  );
};
