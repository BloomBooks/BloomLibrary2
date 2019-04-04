import React, { Component } from "react";
import { css, cx } from "emotion";

interface IProps {
  onClick: () => void;
}

class CheapCard extends React.Component<IProps> {
  render() {
    return (
      <li
        className={cardStyle}
        onClick={() => {
          this.props.onClick();
          //   this.props.browseState.push(this.props.target);
        }}
      >
        {this.props.children}
      </li>
    );
  }
}

const cardStyle = css`
  width: 120px;
  height: 170px;
  margin: 5px;
  background-color: white;
  border-radius: 4px;

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25), 0 4px 5px rgba(0, 0, 0, 0.22);
  }
`;

export default CheapCard;
