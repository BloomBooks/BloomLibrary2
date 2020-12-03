// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import { LicenseLink } from "./LicenseLink";
//NB: v3.0 of title-case has a new API, but don't upgrade: it doesn't actually work like v2.x does, where it can take fooBar and give us "Foo Bar"
import { useTheme } from "@material-ui/core";
import { BookStats } from "./BookStats";
import { CachedTablesContext } from "../../model/CacheProvider";
import { useGetRelatedBooks } from "../../connection/LibraryQueryHooks";
import { Bookshelf } from "../../model/Bookshelf";
import { KeywordLinks } from "./KeywordLinks";
import { BlorgLink } from "../BlorgLink";
import { FormattedMessage, useIntl } from "react-intl";

export const LeftMetadata: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const theme = useTheme();
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
                    defaultMessage="{count} Pages"
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
            <div>
                <FormattedMessage
                    id="book.metadata.uploadedBy"
                    defaultMessage="Uploaded {date} by {email}"
                    values={{
                        date: props.book.uploadDate!.toLocaleDateString(),
                        email: obfuscateEmail(props.book.uploader),
                    }}
                />
            </div>
            <div>
                <FormattedMessage
                    id="book.metadata.lastUpdated"
                    defaultMessage="Last updated on {date}"
                    values={{
                        date: props.book.updateDate!.toLocaleDateString(),
                    }}
                />
            </div>
            {props.book.importedBookSourceUrl &&
                props.book.importedBookSourceUrl.length > 0 && (
                    <div>
                        Imported from&nbsp;
                        <BlorgLink
                            color={theme.palette.secondary.main}
                            href={props.book.importedBookSourceUrl}
                        >
                            {new URL(props.book.importedBookSourceUrl).host}
                        </BlorgLink>
                    </div>
                )}
            <BookStats book={props.book} />
        </div>
    );
});

export const RightMetadata: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const { bookshelves } = useContext(CachedTablesContext);
    const relatedBooks = useGetRelatedBooks(props.book.id);
    const theme = useTheme();
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
            <div>
                <FormattedMessage
                    id="book.metadata.bookshelves"
                    defaultMessage="Bookshelves:"
                />{" "}
                {props.book.bookshelves
                    .map(
                        (shelfKey) =>
                            Bookshelf.parseBookshelfKey(shelfKey, bookshelves)
                                .displayNameWithParent
                    )
                    .join(", ")}
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
                                        color={theme.palette.secondary.main}
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
