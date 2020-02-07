// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import { LicenseLink } from "./LicenseLink";
//NB: v3.0 of title-case has a new API, but don't upgrade: it doesn't actually work like v2.x does, where it can take fooBar and give us "Foo Bar"
import titleCase from "title-case";

export const MetadataGroup: React.FunctionComponent<{
    book: Book;
}> = observer(props => (
    <div
        id={"details"}
        css={css`
            display: flex;
        `}
    >
        <div
            id="column1"
            css={css`
                flex-grow: 1;
            `}
        >
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
            {props.book.originalBookSourceUrl &&
                props.book.originalBookSourceUrl.length > 0 && (
                    <div>
                        Imported from&nbsp;
                        <a href={props.book.originalBookSourceUrl}>
                            {new URL(props.book.originalBookSourceUrl).host}
                        </a>
                    </div>
                )}
        </div>
        <div
            id="column2"
            css={css`
                width: 250px;
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
