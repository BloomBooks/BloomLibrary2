import { Book } from "../../model/Book";
import React, { useState, useContext } from "react";
import Select from "react-select";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormLabel } from "@material-ui/core";
import { CachedTablesContext } from "../../App";
import { ILanguage } from "../../model/Language";

interface IOption {
    value: ILanguage;
    label: string;
}

export const BookLanguagesControl: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const { languagesByBookCount: availableLanguages } = useContext(
        CachedTablesContext
    );
    const [chosenBookLanguages, setChosenLanguages] = useState(
        props.book.languages
    );

    const [typeAheadString, setTypeAheadString] = useState<string>();
    const matchingLanguages = typeAheadString
        ? availableLanguages.filter(
              (l) => l.name.toLowerCase().indexOf(typeAheadString) > -1
          )
        : availableLanguages;

    return (
        <FormControl fullWidth variant={"outlined"} color={"primary"}>
            <FormLabel component="legend">Languages</FormLabel>
            <Select
                styles={{
                    // Fixes the zindex being too low so that you "see through it"
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                }}
                backspaceRemovesValue={false}
                isClearable={false} // don't need the extra "x"
                options={matchingLanguages
                    // remove from the options any languages we already have
                    .filter(
                        (y) =>
                            !chosenBookLanguages.find(
                                (x) => x.isoCode === y.isoCode
                            )
                    )
                    .map((l) => ({
                        value: l,
                        label: `${l.name} (${l.isoCode})`,
                    }))
                    .sort((x, y) => x.value.name.localeCompare(y.value.name))}
                value={chosenBookLanguages.map((l) => ({
                    value: l,
                    label: `${l.name} (${l.isoCode})`,
                }))}
                onChange={(v: any) => {
                    const currentValues = (v as IOption[] | null) || [];
                    props.book.languages = currentValues?.map(
                        (option) => option.value
                    );
                    setChosenLanguages(props.book.languages); // show the change in the UI
                    props.setModified(true);
                }}
                onInputChange={(newValue: string) => {
                    setTypeAheadString(newValue.toLowerCase());
                }}
                isMulti
            />
        </FormControl>
    );
};
