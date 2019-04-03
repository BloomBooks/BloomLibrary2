import React, { Component } from "react";
import { css, cx } from "emotion";

const cardStyle = css`
  width: 120px;
  height: 170px;
  margin: 5px;
  //border: solid thin;
  background-color: white;
  border-radius: 4px;

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25), 0 4px 5px rgba(0, 0, 0, 0.22);
  }
`;
class CheapCard extends React.Component {
  render() {
    return <li className={cardStyle}>{this.props.children}</li>;
  }
}

export default CheapCard;
