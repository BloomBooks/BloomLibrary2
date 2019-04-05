import React, { Component, useContext } from "react";
import { css, cx } from "emotion";
import CheapCard from "./CheapCard";
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
        `}
      >
        {props.title}
      </h2>
      {props.bookCount ? `${props.bookCount} Books` : ""}
    </CheapCard>
  );
};

export default CategoryCard;
