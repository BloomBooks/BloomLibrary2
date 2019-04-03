import React, { Component } from "react";
import BookGroup from "./BookGroup";
import { css, cx } from "emotion";
import CategoryGroup from "./CategoryGroup";

class Page extends Component {
  render() {
    return (
      <ul
        className={css`
          list-style: none;
        `}
      >
        <BookGroup title="Featured Shell Books You Can Translate" />
        <BookGroup title="Local Language &amp; Culture Books" />
        <CategoryGroup title="Publishers" />
      </ul>
    );
  }
}

export default Page;
