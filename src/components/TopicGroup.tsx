// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";

import { CategoryCardGroup } from "./CategoryCardGroup";
import { CheapCard } from "./CheapCard";
import { BookCount } from "./BookCount";

export const TopicGroup: React.FunctionComponent<{}> = () => {
    const cards = [
        "Agriculture",
        "Animal Stories",
        "Business",
        "Dictionary",
        "Environment",
        "Primer",
        "Math",
        "Culture",
        "Science",
        "Story Book",
        "Traditional Story",
        "Health",
        "Personal Development",
        "Spiritual",
    ]
        .sort()
        .map((t) => {
            return <TopicCard topic={t} />;
        });

    return <CategoryCardGroup title={"Topics"}>{cards}</CategoryCardGroup>;
};

const TopicCard: React.FunctionComponent<{ topic: string }> = (props) => {
    return (
        <CheapCard
            {...props} // needed for swiper to work
            css={css`
                width: 220px;
                padding: 10px;
                height: 100px;
            `}
            href={"/topic/" + props.topic}
        >
            <h2
                css={css`
                    text-align: center;
                    flex-grow: 1; // push the rest to the bottom
                `}
            >
                {props.topic}
            </h2>

            <div
                css={css`
                    text-align: center;
                `}
            >
                <BookCount
                    message={`{0} Books`}
                    filter={{ topic: props.topic }}
                />
            </div>
        </CheapCard>
    );
};
