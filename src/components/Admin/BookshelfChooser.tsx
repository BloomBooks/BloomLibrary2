import { Book } from "../../model/Book";
import React, { useState, useContext } from "react";
import Select from "react-select";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormLabel } from "@material-ui/core";
import { CachedTablesContext } from "../../App";

interface IOption {
    value: string;
    label: string;
}

export const BookshelfChooser: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = props => {
    const { bookshelves: availableBookshelves } = useContext(
        CachedTablesContext
    );
    const [chosenBookshelfKeys, setChosenBookshelfKeys] = useState(
        props.book.bookshelves
    );

    const [searchString, setSearchString] = useState<string>();
    const matchingBookshelves = searchString
        ? availableBookshelves.filter(
              b => b.englishName.toLowerCase().indexOf(searchString) > -1
          )
        : availableBookshelves;

    return (
        <FormControl fullWidth variant={"outlined"} color={"primary"}>
            <FormLabel component="legend">Bookshelves</FormLabel>
            <Select
                id="bookshelf-chooser"
                backspaceRemovesValue={false}
                isClearable={false} // don't need the extra "x"
                options={matchingBookshelves.map(b => ({
                    value: b.key,
                    label: b.englishName
                }))}
                value={chosenBookshelfKeys.map(b => ({
                    value: b,
                    label: b
                }))}
                onChange={(v: any) => {
                    const currentValues = (v as IOption[] | null) || [];
                    props.book.bookshelves = currentValues?.map(b => b.value);
                    setChosenBookshelfKeys(props.book.bookshelves); // show the change in the UI
                    props.setModified(true);
                }}
                onInputChange={(newValue: string) => {
                    setSearchString(newValue.toLowerCase());
                }}
                isMulti
            />
        </FormControl>
    );
};
