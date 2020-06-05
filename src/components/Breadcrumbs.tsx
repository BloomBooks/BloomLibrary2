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
import { commonUI } from "../theme";

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
    if (!isBook && collectionName !== "root.read") {
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
    const { collection, error } = useGetCollectionFromContentful(
        props.collectionName
    );
    if (error) {
        console.log(error);
    }
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
                `}
                to={"/" + path.join("/")}
            >
                {text}
            </Link>
        </li>
    );
};

// Given a pathname like /enabling-writers/ew-nigeria/:level:1/:topic:Agriculture/:search:dogs,
// produces {collectionName: "ew-nigeria" filters: ["level:1", "topic:Agriculture", "search:dogs"],
// breadcrumbs: ["enabling-writers"]}.
// The collection name is the last segment with no leading colon.
// The filters are all the following things that do have leading colons, minus the colons.
// The breadcrumbs are the things before the collectionName (not counting an empty string before the first slash)
// Special cases:
// - pathname is undefined, or possibly empty or a single slash: happens when there's no pathname at all:
//       collectionName is root.read, others results are empty
// - everything is a filter: collectionName is root.read
// - collection works out to "read": change to "root.read"
export function splitPathname(
    pathname?: string
): { collectionName: string; filters: string[]; breadcrumbs: string[] } {
    const segments = trimLeft(pathname ?? "", "/").split("/");
    let collectionSegmentIndex = segments.length - 1;
    while (collectionSegmentIndex >= 0) {
        if (!segments[collectionSegmentIndex].startsWith(":")) {
            break;
        }
        collectionSegmentIndex--;
    }
    let collectionName = segments[collectionSegmentIndex];
    if (
        collectionSegmentIndex < 0 ||
        collectionName === "read" ||
        !collectionName
    ) {
        // all segments (if any) are filters! We're in the root collection.
        collectionName = "root.read";
    }

    return {
        collectionName,
        filters: segments
            .slice(collectionSegmentIndex + 1)
            .map((x) => x.substring(1)),
        breadcrumbs: segments.slice(0, Math.max(collectionSegmentIndex, 0)),
    };
}

// what we're calling "target" is the last part of url, where the url is <breadcrumb stuff>/<target>
// Thus, it is the shortest URL that identifies the collection and filters that we want,
// without a leading slash.
// This function is called when the collection indicated by the current location pathname
// is considered to be a parent of target, so we want a URL that indicates the target collection,
// but uses the current location pathname collection as breadcrumbs.
// It's possible that it is a true child collection; for example, if current pathname is
// /enabling-writers and target is ew-nigeria, we want enabling-writers/ew-nigeria.
// It's also possible that we're moving to a filtered subset collection; for example, if
// the current pathname is /enabling-writers/ew-nigeria and target is ew-nigeria/:level:1
// We want to get enabling-writers/ew-nigeria/:level:1 (only one ew-nigeria).
// We might also be going a level of fiter deeper; for example, from location
// /enabling-writers/ew-nigeria/:level:1 to target ew-nigeria/:level:1/:topic:Agriculture
// producing enabling-writers/ew-nigeria/:level:1/:topic:Agriculture.
// Any leading slash on target should be ignored.
// See https://docs.google.com/document/d/1cA9-9tMSydZ6Euo-hKmdHo_JlO0aLW8Fi9v293oIHK0/edit#heading=h.3b7gegy9uie8
// for more of the logic.
export function getUrlForTarget(target: string) {
    const { breadcrumbs, collectionName: pathCollectionName } = splitPathname(
        window.location.pathname
    );
    const { collectionName } = splitPathname(target);
    if (pathCollectionName && collectionName !== pathCollectionName) {
        breadcrumbs.push(pathCollectionName);
    }
    breadcrumbs.push(trimLeft(target, "/"));
    return breadcrumbs.join("/");
}
function trimLeft(s: string, char: string) {
    return s.replace(new RegExp("^[" + char + "]+"), "");
}
