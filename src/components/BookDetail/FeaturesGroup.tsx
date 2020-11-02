// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { Book } from "../../model/Book";
import { FormattedMessage } from "react-intl";
import titleCase from "title-case";
import { getAllFeaturesWithTheseMarkedPresent } from "../FeatureHelper";
import { commonUI } from "../../theme";

// Shows all the possible features, each as its icon, with a title that is its name.
// Each functions as a button to go to a collection of books with the features.
// The ones present in this book are bloomBlue, others are gray.
export const FeaturesGroup: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const featureIconHeight = 36;
    // Don't display the language-specific ones since we always have a generic one to go with it.
    // e.g. We might have [blind, blind:en]. We only need "blind" in the list we pass to getFeatures
    const features = getAllFeaturesWithTheseMarkedPresent(props.book.features.filter((f) => f.indexOf(":") < 0));
    return(
                <div css={css`display:flex;justify-content:flex-end;`}>
                    <div css={css`display:inline-block; margin-top:12px;`}>
                    <FormattedMessage
                        id="book.metadata.features"
                        defaultMessage="Features:"
                    />
                    </div>
                    {features.map((feature) =>
                        <a href={"/" + (feature.collectionHref || feature.featureKey)}>
                            {feature.icon({
                                key: feature.featureKey,
                                fill: feature.isPresent ? commonUI.colors.bloomBlue : "#DDD", // They must have a color specified or will be transparent
                                // I can't figure out how to make emotion CSS work here.
                                style: {
                                    // I'd prefer to just specify a height and let width be automatic.
                                    // But then the browser keeps the original width of the SVG and pads
                                    // with (too much) white space.
                                    // I was afraid specifying both would mess up aspect ratios but
                                    // it doesn't seem to.
                                    height: featureIconHeight + "px",
                                    width: featureIconHeight + "px",
                                    marginLeft: "10px",
                                    marginTop: "2px",
                                },
                            })
                        }
                        </a>
                    )}
                </div>
    );}
