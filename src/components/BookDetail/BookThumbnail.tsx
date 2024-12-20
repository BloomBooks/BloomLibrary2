import { css } from "@emotion/react";

import React from "react";
import { Book } from "../../model/Book";
import { useIntl } from "react-intl";

// Display the standard thumbnail of a book as in Detail view.
export const BookThumbnail: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const l10n = useIntl();
    const { thumbnailUrl } = Book.getThumbnailUrl(props.book);
    const legacyStyleThumbnail = Book.getLegacyThumbnailUrl(props.book);

    return (
        <img
            // Don't provide an alt unless the src is missing.  See BL-8963.
            alt={
                thumbnailUrl
                    ? ""
                    : l10n.formatMessage({
                          id: "book.detail.thumbnail",
                          defaultMessage: "book thumbnail",
                      })
            }
            src={thumbnailUrl}
            onError={(ev) => {
                // This is unlikely to be necessary now, as we have what we think is a reliable
                // way to know whether the harvester has created a thumbnail.
                // And eventually all books should simply have harvester thumbnails.
                // Keeping the fall-back just in case it occasionally helps.
                if ((ev.target as any).src !== legacyStyleThumbnail) {
                    (ev.target as any).src = legacyStyleThumbnail;
                } else {
                    console.log("ugh! no thumbnail in either place");
                }
            }}
            css={css`
                max-width: 125px;
                max-height: 120px;

                object-fit: contain; //cover will crop, but fill up nicely
                margin-right: 16px;
            `}
        />
    );
};
