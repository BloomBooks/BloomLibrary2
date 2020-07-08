import { Book } from "../../model/Book";
import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormLabel } from "@material-ui/core";

interface IOption {
    value: any;
    label: string;
    actualObjectValue: any;
}

// Just wraps some other multi-select control with a simple API, making it easier
// for us to write controls that use it and conceivably switch to another UI library
// (e.g. Material-UI) in the future without having to rewrite all those controls.
// Very similar to MultiChooser, but using a different embedded control to support
// creating new items. Also, we currently only support strings as options,
// since it would otherwise be difficult to know what to do with new items.
// We could add something like MultiChooser's getLabelForOption and a new
// createOptionForNewLabel callback, but quite possibly YAGNI.
export const CreatableMultiChooser: React.FunctionComponent<{
    book: Book;
    label: string;
    setModified: (modified: boolean) => void;
    availableValues: string[];
    setSelectedValues: (items: string[]) => void;
    getSelectedValues: () => string[];
    getStylingForValue?: (v: string) => object;
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
            <FormLabel component="legend">{props.label}</FormLabel>
            <CreatableSelect
                styles={{
                    // Fixes the zindex being too low so that you "see through it"
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    ...optionStyles,
                }}
                backspaceRemovesValue={false}
                isClearable={false} // don't need the extra "x"
                options={props.availableValues.map((c) => ({
                    value: c,
                    label: c,
                }))}
                value={chosenItems.map((c) => ({
                    label: c,
                    value: c,
                }))}
                onChange={(v: any) => {
                    const currentValues = (v as IOption[] | null) || [];
                    props.setSelectedValues(currentValues?.map((x) => x.value));
                    setChosenItems(currentValues.map((v) => v.value)); // show the change in the UI
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
