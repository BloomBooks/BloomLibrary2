// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import SILLogo from "../assets/SIL.png";
import GitHubLogo from "../assets/GitHub-Mark-Light-32px.png";
import React, { useEffect, useState } from "react";
import { BlorgLink } from "../components/BlorgLink";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@material-ui/core";

//import { Link } from "react-router-dom";
export const Footer: React.FunctionComponent = () => {
    const l10n = useIntl();

    const [donateShiftWidth, setDonateShiftWidth] = useState("475px");

    const padding = 20; // left + right
    const link = document.getElementsByClassName("privacy-notice-link").item(0);
    const linkRight = link?.getBoundingClientRect()?.right ?? 375;
    const donateText = l10n.formatMessage({
        id: "footer.donate",
        defaultMessage: "Donate",
    });
    useEffect(() => {
        const donateButton = document
            .getElementsByClassName("donate-button")
            .item(0);
        const donateWidth = donateButton?.clientWidth ?? 72;
        setDonateShiftWidth(`${linkRight + donateWidth + 8 + padding}px`); // width at which footer layout must change
    }, [donateText, linkRight, donateShiftWidth]);

    const githubShiftWidth = "435px"; // The icons are fixed size, so this can be a true constant.

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
        // eslint-disable-next-line react/jsx-no-target-blank
        <a
            href="https://www.sil.org"
            rel="noopener"
            target="_blank"
            css={css`
                display: flex;
                * {
                    margin-top: auto;
                    margin-bottom: auto;
                }
            `}
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
                {`© ${new Date().getFullYear()} SIL International`}
            </div>
        </a>
    );

    const github = (
        // eslint-disable-next-line react/jsx-no-target-blank
        <a href="https://github.com/bloombooks" rel="noopener" target="_blank">
            <img
                css={css`
                    height: 32px !important;
                    @media (max-width: ${githubShiftWidth}) {
                        // when narrow, need to pull out of flex layout into absolute positioning
                        position: absolute;
                        right: 20px;
                        bottom: 83px;
                    }
                `}
                src={GitHubLogo}
                alt={l10n.formatMessage({
                    id: "footer.githubLogo",
                    defaultMessage: "Github Logo",
                })}
            />
        </a>
    );
    const contentful = (
        // eslint-disable-next-line react/jsx-no-target-blank
        <a
            href="https://www.contentful.com/"
            rel="noopener"
            target="_blank"
            css={css`
                margin-left: auto;
            `}
        >
            <img
                src="https://images.ctfassets.net/fo9twyrwpveg/7Htleo27dKYua8gio8UEUy/0797152a2d2f8e41db49ecbf1ccffdaa/PoweredByContentful_DarkBackground_MonochromeLogo.svg"
                alt={l10n.formatMessage({
                    id: "footer.contentful",
                    defaultMessage: "Powered by Contentful",
                })}
            />
        </a>
    );
    return (
        <div
            css={css`
                padding: ${padding}px;
                overflow-x: hidden; // At small screen widths, the Footer can cause horizontal scrolling.
                min-height: 145px;
                @media (max-width: ${donateShiftWidth}) {
                    min-height: 195px;
                }
                @media (max-width: ${githubShiftWidth}) {
                    min-height: 235px;
                }
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
                a.donate-button {
                    height: inherit !important;
                }
                /* If someone can tell me why we need this rule, we can work on a solution,
                   but it messes up the footer link row "Support | Downloads | etc."
                a *,
                span {
                    margin-top: auto !important;
                    margin-bottom: auto !important;
                } */

                background-color: #525252;
                position: relative; // allow position:absolute to work for children.
            `}
            role="contentinfo" // standard role for footers
        >
            <Button
                css={css`
                    border: 2px solid;
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    font-weight: bold;
                `}
                className="donate-button"
                href="https://give.sil.org/give/470996"
            >
                {donateText}
            </Button>
            {/* Top Row */}
            <div
                css={css`
                    height: 50px;
                    display: flex;
                    @media (max-width: ${donateShiftWidth}) {
                        margin-top: 50px; // allow space for absolutely positioned Donate button
                    }
                `}
            >
                <BlorgLink href="/page/support">
                    <FormattedMessage
                        id="footer.support"
                        defaultMessage="Support"
                    />
                </BlorgLink>
                {separator}
                <BlorgLink href="/page/create/downloads">
                    <FormattedMessage
                        id="downloads"
                        defaultMessage="Downloads"
                    />
                </BlorgLink>
                {separator}
                <BlorgLink href="/page/termsOfUse">
                    <FormattedMessage
                        id="footer.terms"
                        defaultMessage="Terms of Use"
                    />
                </BlorgLink>
                {separator}
                <BlorgLink
                    href="/page/privacyNotice"
                    className="privacy-notice-link"
                >
                    <FormattedMessage
                        id="footer.privacy"
                        defaultMessage="Privacy Policy"
                    />
                </BlorgLink>
            </div>
            <div
                css={css`
                    display: flex;
                    margin-top: 5px; // more space between the Donate Button and github button
                    @media (max-width: ${githubShiftWidth}) {
                        margin-top: 45px; // allow space for absolutely positioned github button
                    }

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

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default Footer;
