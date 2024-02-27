import { Book } from "../../model/Book";
import React, { useContext } from "react";
import { CachedTablesContext } from "../../model/CacheProvider";

import { featureSpecs } from "../FeatureHelper";
import { MultiChooser } from "./MultiChooser";
import { CreatableMultiChooser } from "./CreatableMultiChooser";

export const FeaturesChooser: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const featureKeys = featureSpecs
        .filter((f) => !f.languageDependent) // Language-dependent ones are problematic, because we don't have UI to specify their language. So filter them out.
        .map((f) => f.featureKey)
        .slice()
        .sort();
    return (
        <MultiChooser
            label="Features"
            availableValues={featureKeys}
            getLabelForValue={(key) => key}
            getSelectedValues={() => props.book.features.slice().sort()}
            setSelectedValues={(keys: any[]) => {
                props.book.features = keys;
            }}
            {...props}
        />
    );
};

export const BookLanguagesChooser: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const { languagesByBookCount: availableLanguages } = useContext(
        CachedTablesContext
    );

    return (
        <MultiChooser
            label="Languages"
            availableValues={availableLanguages.filter(
                (l) =>
                    !props.book.languages.some((x) => x.isoCode === l.isoCode)
            )}
            getLabelForValue={(v) => `${v.name} (${v.isoCode})`}
            getSelectedValues={() => props.book.languages}
            setSelectedValues={(items: any[]) => {
                props.book.languages = items;
            }}
            {...props}
        />
    );
};

// TODO replace as part of BL-13034
function SaveBookTags(book: Book) {
    alert("not implemented yet");
}

export const TagsChooser: React.FunctionComponent<{
    book: Book;
    label?: string;
    setModified: (modified: boolean) => void;
    saveImmediately?: boolean;
    getStylingForValue?: (tag: string) => React.CSSProperties;
}> = (props) => {
    const { tags: tagChoices } = useContext(CachedTablesContext);

    return (
        <CreatableMultiChooser
            availableValues={tagChoices}
            getSelectedValues={() =>
                props.book.tags
                    .slice()
                    // TODO see if we need to change this as part of BL-13034:
                    // TODO: this is only safe if something (e.g. Book.saveAdminDataToParse) is going to put it back
                    // Try not filtering, and instead try hiding
                    //.filter((t) => !tagIsShownElsewhereInUI(t))
                    .sort()
            }
            setSelectedValues={(items: string[]) => {
                // Force a default prefix of "tag:" if the user does not provide one.
                // Otherwise, the prefix will default to "topic:", which isn't necessarily wanted.
                // See https://issues.bloomlibrary.org/youtrack/issue/BL-8990.
                const xitems = items.map((item: string) => {
                    const result = item.includes(":") ? item : "tag:" + item;

                    // Adding the new tag here lets us use it throughout the site (other books, grid filtering, etc.)
                    //  even before the site reloads. That's because we are modifying the underlying array,
                    //  the same one in CachedTablesContext.
                    // When the site reloads, the new tag will be in the array when it is loaded from parse.
                    if (!tagChoices.includes(result)) {
                        tagChoices.push(result);
                        tagChoices.sort();
                    }

                    return result;
                });
                props.book.tags = xitems;
                if (props.saveImmediately) {
                    SaveBookTags(props.book);
                }
            }}
            {...props}
        />
    );
};
