import React, { Component } from "react";
import BookGroup from "./BookGroup";
import CategoryGroup from "./CategoryGroup";
import { observer } from "mobx-react";

@observer
class CategoryPage extends Component {
  render() {
    return (
      <ul style={{ backgroundColor: "grey" }}>
        <BookGroup title="Books in this category" />
        <CategoryGroup title="Some kind of subcategory" />
      </ul>
    );
  }
}

export default CategoryPage;
