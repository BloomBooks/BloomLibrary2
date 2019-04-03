import React, { Component } from "react";
import BookCard from "./BookCard";
import { css, cx } from "emotion";
import CategoryCard from "./CategoryCard";

interface IProps {
  title: string;
}

class CategoryGroup extends React.Component<IProps> {
  // constructor(props: IProps) {
  //   super(props);
  // }
  render() {
    return (
      <li>
        <h1>{this.props.title}</h1>
        <ul
          className={css`
            list-style: none;
            display: flex;
            padding-left: 0;
          `}
        >
          <CategoryCard title="Africa Storybook Project" bookCount="100" />
          <CategoryCard title="Pratham Books" bookCount="50" />
          <CategoryCard title="Book Dash" bookCount="20" />
        </ul>
      </li>
    );
  }
}

export default CategoryGroup;
