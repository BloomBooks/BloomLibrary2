// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import Select from "@material-ui/core/Select";
import { IScreenOption } from "./StatsInterfaces";
import FormControl from "@material-ui/core/FormControl";
import { IScreen } from "./CollectionStatsPage";
import { useIntl } from "react-intl";

// A component that lists all the options of a particular screen, e.g. whether to show by month or year.
export const ScreenOptionsSelect: React.FunctionComponent<{
    screen: IScreen;
    chosenOptions: IScreenOption[];
    className?: string;
    onChange: (options: IScreenOption[]) => void;
}> = (props) => {
    const l10n = useIntl();
    // enhance: currently we can actually only handle a single chosen option
    // we would like to be able to provide groups of values, e.g. [day/month/year, everywhere/Guatemala]
    const optionValue =
        props.chosenOptions.length > 0 ? props.chosenOptions[0] : "";
    return (
        <FormControl className={props.className}>
            <Select
                css={css`
                    //padding-left: 0;
                `}
                native
                // notice that we need a string, so we take, e.g. {label:"by month", value:"month"} and turn that into a string and call it a value
                value={JSON.stringify(optionValue)}
                onChange={(e) => {
                    // now on the way back out, we convert back from these strings we're using to IScreenOption objects
                    const oneOption = JSON.parse(
                        e.target.value as string
                    ) as IScreenOption;
                    props.onChange([oneOption]);
                }}
            >
                {props.screen.options!.map((option, index) => (
                    <option key={index} value={JSON.stringify(option)}>
                        {l10n.formatMessage({
                            id: "stats.options." + option.label,
                            defaultMessage: option.label,
                        })}
                    </option>
                ))}
            </Select>
        </FormControl>
    );
};
