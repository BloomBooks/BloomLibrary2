import { RouterContext } from "../Router";
import { css } from "emotion";
import React, { useContext } from "react";

export const Breadcrumbs: React.FunctionComponent = () => {
    const router = useContext(RouterContext);
    if (!router) {
        throw new Error(
            "Breadcrumbs found that there is no Router defined in a RouterContext. If this is a story, see the examples using an AddDecorator()"
        );
    }
    return (
        <ul className={breadcrumbsStyle}>
            {router!.breadcrumbStack.map(l => (
                <li key={l.title}>
                    <a
                        // todo: seems we're supposed to make this a button that looks like a link for accessibility
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

// TODO: this doesn't look good on a narrow screen (phone) when the breadcrumbs get very long.
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
