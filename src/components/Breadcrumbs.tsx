// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useGetCollection } from "../model/Collections";
import { splitPathname } from "./Routes";

export const Breadcrumbs: React.FunctionComponent = () => {
    const location = useLocation();
    // TODO: this doesn't look good on a narrow screen (phone) when the breadcrumbs get very long.
    const breadcrumbsStyle = css`
        display: flex;
        padding: 0;
        margin: 0; // better to let the consumer decide our margin
        //padding-left: 20px;
        margin-top: 5px;
        margin-bottom: 14px;

        /* bold only the last breadcrumb. Question: should we eve *show* the last one? It's redundant.
        li:last-child a {
            font-weight: bold;
        }*/
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
                    &:hover {
                        text-decoration: underline !important;
                    }
                `}
                to="/"
            >
                Home
            </Link>
        </li>
    );
    let isBook = false;
    const { breadcrumbs, collectionName, filters } = splitPathname(
        location.pathname
    );
    // A leading slash, can produce an empty element, or even two if there's nothing
    // following it. splitPathName should deal with that, but it's cheap to keep the robustness.
    // We try to keep root.read out of the URL, but if it creeps in we can at least keep
    // it out of breadcrumbs.
    // On a 'more' page there may also be a 'more' which we don't need.
    while (
        breadcrumbs[0] === "more" ||
        breadcrumbs[0] === "" ||
        breadcrumbs[0] === "root.read"
    ) {
        breadcrumbs.splice(0, 1);
    }
    // book and player urls end in /book/id or /player/id, which puts the ID in the collectionName
    // slot and "book" or "player" in the last breadcrumb. Currently only book ones have prior breadcrumbs,
    // and player urls don't show breadcrumbs at all, but this logic works either way.
    if (
        breadcrumbs[breadcrumbs.length - 1] === "book" ||
        breadcrumbs[breadcrumbs.length - 1] === "player"
    ) {
        isBook = true;
        breadcrumbs.pop();
    }
    breadcrumbs.forEach((c, i) => {
        crumbs.push(
            <CollectionCrumb
                key={c}
                collectionName={c}
                previousBreadcrumbs={breadcrumbs.slice(0, i)}
            />
        );
    });
    if (!isBook && !["root.read", "grid", "bulk"].includes(collectionName)) {
        // Enhance: if there are no filters, this doesn't need to be a link.
        crumbs.push(
            <CollectionCrumb
                key={collectionName}
                collectionName={collectionName}
                previousBreadcrumbs={breadcrumbs}
            />
        );
    }
    for (const item of filters) {
        let label = item;
        const labelParts = item.split(":");
        const prefix = labelParts[0];
        switch (prefix.toLowerCase()) {
            case "level":
                label = "Level " + labelParts[1];
                break;
            case "search":
                label = "Books matching " + labelParts.slice(1).join(":");
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

const CollectionCrumb: React.FunctionComponent<{
    collectionName: string;
    previousBreadcrumbs: string[];
}> = (props) => {
    const { collection } = useGetCollection(props.collectionName);

    let text = props.collectionName;
    if (collection) {
        text = collection.label;
    }
    const path = [...props.previousBreadcrumbs];
    path.push(props.collectionName);
    return (
        <li>
            <Link
                css={css`
                    text-decoration: none !important;
                    &:hover {
                        text-decoration: underline !important;
                    }
                `}
                to={"/" + path.join("/")}
            >
                {text}
            </Link>
        </li>
    );
};
