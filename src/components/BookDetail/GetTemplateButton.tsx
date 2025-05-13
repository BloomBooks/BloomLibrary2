import { css } from "@emotion/react";

import React from "react";
import { FormattedMessage } from "react-intl";
import TemplateIcon from "../../assets/Template.svg?react";
import { useTheme } from "@material-ui/core";
import { commonUI } from "../../theme";

// This the parts of DownloadToBloomButton that are unique to templates (as opposed to books to translate).
export const GetTemplateButton: React.FunctionComponent<{
    inResources: boolean;
}> = (props) => {
    const theme = useTheme();
    const iconColor = props.inResources
        ? theme.palette.primary.main
        : commonUI.colors.bloomBlue;
    return (
        <React.Fragment>
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                    margin-top: 5px;
                    margin-bottom: 8px;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        margin-bottom: 10px;
                    `}
                >
                    <TemplateIcon fill={iconColor} stroke={iconColor} />
                    <div
                        css={css`
                            text-transform: initial;
                            font-weight: normal;
                            font-size: 14pt;
                            line-height: 1.2;
                            margin-left: 20px;
                            margin-top: 10px; // roughly centers in icon height
                        `}
                    >
                        <FormattedMessage
                            id="book.detail.getTemplateButton.getThis"
                            defaultMessage="Get this Template"
                            values={{
                                emphasis: (str: string) => <em>{str}</em>,
                            }}
                        />
                    </div>
                </div>
                <div
                    css={css`
                        font-size: 9pt;
                        line-height: 1.1;
                        text-transform: initial;
                        margin-top: 5px;
                        text-align: start;
                    `}
                >
                    <FormattedMessage
                        id="book.detail.getTemplateButton.download"
                        defaultMessage='The template book will be downloaded and installed. You can start a book with this template, or add any of its template pages from the "Add Page" dialog box from any book.'
                    />
                </div>
            </div>
        </React.Fragment>
    );
};
