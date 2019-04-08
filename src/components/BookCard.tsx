import React, { Component } from "react";
import { css, cx } from "emotion";
import { CheapCard } from "./CheapCard";

const image = css`
  height: 100px;
  width: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

interface IProps {
  // title: string;
  // imageUrl: string;
  book: any;
}

class BookCard extends React.Component<IProps> {
  render() {
    return (
      <CheapCard onClick={() => {}}>
        {/* For (39a) Lara the Yellow Ladybird I placed a file named "test-cover" in the bucket
        in order to play with how the cards can look once we have access to their actual cover images. */}
        <img
          src={this.props.book.baseUrl + "test-cover.jpg"} // we would have to generate new thumbnails that just have the image shown on the cover
          onError={ev => {
            (ev.target as any).src =
              this.props.book.baseUrl + "thumbnail-70.png";
          }}
        />

        <h2
          className={css`
            font-weight: normal;
            padding-left: 10px;
          `}
        >
          {this.props.book.title}
        </h2>
      </CheapCard>
    );
  }
}

export default BookCard;
