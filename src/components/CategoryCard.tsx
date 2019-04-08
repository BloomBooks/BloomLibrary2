import React, { Component, useContext } from "react";
import { css, cx } from "emotion";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";

interface IProps {
  title: string;
  bookCount?: string;
  query: Object;
}

const CategoryCard: React.SFC<IProps> = props => {
  const router = useContext(RouterContext);

  return (
    <CheapCard
      onClick={() => {
        //alert("click " + this.props.title);
        router!.push({
          title: props.title,
          pageType: "category",
          filter: props.query
        });
      }}
    >
      <h2
        className={css`
          text-align: center;
          flex-grow: 1; // push the rest to the bottom5
        `}
      >
        {props.title}
      </h2>
      <div>{props.bookCount ? `${props.bookCount} Books` : ""}</div>
    </CheapCard>
  );
};

export default CategoryCard;
