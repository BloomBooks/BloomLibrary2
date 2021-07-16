import { Book } from "../../model/Book";
import React, { useContext } from "react";
import { CachedTablesContext } from "../../model/CacheProvider";

import { featureSpecs } from "../FeatureHelper";
import { commonUI } from "../../theme";
import { MultiChooser } from "./MultiChooser";
import { CreatableMultiChooser } from "./CreatableMultiChooser";

export const BookshelvesChooser: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const { bookshelves: availableBookshelves } = useContext(
        CachedTablesContext
    );
    const bookshelfKeys = availableBookshelves.map((b) => b.key).sort();
    return (
        <MultiChooser
            label="Bookshelves"
            availableValues={bookshelfKeys}
            getLabelForValue={(key) => key}
            getSelectedValues={() => props.book.bookshelves.slice().sort()}
            setSelectedValues={(keys: any[]) => {
                props.book.bookshelves = keys;
            }}
            getStylingForValue={(t) => {
                return {
                    backgroundColor: commonUI.colors.bloomBlue,
                };
            }}
            // We really want only one bookshelf.  As a temporary fix, we restrict the chooser
            // to the most recently chosen, which is the last item in the keys array.  Once the
            // bookshelves have been cleaned up, we can change the bookshelf property to a string
            // and the MultiChooser to a simple chooser.  See BL-10031.
            isSingle={true}
            {...props}
        />
    );
};
export const FeaturesChooser: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const featureKeys = featureSpecs
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
export const TagsChooser: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const { tags: tagChoices } = useContext(CachedTablesContext);
    const tagStyles = [
        {
            match: /^topic:/,
            style: { backgroundColor: "rgb(151,101,143)" },
        },
        {
            match: /Incoming/,
            style: { backgroundColor: "orange" },
        },
        {
            match: /^region:/,
            style: { backgroundColor: "rgb(31,147,164)", color: "white" },
        },
        {
            match: /problem/,
            style: { backgroundColor: "rgb(235,66,45)", color: "white" },
        },
        {
            match: /todo/,
            style: { backgroundColor: "rgb(254,191,0)", color: "black" },
        },
        {
            match: /computedLevel/,
            style: { display: "none" }, // we show this elsewhere, and it's dangerous to let the human change/delete it.
        },
        { match: /./, style: { backgroundColor: "#575757", color: "white" } },
    ];

    return (
        <CreatableMultiChooser
            label="Tags"
            availableValues={tagChoices}
            getSelectedValues={() =>
                props.book.tags
                    .slice()
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
            }}
            getStylingForValue={(t: string) => {
                const defaultStyle = {
                    backgroundColor: "#575757",
                    color: "white",
                };
                for (const tagStyle of tagStyles) {
                    if (tagStyle.match.test(t)) {
                        return { ...defaultStyle, ...tagStyle.style };
                    }
                }
                return defaultStyle;
            }}
            {...props}
        />
    );
};
