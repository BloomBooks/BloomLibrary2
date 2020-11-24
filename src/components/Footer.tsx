// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import SILLogo from "../assets/SIL.png";
import GitHubLogo from "../assets/GitHub-Mark-Light-32px.png";
import React from "react";
import { BlorgLink as Link } from "./BlorgLink";
import { getAnchorProps } from "../embedded";
import { FormattedMessage, useIntl } from "react-intl";

export const Footer: React.FunctionComponent = () => {
    const l10n = useIntl();
    const separator = (
        <span
            css={css`
                flex-shrink: 0; //https://css-tricks.com/couple-takes-sticky-footer/
                width: 20px;
                display: inline-block;
                text-align: center;
            `}
        >
            {"|"}
        </span>
    );

    const sil = (
        <Link
            css={css`
                display: flex;
                * {
                    margin-top: auto;
                    margin-bottom: auto;
                }
            `}
            {...getAnchorProps("https://www.sil.org")}
        >
            <img
                src={SILLogo}
                alt={l10n.formatMessage({
                    id: "footer.silLogo",
                    defaultMessage: "SIL Logo",
                })}
            />
            <div
                css={css`
                    margin-left: 10px;
                `}
            >
                {"© 2020 SIL International"}
            </div>
        </Link>
    );

    const github = (
        <Link {...getAnchorProps("https://github.com/bloombooks")}>
            <img
                css={css`
                    height: 32px !important;
                `}
                src={GitHubLogo}
                alt={l10n.formatMessage({
                    id: "footer.githubLogo",
                    defaultMessage: "Github Logo",
                })}
            />
        </Link>
    );
    const contentful = (
        <Link
            css={css`
                margin-left: auto;
            `}
            {...getAnchorProps("https://github.com/bloombooks")}
        >
            <img
                src="https://images.ctfassets.net/fo9twyrwpveg/7Htleo27dKYua8gio8UEUy/0797152a2d2f8e41db49ecbf1ccffdaa/PoweredByContentful_DarkBackground_MonochromeLogo.svg"
                alt={l10n.formatMessage({
                    id: "footer.contentful",
                    defaultMessage: "Powered by Contentful",
                })}
            />
        </Link>
    );
    return (
        <div
            css={css`
                padding: 20px;
                overflow-x: hidden; // At small screen widths, the Footer can cause horizontal scrolling.
                min-height: 120px;
                *,
                a,
                a:visited {
                    color: white !important;
                    text-decoration: none;
                }
                a {
                    display: flex;
                    height: 50px !important;
                }
                a *,
                span {
                    margin-top: auto !important;
                    margin-bottom: auto !important;
                }

                background-color: #525252;
            `}
            role="contentinfo" // standard role for footers
        >
            {/* Top Row */}
            <div
                css={css`
                    height: 50px;
                    display: flex;
                `}
            >
                <Link href="/page/support" to="/page/support">
                    <FormattedMessage
                        id="footer.support"
                        defaultMessage="Support"
                    />
                </Link>
                {separator}
                <Link href="/page/create/downloads" to="/page/create/downloads">
                    <FormattedMessage
                        id="downloads"
                        defaultMessage="Downloads"
                    />
                </Link>
                {separator}
                <Link href="/page/termsOfUse" to="/page/termsOfUse">
                    <FormattedMessage
                        id="footer.terms"
                        defaultMessage="Terms of Use"
                    />
                </Link>
                {separator}
                <Link href="/page/privacyNotice" to="/page/privacyNotice">
                    <FormattedMessage
                        id="footer.privacy"
                        defaultMessage="Privacy Policy"
                    />
                </Link>
            </div>

            <div
                css={css`
                    display: flex;

                    a {
                        margin-right: 45px;
                    }
                    // sil logo on left, everything else from the right
                    a:first-of-type {
                        margin-left: 0;
                    }
                    // margin between them, all, but not needed for last item
                    *:last-child {
                        margin-right: 0;
                    }
                    img {
                        height: 40px;
                    }
                `}
            >
                {sil}
                {contentful}
                {github}
            </div>
        </div>
    );
};
