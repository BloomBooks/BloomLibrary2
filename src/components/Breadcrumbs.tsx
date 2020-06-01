// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useGetCollectionFromContentful } from "../model/Collections";
import QueryString from "qs";

export const Breadcrumbs: React.FunctionComponent = () => {
    const location = useLocation();
    // TODO: this doesn't look good on a narrow screen (phone) when the breadcrumbs get very long.
    const breadcrumbsStyle = css`
        display: flex;
        padding: 0;
        margin: 0; // better to let the consumer decide our margin
        //padding-left: 20px;
        margin-top: 5px;
        li {
            margin-right: 3px;
            //color: whitesmoke;
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
    const crumbs: React.ReactElement[] = [];
    crumbs.push(
        <li key="home">
            <Link
                css={css`
                    text-decoration: none !important;
                `}
                to="/"
            >
                Home
            </Link>
        </li>
    );
    let isBook = false;
    const items = location.pathname.split("/");
    // Typically there's a leading slash, producing an empty element.
    // On a 'more' page there may also be a 'more' following that.
    while (items[0] === "more" || items[0] === "" || items[0] === "root.read") {
        items.splice(0, 1);
    }
    if (items[0] === "book" || items[0] === "player") {
        isBook = true;
        items.splice(0, 1);
    }
    if (items.length > 0) {
        const parts = items[0].split("~");
        if (isBook) {
            const bookId = parts.pop();
        }
        if (parts[0] === "root.read") {
            // We try to keep the root page ID out of even the URL, but if it sneaks in, forget it.
            parts.splice(0, 1);
        }
        for (const c of parts) {
            crumbs.push(<CollectionCrumb key={c} collectionName={c} />);
        }
        items.splice(0, 1);
    }
    for (const item of items) {
        let label = item;
        const labelParts = item.split(":");
        const prefix = labelParts[0];
        switch (prefix.toLowerCase()) {
            case "level":
                label = "Level " + labelParts[1];
                break;
        }
        crumbs.push(
            <li key={item}>
                {decodeURIComponent(label)}
                {/* enhance: reinstate if we come up with a destination for the link.<Link
                    css={css`
                        text-decoration: none !important;
                    `}
                    to="/"
                >
                    {label}
                </Link> */}
            </li>
        );
    }
    const urlParams =
        location.search?.length > 0
            ? QueryString.parse(location.search.substring(1))
            : {};
    if (urlParams.search) {
        // Enhance: when we implement a top-level search page, that would be a better destination.
        crumbs.push(
            <li key={"search"}>
                <Link
                    css={css`
                        text-decoration: none !important;
                    `}
                    to={"/?search=" + urlParams.search}
                >
                    {"search for " + urlParams.search}
                </Link>
            </li>
        );
    }

    return <ul css={breadcrumbsStyle}>{crumbs}</ul>;
};
//     const router = useContext(RouterContext);
//     if (!router) {
//         throw new Error(
//             "Breadcrumbs found that there is no Router defined in a RouterContext. If this is a story, see the examples using an AddDecorator()"
//         );
//     }
//     return (
//         <ul css={breadcrumbsStyle}>
//             {router!.breadcrumbStack.map((l) => (
//                 <li key={l.title}>
//                     <a
//                         css={css`
//                             text-decoration: none !important;
//                         `}
//                         target="_blank"
//                         // todo: seems we're supposed to make this a button that looks like a link for accessibility
//                         onClick={() => {
//                             router!.goToBreadCrumb(l);
//                         }}
//                     >
//                         {l.title}
//                     </a>
//                 </li>
//             ))}
//         </ul>
//     );
// };

const CollectionCrumb: React.FunctionComponent<{ collectionName: string }> = (
    props
) => {
    const { collection, loading, error } = useGetCollectionFromContentful(
        props.collectionName
    );
    if (error) {
        console.log(error);
    }
    let text = props.collectionName;
    if (collection) {
        text = collection.label;
    }
    return (
        <li>
            <Link
                css={css`
                    text-decoration: none !important;
                `}
                to={"/" + props.collectionName}
            >
                {text}
            </Link>
        </li>
    );
};
