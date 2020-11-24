// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";

import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";
import { LoginDialog } from "./components/User/LoginDialog";
import InternationalizedContent from "./model/InternationalizedContent";
import { IntlProvider } from "react-intl";
import { useGetLocalizations } from "./GetLocalizations";

//console.log("getUserLanguageFromBrowser() " + getUserLanguageFromBrowser());

export const App: React.FunctionComponent<{ uiLanguage?: string }> = (
    props
) => {
    const embeddedMode = window.self !== window.top;

    const [explicitlyChosenLanguageTag] = useState<string | undefined>(
        props.uiLanguage
    );

    // Enhance: this assumes that for each string, you get it in that language or if we don't have
    // a translation for it yet, then you get it in English.
    // We could do better by doing our best for each string. We could give you the string in the language
    // that best meets your needs according to your browser settings, which has an ordered list of languages.
    const {
        closestLanguage: languageTagWeAreUsing,
        stringsForThisLanguage,
    } = useGetLocalizations(explicitlyChosenLanguageTag);

    const slowerLanguageLookupToHelpErrorChecking =
        window.location.hostname === "alpha.bloomlibrary.org" ||
        window.location.hostname === "dev-alpha.bloomlibrary.org" ||
        window.location.hostname === "localhost";
    return (
        <IntlProvider
            locale={languageTagWeAreUsing}
            messages={stringsForThisLanguage}
            defaultLocale={
                slowerLanguageLookupToHelpErrorChecking ? "qaa" : undefined
            }
            onError={(s: any) => {
                // TODO this isn't working yet. The idea is to only print a message for the dev if we're in english and it looks
                // like we haven't registered the string in the "Code Strings.json" file.
                if (s.code === "MISSING_TRANSLATION") {
                    if (languageTagWeAreUsing === "en") {
                        //if (Object.keys(stringsForThisLanguage).length > 0) {
                        console.error(
                            `Add Message to Code Strings.json:\n"${
                                s.descriptor.id
                            }":{"message":"${s.descriptor.defaultMessage}"
                            ${
                                s.descriptor.description
                                    ? ', "description":"${s.descriptor.description}"'
                                    : ""
                            }}`
                        );
                        //}
                    } else {
                        console.info(
                            `Missing translation for '${s.descriptor.id}' in ${languageTagWeAreUsing}`
                        );
                    }
                } else {
                    console.error(`${JSON.stringify(s)}`);
                }
            }}
        >
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                    margin-left: 0;
                    height: 100%;
                `}
            >
                {/* <React.StrictMode>
        In StrictMode,
            * react-image 2.3.0 makes this complain about UNSAFE_componentWillReceiveProps
            * react-lazyload 2.6.5 makes it complain about finDomNode
        These then make it hard to notice new errors, it can be very hard to figure
        out what component is causing the problem if you don't notice it close to the time
        that the error was introduced. So I'm disabling this for now... would be nice to
        enable it once in while and make sure no other problems have snuck in. Eventually
        the above libraries should catch up, or we could switch to ones that do.

        Note, we still wrap any sections that don't have any non-strict children in <React.StrictMode>.

        See also https://github.com/facebook/react/issues/16362
*/}
                <ThemeProvider theme={theme}>
                    <InternationalizedContent />
                </ThemeProvider>
                {embeddedMode || <LoginDialog />} {/* </React.StrictMode> */}
            </div>
        </IntlProvider>
    );
};

export default App;
