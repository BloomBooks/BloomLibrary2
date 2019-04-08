import React from "react";
import { BookGroup } from "./BookGroup";
import CategoryGroup from "./CategoryGroup";
import { css } from "emotion";

const homePage = css`
  background-color: lightgreen;
  height: 100%;
  & h1 {
    color: black;
  }
  padding-left: 20px;
  padding-top: 20px;
`;

export const HomePage: React.SFC = () => (
  <ul className={homePage}>
    <BookGroup
      title="Featured Shell Books You Can Translate"
      filter={{ tags: "bookshelf:Featured" }}
    />
    <BookGroup title="New Arrivals" filter={{}} order={"-createdAt"} />
    <CategoryGroup title="Publishers" />
  </ul>
);
