// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CheapCard } from "./CheapCard";
import { IFilter } from "../IFilter";
import { BookCount } from "./BookCount";
//import teamIcon from "../assets/team.svg";
import booksIcon from "../assets/books.svg";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import { ImgWithCredits } from "../ImgWithCredits";
import { useIntl } from "react-intl";
import { propsToHideAccessibilityElement } from "../Utilities";
import { ICollection } from "../model/ContentInterfaces";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { useContentfulPage } from "./pages/ContentfulBasePage";
import { Link, useHistory } from "react-router-dom";
import { getUrlForTarget } from "./Routes";
export const StoryCard: React.FunctionComponent<{ story: ICollection }> = (
    props
) => {
    const url = getUrlForTarget("/page/create/" + props.story.urlKey); // REVIEW
    const page = useContentfulPage("page", props.story.urlKey);
    if (!page) {
        return null;
    }
    return (
        <Card
            css={css`
                width: 240px;
            `}
        >
            <CardActionArea component={Link} to={`${url}`}>
                <CardMedia
                    css={css`
                        width: 240px;
                        height: 160px;
                    `}
                    image={page.cardImage?.url}
                    title="Contemplative Reptile"
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
