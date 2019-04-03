import React, { Component } from "react";
import BookCard from "./BookCard";
import { css, cx } from "emotion";

interface IProps {
  title: string;
}

class BookGroup extends React.Component<IProps> {
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
          <BookCard
            title="one"
            imageUrl="https://storage.googleapis.com/story-weaver-e2e-production/illustration_crops/100764/size1/4817793037c30462fd006e506752dce5.jpg"
          />
          <BookCard
            title="one"
            imageUrl="https://bloomlibrary.org/assets/huyagirls.jpg"
          />
          <BookCard
            title="one"
            imageUrl="https://storage.googleapis.com/story-weaver-e2e-production/illustration_crops/100764/size1/4817793037c30462fd006e506752dce5.jpg"
          />
        </ul>
      </li>
    );
  }
}

export default BookGroup;
