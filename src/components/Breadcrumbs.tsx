import { RouterContext } from "../Router";
import { css } from "emotion";
import React, { useContext } from "react";

export const Breadcrumbs: React.FunctionComponent = () => {
    const router = useContext(RouterContext);
    return (
        <ul className={breadcrumbsStyle}>
            {router!.locationStack.map(l => (
                <li key={l.title}>
                    <a
                        onClick={() => {
                            router!.goToBreadCrumb(l);
                        }}
                    >
                        {l.title}
                    </a>
                </li>
            ))}
        </ul>
    );
};

const breadcrumbsStyle = css`
    display: flex;
    padding: 0;
    //padding-left: 20px;
    li {
        margin-right: 3px;
        color: whitesmoke;
        &:after {
            margin-left: 3px;
            margin-right: 3px;
            content: "›";
        }
    }

    li:last-child::after {
        color: transparent;
    }
`;
