import React, { Component } from "react";
import { css, cx } from "emotion";
import CheapCard from "./CheapCard";

const image = css`
  height: 100px;
  width: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

interface IProps {
  title: string;
  imageUrl: string;
}

class BookCard extends React.Component<IProps> {
  render() {
    return (
      <CheapCard onClick={() => {}}>
        <div
          className={cx(
            image,
            css({
              backgroundImage: `url('${this.props.imageUrl}')`
            })
          )}
        />
        <h2
          className={css`
            font-weight: normal;
            padding-left: 10px;
          `}
        >
          {this.props.title}
        </h2>
      </CheapCard>
    );
  }
}

export default BookCard;
