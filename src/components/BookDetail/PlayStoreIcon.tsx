import { css } from "@emotion/react";

import React from "react";
import PlayStoreImg from "../../assets/PlayStore.svg?react";
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
