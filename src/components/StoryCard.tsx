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

export const storyCardWidth = "240px";

export const StoryCard: React.FunctionComponent<{ story: ICollection }> = (
    props
) => {
    const url = "/page/" + getUrlForTarget(props.story.urlKey);
    const page = useContentfulPage("page", props.story.urlKey);
    if (!page) {
        return null;
    }
    return (
        <Card
            css={css`
                width: ${storyCardWidth};
                // I don't know why, but without this, the edges get cut off
                margin: 1px;
                // enhance: really we just want this margin in-between cards
                margin-right: 20px;
            `}
        >
            <CardActionArea component={Link} to={`${url}`}>
                <CardMedia
                    css={css`
                        width: 240px;
                        height: 160px;
                    `}
                    image={page.cardImage?.url}
                />
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        {page.category}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="h2">
                        {page.label}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                    >
                        {page.fields.excerpt}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
