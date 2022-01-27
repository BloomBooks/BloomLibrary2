import { Book } from "../../model/Book";
import React, { useState } from "react";
import Select from "react-select";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormLabel } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";
interface IOption {
    value: any;
    label: string;
    actualObjectValue: any;
}

// Just wraps some other multi-select control with a simple API, making it easier
// for us to write controls that use it and conceivably switch to another UI library
// (e.g. Material-UI) in the future without having to rewrite all those controls.
export const MultiChooser: React.FunctionComponent<{
    book: Book;
    label: string;
    setModified: (modified: boolean) => void;
    availableValues: any[];
    setSelectedValues: (items: any[]) => void;
    getSelectedValues: () => any[];
    getLabelForValue: (v: any) => string;
    getStylingForValue?: (v: any) => object;
    isDisabled?: boolean | undefined;
    helpText?: string;
}> = (props) => {
    const [chosenItems, setChosenItems] = useState(props.getSelectedValues());

    const optionStyles = {
        multiValue: (styles: any, x: any) => {
            const customStyling = props.getStylingForValue
                ? props.getStylingForValue(x.data.value)
                : undefined;
            return {
                ...styles,
                borderRadius: "10px",
                backgroundColor: "#575757",
                color: "white",
                paddingLeft: "5px",
                ...customStyling,
            };
        },
        multiValueLabel: (styles: any, x: any) => {
            return {
                ...styles,
                color: "white",
            };
        },
    };

    return (
        <FormControl fullWidth variant={"outlined"} color={"primary"}>
            <FormLabel component="legend">
                {props.label}
                {props.helpText && (
                    <span title={props.helpText}>
                        <InfoIcon style={{ height: "15px" }} />
                    </span>
                )}
            </FormLabel>

            <Select
                isDisabled={props.isDisabled === true}
                styles={{
                    // Fixes the zindex being too low so that you "see through it"
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    ...optionStyles,
                }}
                backspaceRemovesValue={false}
                isClearable={false} // don't need the extra "x"
                options={props.availableValues
                    // note, if the values and options are not the same set of objects,
                    // we will offer options even for items we already have. Currently
                    // the BookLanguagesChooser does this filtering when computing our
                    // props.availableValues.
                    // Alternatively, we could hav done the filter here, but it would require
                    // getting the label for each option and seeing if there was already some
                    // value with that label. (Or providing yet another function, areEqualOptions(a,b))
                    .map((c) => ({
                        value: props.getLabelForValue(c),
                        label: props.getLabelForValue(c),
                        actualObjectValue: c,
                    }))}
                value={chosenItems.map((c) => ({
                    label: props.getLabelForValue(c),
                    // In order to not get the "duplicate keys" problem, react-select as of April 2020 cannot handle
                    // having the value be an object: https://github.com/JedWatson/react-select/issues/2656
                    // So the workaround is to use the label as the value, but then store the actual object
                    // in a new field, here we just made up "actualObjectValue"
                    value: props.getLabelForValue(c),
                    actualObjectValue: c,
                }))}
                onChange={(v: any) => {
                    const currentValues = (v as IOption[] | null) || [];
                    props.setSelectedValues(
                        currentValues?.map((x) => x.actualObjectValue)
                    );
                    setChosenItems(
                        currentValues.map((v) => v.actualObjectValue)
                    ); // show the change in the UI
                    props.setModified(true);
                }}
                // onInputChange={(newValue: string) => {
                //     setTypeAheadString(newValue.toLowerCase());
                // }}
                isMulti
            />
        </FormControl>
    );
};
