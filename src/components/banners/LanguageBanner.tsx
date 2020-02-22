// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx, SerializedStyles } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { BannerContents } from "./Banners";
import { IFilter } from "../../IFilter";
import { ILanguage } from "../../model/Language";
import { useGetLanguageInfo } from "../../connection/LibraryQueryHooks";
import { languageBannerCustomizations } from "./LanguageCustomizations";
import { useTheme } from "@material-ui/core";

// maybe todo? Maybe make this just generic for all pages, not just language pages
export interface ILanguagePageSpec {
    languageTag: string;
    bannerCss?: SerializedStyles;
    about?: JSX.Element;
    imageCredits?: JSX.Element;
    // todo: we can't actually use this until we hoist the lookup
    // of the language info from the banner up to the page
    pageBackground?: string;
}

export const LanguageBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => {
    const languages: ILanguage[] = useGetLanguageInfo(props.filter.language!);
    const theme = useTheme();
    const whileWaitingSpec: ILanguagePageSpec = {
        languageTag: "*",
        bannerCss: css`
            #contrast-overlay {
                background-color: transparent;
            }
        `
    };

    const defaultSpec: ILanguagePageSpec = {
        languageTag: "*",
        bannerCss: css`
            background-color: ${theme.palette.secondary.main};
            #contrast-overlay {
                background-color: transparent;
            }
        `
    };

    let spec = whileWaitingSpec;
    if (languages.length > 0) {
        const s = languageBannerCustomizations.find(
            b => b.languageTag === languages[0].isoCode
        );
        spec = s ?? defaultSpec;
    }

    return (
        // <div className={"banner"} css={spec.bannerCss}>
        <BannerContents
            //css={spec.bannerCss}
            title={`${props.title}`}
            about={spec.about} // enhance: get text about the language from the database
            bookCountMessage="{0} books"
            filter={props.filter}
            imageCredits={spec.imageCredits}
            bannerCss={spec.bannerCss}
        />
        // </div>
    );
};
