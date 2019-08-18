import React from "react";
import { css, cx } from "emotion";
import { IFilter } from "../../Router";
import logo from "./header-logo.png";
import { SearchBox } from "../SearchBox";
export const Header: React.FunctionComponent<{}> = props => {
    return (
        <div
            className={css`
                display: flex;
                background-color: #1c1c1c;
                height: 48px;
                flex-shrink: 0;
                padding: 10px;
                padding-left: 20px;
                box-sizing: content-box;
            `}
        >
            <img src={logo} />
            <SearchBox />
        </div>
    );
};
