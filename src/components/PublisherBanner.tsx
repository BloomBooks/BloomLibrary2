import React from "react";
import { css, cx } from "emotion";
import { BannerContents } from "./Banners";
import { IFilter } from "../Router";

interface IProps {
    logoUrl: string;
}

export const PublisherBanner: React.FunctionComponent<{
    logoUrl: string;
    filter: IFilter;
}> = props => (
    <div
        className={css`
      background-image: url('${props.logoUrl}');
      background-position: left;
      height: 100px;
      background-repeat: no-repeat;
      background-size: contain;

    `}
    >
        <BannerContents
            title="Some publisher"
            about="Blah"
            bookCountMessage="{0} books"
            filter={props.filter}
        />
    </div>
);
