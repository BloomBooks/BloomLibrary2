// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Book } from "../../model/Book";
import { FormattedMessage } from "react-intl";
import { getAllFeaturesWithTheseMarkedPresent } from "../FeatureHelper";
import { commonUI } from "../../theme";
import { getAnchorProps } from "../../embedded";
import { Link } from "@material-ui/core";
import Typography from "@material-ui/core/Typography/Typography";

// Shows all the possible features, each as its icon, with a title that is its name.
// Each functions as a button to go to a collection of books with the features.
// The ones present in this book are bloomBlue, others are gray.
export const FeaturesGroup: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const featureIconHeight = 36;
    // Don't display the language-specific ones since we always have a generic one to go with it.
    // e.g. We might have [blind, blind:en]. We only need "blind" in the list we pass to getFeatures
    const features = getAllFeaturesWithTheseMarkedPresent(
        props.book.features.filter((f) => f.indexOf(":") < 0)
    );
    const featureRightMargin = "10px";
    const disabledFeatureColor = "#DDD";
    return (
        <div css={css``}>
            <div
                css={css`
                    /* display: inline-block;
                    margin-top: 12px;*/
                `}
            >
                <Typography variant="caption">
                    <FormattedMessage
                        id="book.metadata.features"
                        defaultMessage="Features"
                    />
                </Typography>
            </div>
            <div
                css={css`
                    // eyeball this about to the middle of the download icons
                    margin-top: 15px;
                    display: flex;
                `}
            >
                {features.map((feature) => (
                    <Link
                        {...getAnchorProps(
                            "/" + (feature.collectionHref || feature.featureKey)
                        )}
                        key={feature.featureKey}
                    >
                        <div
                            css={css`
                                position: relative;
                            `}
                        >
                            {feature.icon({
                                key: feature.featureKey,
                                fill: feature.isPresent
                                    ? commonUI.colors.bloomBlue
                                    : disabledFeatureColor, // They must have a color specified or will be transparent
                                // I can't figure out how to make emotion CSS work here.
                                style: {
                                    // I'd prefer to just specify a height and let width be automatic.
                                    // But then the browser keeps the original width of the SVG and pads
                                    // with (too much) white space.
                                    // I was afraid specifying both would mess up aspect ratios but
                                    // it doesn't seem to.
                                    height: featureIconHeight + "px",
                                    width: featureIconHeight + "px",
                                    marginRight: featureRightMargin,
                                    //marginTop: "2px",
                                },
                            })}
                            {feature.isPresent || (
                                <div
                                    // Trick taken from https://stackoverflow.com/questions/18012420/draw-diagonal-lines-in-div-background-with-css
                                    // the gradient somehow draws a diagonal line across the div.
                                    css={css`
                                        position: absolute;
                                        top: 0;
                                        bottom: 0;
                                        left: 0;
                                        right: ${featureRightMargin};
                                        // behind the icon, so as not to interfere with hover displaying icon title
                                        // Seems we should be able to achieve this by putting it before the icon,
                                        // but that didn't work.
                                        z-index: -1;
                                        background: linear-gradient(
                                            to top left,
                                            rgba(0, 0, 0, 0) 0%,
                                            rgba(0, 0, 0, 0) calc(50% - 0.8px),
                                            ${disabledFeatureColor} 50%,
                                            rgba(0, 0, 0, 0) calc(50% + 0.8px),
                                            rgba(0, 0, 0, 0) 100%
                                        );
                                    `}
                                ></div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
