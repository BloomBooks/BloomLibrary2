import React from "react";
import { css, cx } from "emotion";

interface IProps {
    logoUrl: string;
}

export const PublisherBanner: React.FunctionComponent<IProps> = props => (
    <div
        className={css`
      background-image: url('${props.logoUrl}');
      background-position: left;
      height: 100px;
      background-repeat: no-repeat;
      background-size: contain;
    `}
    />
);
