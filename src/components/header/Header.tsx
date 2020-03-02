// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import logo from "./header-logo.svg";
import { SearchBox } from "../SearchBox";
import { UserMenu } from "../User/UserMenu";
import { commonUI } from "../../theme";
import Link from "@material-ui/core/Link/Link";
import { useMediaQuery } from "@material-ui/core";
import { RouterContext, Router } from "../../Router";

export const Header: React.FunctionComponent = props => {
    const router = useContext(RouterContext);

    const searchBelow = !useMediaQuery("(min-width:500px)");
    const normalToobarHeight = "48px";
    const toolbarHeight = searchBelow ? "90px" : normalToobarHeight;

    return (
        <div
            css={css`
                display: flex;
                background-color: ${commonUI.colors.bloomRed};
                height: ${toolbarHeight};
                flex-shrink: 0;
                padding: 10px;
                padding-left: 20px;
                box-sizing: content-box;
                justify-content: space-between;
                flex-direction: ${searchBelow ? "column" : "row"};
            `}
        >
            {searchBelow || (
                <React.Fragment>
                    <Link title="Home" onClick={() => router!.goHome()}>
                        <img src={logo} alt={"Bloom Logo"} />
                    </Link>
                    <div
                        css={css`
                            display: flex;
                            margin-left: auto;
                        `}
                    >
                        <SearchBox />
                        {/* The margin-left:auto here allows the containing flex-box to insert any spare space
            into this element's margin-left, typically putting a large gap there and making
            it the left-most of the block of controls at the right of the header.*/}
                        <UserMenu buttonHeight={normalToobarHeight} />
                    </div>
                </React.Fragment>
            )}
            {searchBelow && (
                <React.Fragment>
                    <div
                        css={css`
                            display: flex;
                        `}
                    >
                        <Link href="/" title="Home">
                            <img src={logo} alt={"Bloom Logo"} />
                        </Link>
                        <UserMenu
                            buttonHeight={normalToobarHeight}
                            css={css`
                                margin-left: auto;
                            `}
                        />
                    </div>

                    <SearchBox cssExtra="margin-left: auto; margin-right:5px;" />
                </React.Fragment>
            )}
        </div>
    );
};
