import React, { Component } from "react";
import { css, cx } from "emotion";
import CheapCard from "./CheapCard";

interface IProps {
  title: string;
  bookCount?: string;
}

class CategoryCard extends React.Component<IProps> {
  render() {
    return (
      <CheapCard>
        <h2
          className={css`
            text-align: center;
          `}
        >
          {this.props.title}
        </h2>
        {this.props.bookCount ? `${this.props.bookCount} Books` : ""}
      </CheapCard>
    );
  }
}

export default CategoryCard;
