// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Fragment, useState } from "react";
import { IFilter } from "../IFilter";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { featureSpecs } from "./FeatureHelper";
import { useTheme, Breadcrumbs } from "@material-ui/core";
import { ByLanguageGroups } from "./ByLanguageGroups";

export const FeaturePage: React.FunctionComponent<{
    featureKey: string;
}> = (props) => {
    const featureKey: string = props.featureKey || "default";
    const filter = { feature: featureKey };
    const featureSpec = featureSpecs.find((s) => s.featureKey === featureKey);

    const [counts, setCounts] = useState("");

    return (
        <React.Fragment>
            <FeatureBanner
                title={featureSpec ? featureSpec.featureTitle : featureKey}
                filter={filter}
                icon={featureSpec?.icon}
                description={featureSpec?.description || <Fragment />}
                bookCountMessage={counts}
            />

            <ListOfBookGroups>
                <ByLanguageGroups
                    titlePrefix={""}
                    filter={filter}
                    reportBooksAndLanguages={(books, langs) =>
                        setCounts(`${books} books in ${langs} languages`)
                    }
                    rowsPerLanguage={1}
                />
            </ListOfBookGroups>
        </React.Fragment>
    );
};

const FeatureBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
    icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    description: JSX.Element;
    bookCountMessage: string;
}> = (props) => {
    const theme = useTheme();
    return (
        <div
            css={css`
                margin-left: 20px;
            `}
        >
            <Breadcrumbs />
            <h1
                css={css`
                    font-size: 24pt;
                `}
            >
                {<span>{props.title}</span>}
            </h1>
            <div
                css={css`
                    display: flex;
                    margin-top: 20px;
                `}
            >
                {props.icon && (
                    <div
                        css={css`
                            margin-right: 50px;
                        `}
                    >
                        {props.icon &&
                            props.icon({
                                fill: theme.palette.secondary.main,
                                style: {
                                    height: "80px",
                                    width: "80px",
                                },
                            })}
                    </div>
                )}
                <div
                    css={css`
                        max-width: 500px;
                    `}
                >
                    {props.description}
                </div>
            </div>

            <br />
            {props.bookCountMessage}
        </div>
    );
};
