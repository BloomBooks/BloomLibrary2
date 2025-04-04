import { css } from "@emotion/react";

import React from "react";
import { Book } from "../../model/Book";
import { FormattedMessage } from "react-intl";
import { getAllFeaturesWithTheseMarkedPresent } from "../FeatureHelper";
import { commonUI } from "../../theme";
import Typography from "@material-ui/core/Typography/Typography";
import { BlorgLink } from "../BlorgLink";

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
                `}
            >
                {features.map((feature) => (
                    <BlorgLink
                        newTabIfEmbedded={true}
                        href={
                            "/" + (feature.collectionHref || feature.featureKey)
                        }
                        key={feature.featureKey}
                    >
                        {feature.icon({
                            key: feature.featureKey,
                            fill: feature.isPresent
                                ? commonUI.colors.bloomBlue
                                : commonUI.colors.disabledIconGray, // They must have a color specified or will be transparent
                            // I can't figure out how to make emotion CSS work here.
                            style: {
                                // I'd prefer to just specify a height and let width be automatic.
                                // But then the browser keeps the original width of the SVG and pads
                                // with (too much) white space.
                                // I was afraid specifying both would mess up aspect ratios but
                                // it doesn't seem to.
                                height: featureIconHeight + "px",
                                width: featureIconHeight + "px",
                                marginRight: "10px",
                            },
                        })}
                    </BlorgLink>
                ))}
            </div>
        </div>
    );
};
