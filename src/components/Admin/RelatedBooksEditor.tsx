// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { Book } from "../../model/Book";
import AsyncSelect from "react-select/async";
import { debounce } from "lodash";
import React, { useState } from "react";
import {
    useGetRelatedBooks,
    useBookQuery
} from "../../connection/LibraryQueryHooks";
import Select, { OptionsType, ActionMeta, ValueType } from "react-select";

interface IOption {
    value: string;
    label: string;
}

export const RelatedBooksEditor: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = props => {
    const relatedBooksInDatabase = useGetRelatedBooks(props.book.id);
    const [relatedBooksInEditor, setRelatedBooksInEditor] = useState<
        IOption[] | undefined
    >(undefined);
    const [searchString, setSearchString] = useState<string>();
    const matchingBooks = useBookQuery({}, { search: searchString }, 20);
    const matchingOptions = matchingBooks.map(b => ({
        value: b.objectId,
        label: b.title
    }));

    // This a bit awkward... when the control first comes up, relatedBooksInEditor
    // will be undefined, so we go with what we've gotten back from our async call
    // to the database. That will be [] at first but then if there are already
    // some related books, it will get those.
    // Next, if the user actually interacts with this control, well then the control
    // will start to set relatedBooksInEditor, and so we switch to showing that.
    const currentValueArray: IOption[] =
        relatedBooksInEditor ??
        relatedBooksInDatabase.map(b => ({
            value: b.id,
            label: b.title
        }));

    return (
        <Select
            // name={props.field.labelInUILanguage}
            // components={{
            //     MultiValueLabel: CustomLanguagePill,
            //     Option: CustomOption
            // }}
            //className="select"
            placeholder=""
            isClearable={false} // don't need the extra "x"
            //loadOptions={loadMatchingOptions}
            options={matchingOptions}
            value={currentValueArray}
            //styles={customStyles}
            onChange={(v: any, action: ActionMeta) => {
                // this fixes up a couple problems in the API and type defs
                const currentValues = (v as IOption[] | null) || [];
                setRelatedBooksInEditor(currentValues);
                props.book.relatedBooksIds = currentValues?.map(b => b.value);
                props.setModified(true);
            }}
            onInputChange={(newValue: string) => {
                setSearchString(newValue);
            }}
            isMulti
        />
    );
};
