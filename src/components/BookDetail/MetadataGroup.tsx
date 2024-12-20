import { css } from "@emotion/react";

import React from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react-lite";
import { LicenseLink } from "./LicenseLink";
import { BookStats } from "./BookStats";
import { useGetRelatedBooks } from "../../connection/LibraryQueryHooks";
import { KeywordLinks } from "./KeywordLinks";
import { BlorgLink } from "../BlorgLink";
import { FormattedMessage, useIntl } from "react-intl";
import { BookDetailInfoWidget } from "./BookDetailInfoWidget";

export const LeftMetadata: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const originalUploadDateAsString = props.book.uploadDate!.toLocaleDateString();
    const lastUploadDateAsString = props.book.lastUploadedDate
        ? props.book.lastUploadedDate!.toLocaleDateString()
        : undefined;
    const displayLastUploadDate =
        lastUploadDateAsString &&
        originalUploadDateAsString !== lastUploadDateAsString;

    return (
        <div
            css={css`
                flex-grow: 1;
            `}
        >
            {props.book.level && (
                <div>
                    <FormattedMessage
                        id="book.metadata.level"
                        defaultMessage="Level {levelNumber}"
                        values={{ levelNumber: props.book.level }}
                    />
                </div>
            )}
            <div>
                <FormattedMessage
                    id="book.metadata.pages"
                    defaultMessage="{count} pages"
                    values={{ count: props.book.pageCount }}
                />
            </div>
            <div>{props.book.copyright}</div>
            <div>
                <FormattedMessage
                    id="book.metadata.license"
                    defaultMessage="License:"
                />{" "}
                <LicenseLink book={props.book} />
            </div>
            {!displayLastUploadDate ? (
                <div>
                    <FormattedMessage
                        id="book.metadata.uploadedBy"
                        defaultMessage="Uploaded {date} by {email}"
                        values={{
                            date: originalUploadDateAsString,
                            email: obfuscateEmail(props.book.uploader),
                        }}
                    />
                </div>
            ) : (
                <>
                    <div>
                        <FormattedMessage
                            id="book.metadata.firstUploadedBy"
                            defaultMessage="First uploaded {date} by {email}"
                            values={{
                                date: originalUploadDateAsString,
                                email: obfuscateEmail(props.book.uploader),
                            }}
                        />
                    </div>
                    <div>
                        <FormattedMessage
                            id="book.metadata.updatedOn"
                            defaultMessage="Updated on {date}"
                            values={{
                                date: lastUploadDateAsString,
                            }}
                        />
                    </div>
                </>
            )}
            {props.book.importedBookSourceUrl &&
                props.book.importedBookSourceUrl.length > 0 && (
                    <div>
                        Imported from&nbsp;
                        <BlorgLink
                            color="secondary"
                            href={props.book.importedBookSourceUrl}
                        >
                            {new URL(props.book.importedBookSourceUrl).host}
                        </BlorgLink>
                    </div>
                )}

            {props.book.rebrand && (
                <div
                    css={css`
                        display: flex;
                    `}
                >
                    <FormattedMessage
                        id="book.metadata.rebrand"
                        defaultMessage="Rebrand"
                    />
                    <BookDetailInfoWidget>
                        <FormattedMessage
                            id="book.metadata.rebrandMessage"
                            defaultMessage="This book appears to be a duplicate of another book, except with a new branding. For this reason, we do not include it in the general counts of books, and we don't show it in places where it would be a confusing duplicate."
                        />
                    </BookDetailInfoWidget>
                </div>
            )}
            <BookStats book={props.book} />
        </div>
    );
});

export const RightMetadata: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const relatedBooks = useGetRelatedBooks(props.book.id);
    const l10n = useIntl();

    return (
        <div css={css``}>
            <div>
                <FormattedMessage
                    id="book.metadata.tags"
                    defaultMessage="Tags:"
                />{" "}
                {props.book.tags
                    .filter((t) =>
                        // Whitelist only these tags. So that removes system, bookshelf, level, computedLevel, etc.
                        ["topic", "region"].includes(t.split(":")[0])
                    )
                    .map((t) => {
                        const parts = t.split(":");
                        const prefix = parts[0];
                        const tag = parts[1];
                        if (prefix === "topic") {
                            return l10n.formatMessage({
                                id: "topic." + tag,
                                defaultMessage: tag,
                            });
                        } else {
                            return tag;
                        }
                    })
                    .join(", ")}
            </div>
            <div>
                <FormattedMessage
                    id="book.metadata.keywords"
                    defaultMessage="Keywords:"
                />{" "}
                <KeywordLinks book={props.book}></KeywordLinks>
            </div>
            {relatedBooks?.length > 0 && (
                <div>
                    <FormattedMessage
                        id="book.metadata.related"
                        defaultMessage="Related Books:"
                    />{" "}
                    <ul
                        css={css`
                            margin: 0;
                            list-style: none;
                            padding-left: 10px;
                        `}
                    >
                        {relatedBooks.map((b: Book) => {
                            return (
                                <li key={b.id}>
                                    <BlorgLink
                                        newTabIfEmbedded={true}
                                        color="secondary"
                                        href={`/book/${b.id}`}
                                    >
                                        {b.title}
                                    </BlorgLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
});
function obfuscateEmail(user: any): string {
    if (!user) {
        return ""; // pathological
    }
    const email = user.username;
    if (!email) {
        return ""; // pathological
    }
    const index = email.lastIndexOf("@");
    if (index < 0 || index + 1 >= email.length) {
        return email;
    }
    return email.substring(0, index + 1) + "...";
}
