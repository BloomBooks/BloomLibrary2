import { css } from "@emotion/react";

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
import { useResponsiveChoice, useSmallScreen } from "../responsiveUtilities";
import { ICardSpec } from "./CardGroup";
import TruncateMarkup from "react-truncate-markup";
import { useCardHoverStyles } from "../theme";

export function useStoryCardSpec(): ICardSpec {
    const getResponsiveChoice = useResponsiveChoice();
    return {
        cardWidthPx: getResponsiveChoice(120, 240) as number,
        cardHeightPx: getResponsiveChoice(190, 190) as number,
        cardSpacingPx: 20,
        createFromCollection: (collection: ICollection) => (
            <StoryCard story={collection} key={collection.urlKey} />
        ),
    };
}

export const StoryCard: React.FunctionComponent<{ story: ICollection }> = (
    props
) => {
    const { cardWidthPx, cardHeightPx, cardSpacingPx } = useStoryCardSpec();
    const getResponsiveChoice = useResponsiveChoice();
    const isSmall = useSmallScreen();
    const url = "/page/" + getUrlForTarget(props.story.urlKey);
    const page = useContentfulPage("page", props.story.urlKey);
    const hoverStyles = useCardHoverStyles();
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
                margin-right: ${cardSpacingPx}px;
                @media (hover) {
                    &:hover {
                        ${hoverStyles}
                    }
                }
            `}
        >
            <CardActionArea component={Link} to={`${url}`}>
                <CardMedia
                    css={css`
                        height: 160px;
                        background-size: contain; // Check Chetana story card if you change this
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
                        {/* For some reason 8 produces 9 lines...which seems to be about right for the tall cards we have in small
                        screen mode. The wider but shorter big-screen cards only have room for six, though that is usually more text.
                        Big screen cutoff is not tested as I don't know of a story with more than five lines of excerpt. */}
                        <TruncateMarkup lines={isSmall ? 8 : 6}>
                            <span>{page.fields.excerpt}</span>
                        </TruncateMarkup>
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
