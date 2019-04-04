import React, { Component } from "react";
import BookGroup from "./BookGroup";
import CategoryGroup from "./CategoryGroup";
import { observer, Observer } from "mobx-react";

@observer
class CategoryPage extends Component {
  render() {
    return <h1>Category Page</h1>;
  }
}

export default CategoryPage;
