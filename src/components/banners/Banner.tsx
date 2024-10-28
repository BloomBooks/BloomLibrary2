import { css } from "@emotion/react";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import { ICollection, IBanner } from "../../model/ContentInterfaces";
import { StandardBannerLayout } from "./StandardBannerLayout";
import { ImageOnRightBannerLayout } from "./ImageOnRightBannerLayout";
import { useClassForSmallScreen } from "../../responsiveUtilities";
import { ReaderBannerLayout } from "./ReaderBannerLayout";
import { useIsAppHosted } from "../appHosted/AppHostedUtils";
export const Banner: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    const defaultTextColor = props.banner.backgroundImage ? "white" : "black";
    const useAppHostedBanner = useIsAppHosted();
    return (
        <div
            className={useClassForSmallScreen()}
            css={css`
                display: flex;
                flex-direction: column;
                overflow: hidden;

                * {
                    color: ${props.banner.textColor || defaultTextColor};
                }

                a,
                a:visited {
                    text-decoration: underline;
                }
                background-color: ${props.banner.backgroundColor};
                /* this can override any of the above*/
                ${props.banner.css}
            `}
        >
            {useAppHostedBanner ? (
                <ReaderBannerLayout
                    {...props}
                    banner={props.banner}
                    bookCount={props.bookCount}
                />
            ) : (
                (props.banner.backgroundColor && (
                    <ImageOnRightBannerLayout
                        {...props}
                        banner={props.banner}
                        bookCount={props.bookCount}
                    />
                )) || (
                    <StandardBannerLayout
                        {...props}
                        banner={props.banner}
                        bookCount={props.bookCount}
                    />
                )
            )}
        </div>
    );
};
