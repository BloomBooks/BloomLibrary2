import React from "react";
import BookGroup from "./BookGroup";
import CategoryGroup from "./CategoryGroup";

export const HomePage: React.SFC = () => (
  <ul>
    <BookGroup title="Featured Shell Books You Can Translate" />
    <BookGroup title="Local Language &amp; Culture Books" />
    <CategoryGroup title="Publishers" />
  </ul>
);
