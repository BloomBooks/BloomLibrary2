// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { getUrlForTarget } from "./Routes";
import { useContentfulPage } from "./pages/ContentfulPage";
import { useResponsiveChoice } from "../responsiveUtilities";
import { ICardSpec } from "./RowOfCards";

export function useStoryCardSpec(): ICardSpec {
    const getResponsiveChoice = useResponsiveChoice();
    return {
        cardWidthPx: getResponsiveChoice(120, 240) as number,
        cardHeightPx: getResponsiveChoice(190, 190) as number,
        createFromCollection: (collection: ICollection) => (
            <StoryCard story={collection} key={collection.urlKey} />
        ),
    };
}

export const StoryCard: React.FunctionComponent<{ story: ICollection }> = (
    props
) => {
    const { cardWidthPx, cardHeightPx } = useStoryCardSpec();
    const getResponsiveChoice = useResponsiveChoice();
    const url = "/page/" + getUrlForTarget(props.story.urlKey);
    const page = useContentfulPage("page", props.story.urlKey);
    if (!page) {
        return null;
    }
    return (
        <Card
            css={css`
                width: ${cardWidthPx}px;
                // I don't know why, but without this, the edges get cut off
                margin: 1px;
                // enhance: really we just want this margin in-between cards
                margin-right: 20px;
            `}
        >
            <CardActionArea component={Link} to={`${url}`}>
                <CardMedia
                    css={css`
                        height: 160px;
                    `}
                    image={page.cardImage?.url}
                />
                <CardContent
                    css={css`
                        height: ${cardHeightPx}px;
                    `}
                >
                    <Typography
                        color="textSecondary"
                        gutterBottom
                        css={css`
                            font-size: ${getResponsiveChoice(11, 14)}px;
                        `}
                    >
                        {page.category}
                    </Typography>
                    <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        css={css`
                            font-size: ${getResponsiveChoice(12, 16)}px;
                            font-weight: bold;
                        `}
                    >
                        {page.label}
                    </Typography>
                    <Typography
                        variant="body2"
                        component="p"
                        css={css`
                            font-size: ${getResponsiveChoice(11, 14)}px;
                        `}
                    >
                        {page.fields.excerpt}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
