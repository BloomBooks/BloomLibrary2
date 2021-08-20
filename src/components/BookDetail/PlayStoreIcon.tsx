// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { ReactComponent as PlayStoreImg } from "../../assets/PlayStore.svg";
import { useIntl } from "react-intl";

export const PlayStoreIcon: React.FunctionComponent = () => {
    const l10n = useIntl();
    return (
        <PlayStoreImg
            title={l10n.formatMessage({
                id: "book.detail.getBloomReader",
                defaultMessage: "Get Bloom Reader",
            })}
            css={css`
                width: 36px;
                height: 36px;
                padding: 6px;
            `}
        />
    );
};
