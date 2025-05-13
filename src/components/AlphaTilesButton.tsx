import { css } from "@emotion/react";

import React from "react";
import AlphaTilesLogo from "../assets/AlphaTilesMinimal.png";
import { CheapCard } from "./CheapCard";
import GooglePlayLogo_EN from "../assets/GetItOnGooglePlay_en.png";
import GooglePlayLogo_ES from "../assets/GetItOnGooglePlay_es.png";
import GooglePlayLogo_FR from "../assets/GetItOnGooglePlay_fr.png";
import { useIntl } from "react-intl";

export const AlphaTilesButton: React.FunctionComponent<{
    languageName: string;
    url: string;
}> = (props) => {
    const l10 = useIntl();
    const description = l10.formatMessage(
        {
            id: "alphaTilesDescription",
            defaultMessage: "{languageName} Literacy Game App",
        },
        { languageName: props.languageName }
    );
    const language = navigator.language.toLowerCase();
    let googlePlayLogo = GooglePlayLogo_EN;

    if (language.startsWith("es")) {
        googlePlayLogo = GooglePlayLogo_ES;
    } else if (language.startsWith("fr")) {
        googlePlayLogo = GooglePlayLogo_FR;
    }

    return (
        <CheapCard
            css={css`
                flex-direction: row;
                width: fit-content;
                padding: 10px;
                margin-left: auto;
            `}
            url={props.url}
        >
            <div
                css={css`
                    display: flex;
                    flex-direction: row;
                `}
            >
                <img alt="Alpha Tiles Logo" src={AlphaTilesLogo} />
                <div
                    css={css`
                        margin-top: auto;
                        margin-bottom: auto;
                        margin-left: 5px;
                        margin-right: 20px;
                    `}
                >
                    <div
                        css={css`
                            font-weight: bold;
                            font-size: 14px;
                            line-height: 1em;
                        `}
                    >
                        {description}
                    </div>
                    <div
                        css={css`
                            font-weight: bold;
                            font-size: 12px;
                        `}
                    >
                        {/* as far as I can tell, they don't localize this */}
                        Alpha Tiles
                    </div>
                </div>
            </div>
            <img
                css={css`
                    height: 45px;
                    width: auto;
                `}
                alt="Google Play Logo"
                src={googlePlayLogo}
            />
        </CheapCard>
    );
};
