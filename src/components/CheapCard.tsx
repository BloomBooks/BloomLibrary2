import React from "react";
import { css, cx } from "emotion";

interface IProps extends React.HTMLProps<HTMLDivElement> {
    onClick?: () => void;
    className?: string;
}

// just a wrapper around the children you provide, made to look like a card and responsive to a click.
export const CheapCard: React.FunctionComponent<IProps> = props => (
    <div
        {...props}
        className={cx(["cheapCard", cardStyle, props.className])}
        onClick={() => {
            if (props.onClick) {
                props.onClick();
            }
            //   this.props.browseState.push(this.props.target);
        }}
    >
        {props.children}
    </div>
);

const cardStyle = css`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    margin-bottom: 10px;
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
    //border: solid white;
    box-sizing: border-box;
`;
