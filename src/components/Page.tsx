import React, { Component, useContext } from "react";
import BookGroup from "./BookGroup";
import CategoryGroup from "./CategoryGroup";
import { RouterContext } from "../BlorgRouter";
import mobx from "mobx-react";

const Page: React.SFC = props => {
  const router = useContext(RouterContext);

  return (
    <mobx.Observer>
      {() => (
        <ul>
          <BookGroup title="Featured Shell Books You Can Translate" />
          <BookGroup title="Local Language &amp; Culture Books" />
          <CategoryGroup title="Publishers" />
        </ul>
      )}
    </mobx.Observer>
  );
};

export default Page;
