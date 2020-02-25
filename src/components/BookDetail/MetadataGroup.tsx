// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import { LicenseLink } from "./LicenseLink";
//NB: v3.0 of title-case has a new API, but don't upgrade: it doesn't actually work like v2.x does, where it can take fooBar and give us "Foo Bar"
import titleCase from "title-case";
import { Link } from "@material-ui/core";
import { commonUI } from "../../theme";

export const MetadataGroup: React.FunctionComponent<{
    book: Book;
    breakToColumn: string;
}> = observer(props => (
    <div
        id={"details"}
        css={css`
            display: flex;
            max-width: calc(
                100vw - ${commonUI.detailViewMargin} -
                    ${commonUI.detailViewMargin}
            );
            @media (max-width: ${props.breakToColumn}) {
                flex-direction: column-reverse;
            }
        `}
    >
        <div
            id="column1"
            css={css`
                flex-grow: 1;
            `}
        >
            {props.book.level && <div>{`Level ${props.book.level}`}</div>}
            <div>{`${props.book.pageCount} Pages`}</div>
            <div>{props.book.copyright}</div>
            <div>
                {"License: "}
                <LicenseLink book={props.book} />
            </div>
            <div>
                {"Uploaded "}
                {`${props.book.uploadDate!.toLocaleDateString()} by ${obfuscateEmail(
                    props.book.uploader
                )}`}
            </div>
            <div>{`Last updated on ${props.book.updateDate!.toLocaleDateString()}`}</div>
            {props.book.importedBookSourceUrl &&
                props.book.importedBookSourceUrl.length > 0 && (
                    <div>
                        Imported from&nbsp;
                        <Link
                            color="secondary"
                            href={props.book.importedBookSourceUrl}
                        >
                            {new URL(props.book.importedBookSourceUrl).host}
                        </Link>
                    </div>
                )}
        </div>
        <div
            id="column2"
            // This would be more concise using min-width. But we use max-width above.
            // If we mix the two, there is one pixel of width where they aren't consistent.
            css={css`
                min-width: 300px;
                float: right;
                margin-left: 40px;
                @media (max-width: ${props.breakToColumn}) {
                    float: inherit;
                    margin-left: 0;
                }
            `}
        >
            <div>
                {"Features: "}
                {props.book.features
                    ? props.book.features
                          .map(f => {
                              return titleCase(f);
                          })
                          .join(", ")
                    : []}
            </div>
            <div>
                {"Tags: "}
                {props.book.tags
                    .filter(t => !t.startsWith("system"))
                    .map(t => {
                        const parts = t.split(":");
                        return parts[1];
                    })
                    .join(", ")}
            </div>
        </div>
    </div>
));
function obfuscateEmail(user: any): string {
    const email = user.username;
    if (!email) {
        return "";
    }
    const index = email.lastIndexOf("@");
    if (index < 0 || index + 1 >= email.length) {
        return email;
    }
    return email.substring(0, index + 1) + "...";
}
