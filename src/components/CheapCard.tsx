import React from "react";
import { css, cx } from "emotion";

interface IProps extends React.HTMLProps<HTMLLIElement> {
    onClick: () => void;
}

export const CheapCard: React.FunctionComponent<IProps> = props => (
    <li
        {...props}
        className={cx([cardStyle, props.className])}
        onClick={() => {
            props.onClick();
            //   this.props.browseState.push(this.props.target);
        }}
    >
        {props.children}
    </li>
);

const cardStyle = css`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    height: 170px;
    margin-right: 5px;
    background-color: white;
    border-radius: 4px;

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &:hover {
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25), 0 4px 5px rgba(0, 0, 0, 0.22);
        background-color: lightgray;
    }

    /* for on dark background*/
    border: solid white;
    box-sizing: border-box;
`;
