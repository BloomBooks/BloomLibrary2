import React, { Component } from "react";
import { css, cx } from "emotion";
import CheapCard from "./CheapCard";
import { RouterConsumer } from "../BlorgRouter";

interface IProps {
  title: string;
  bookCount?: string;
  query: Object;
}

class CategoryCard extends React.Component<IProps> {
  render() {
    return (
      <RouterConsumer>
        {router =>
          router && (
            <CheapCard
              onClick={() => {
                //alert("click " + this.props.title);
                router.push({
                  title: this.props.title,
                  pageType: "category",
                  filter: this.props.query
                });
              }}
            >
              <h2
                className={css`
                  text-align: center;
                `}
              >
                {this.props.title}
              </h2>
              {this.props.bookCount ? `${this.props.bookCount} Books` : ""}
            </CheapCard>
          )
        }
      </RouterConsumer>
    );
  }
}

export default CategoryCard;
