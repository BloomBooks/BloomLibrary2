// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Fragment } from "react";
import { IFilter } from "../IFilter";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";
import { featureSpecs } from "./FeatureHelper";
import { useTheme, Breadcrumbs } from "@material-ui/core";
import { BookCount } from "./BookCount";

export const FeaturePage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => {
    const featureKey: string = props.filter.feature || "default";
    const featureSpec = featureSpecs.find(s => s.featureKey === featureKey);

    return (
        <React.Fragment>
            <FeatureBanner
                title={props.title}
                filter={props.filter}
                icon={featureSpec?.icon}
                description={featureSpec?.description || <Fragment />}
            />

            <ListOfBookGroups>
                <BookGroup title={`All`} filter={props.filter} rows={20} />
            </ListOfBookGroups>
        </React.Fragment>
    );
};

const FeatureBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
    icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    description: JSX.Element;
}> = props => {
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
                                    width: "80px"
                                }
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
            <BookCount filter={props.filter} />
        </div>
    );
};
