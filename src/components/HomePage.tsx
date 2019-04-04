import React, { Component } from "react";
import BookGroup from "./BookGroup";
import CategoryGroup from "./CategoryGroup";
import { observer, Observer } from "mobx-react";

@observer
class HomePage extends Component {
  render() {
    return (
      <ul>
        <BookGroup title="Featured Shell Books You Can Translate" />
        <BookGroup title="Local Language &amp; Culture Books" />
        <CategoryGroup title="Publishers" />
      </ul>
    );
  }
}

export default HomePage;
