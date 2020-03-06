// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { useSearchBooks } from "../../connection/LibraryQueryHooks";
import { Book } from "../../model/Book";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { TextField, IconButton } from "@material-ui/core";
import { observer } from "mobx-react";
import { useTheme } from "@material-ui/core/styles";
import { Tag } from "./Tag";
import { Autocomplete } from "@material-ui/lab";
import AddCircleIcon from "@material-ui/icons/AddCircle";

interface IProps {
    book: Book;
    setModified: (modified: boolean) => void;
    borderColor: string;
}
// This displays a list of a book's tags and lets you edit them using type-ahead.
// Any change (including an incompletely typed new tag) results
// in a callback to setModified.
export const TagsList: React.FunctionComponent<IProps> = observer(props => {
    const theme = useTheme();
    // Whether to show the box used to type a new tag
    const [newTagBoxVisible, setNewTagBoxVisible] = useState(false);

    // Tracks the content of the new tag box, so Save can go ahead and
    // make a new tag from it. We could try to get a reference to the
    // actual input element, but this is simpler.
    const [newTagContent, setNewTagContent] = useState("");
    const search = useSearchBooks(
        {
            keys: "tags"
            // Currently we're getting ALL the books to accumulate the list of existing tags.
            // We may need a cloud code function to just retrieve the unique tags without transmitting
            // all the books with their duplicate tags to the client. Or a sample of some reasonable
            // number of books may be good enough.
            //limit: maxCardsToRetrieve,
        },
        {}
    );
    // The combination of useRef and useEffect allows us to run the search once
    // and keep using the resulting tag list.
    const tags = useRef<string[]>([]);
    useEffect(() => {
        const temp = new Set<string>();
        for (const book of search.books) {
            for (const tag1 of (book as any).tags) {
                const tag = tag1 as string;
                temp.add(tag);
            }
        }
        tags.current = Array.from(temp.values());
        //console.log("tags.current=" + JSON.stringify(tags.current));
    }, [search]);

    // This is the original tag matching algorithm from BL1. Autocomplete seems to do pretty well without it,
    // and it's not obvious from the documentation how to control it.
    // const getMatchingTags = (query: string) => {
    //     var matches = [];
    //     //Match beginning
    //     var firstRegex = new RegExp("^" + query, "i");
    //     //Match word starts
    //     var wordRegex = new RegExp("\\W" + query, "i");
    //     //Match camel case
    //     var capQuery =
    //         query.charAt(0).toUpperCase() + query.substr(1, query.length - 1);
    //     var camelRegex = new RegExp("[a-z]" + capQuery);

    //     //This should be replaced by the version below if/when datagrid uses server-side paging
    //     for (var tag in tags.current.values) {
    //         if (
    //             firstRegex.test(tag) ||
    //             wordRegex.test(tag) ||
    //             camelRegex.test(tag)
    //         ) {
    //             matches.push({ text: tag });
    //         }
    //     }
    //     return matches;
    // };

    // Raised whenever anything changes the text of the new-tag box.
    // We keep track of current content for Save.
    const handleNewTagInputChange = (
        event: ChangeEvent<{}>,
        value: string | null
    ) => {
        props.setModified(true);
        setNewTagContent(value || "");
    };

    // Raised when the user types Enter, clicks an item in the list...
    // and unfortunately also when they click the X to clear the box.
    // Value is the tag they chose or typed. Allows adding multiple tags
    // before saving.
    const handleNewTagChange = (
        event: ChangeEvent<{}>,
        value: string | null
    ) => {
        makeNewTag(value || "");
    };

    const makeNewTag = (value: string) => {
        if (value && props.book.tags.indexOf(value) < 0) {
            props.book.tags.push(value);
            props.setModified(true);
        }
        // For some reason this is raised when the content becomes empty,
        // either using the clear button or just by backspace.
        // In such cases don't close it.
        // Review: should we also suppress closing if the tag is already present?
        if (value) {
            setNewTagBoxVisible(false);
            // I thought originally that we would need to do something to clear
            // the autocomplete for later use, but this happens automatically.
            // I think it is because we don't just hide it when not visible...
            // the render function "leaves it out" altogether. At that point the
            // DOM element is destroyed. So when we make a new one on a later
            // render, it starts empty.
            // If you find a need to reinstate this, note that an unexpected side
            // effect of 'controlling' the state with the value prop (and making this
            // a state, and updating it in an onInputValue handler) is that the
            // list of options does not update with typing. Suspect something to do
            // with creating a new one each change due to re-render.

            // However, we don't want the new tag value to hang around, or we
            // may make a new tag out of it again in 'Save', in case we've since
            // deleted the new one.
            setNewTagContent("");
        }
    };

    const handleDelete = (tag: string) => {
        const index = props.book.tags.indexOf(tag);
        props.book.tags.splice(index, 1);
        props.setModified(true);
    };

    const handleClose = () => {
        makeNewTag(newTagContent);
    };

    return (
        // review: is there some shade-of-grey constant we should use for the background color?
        <div
            id="tagsList"
            css={css`
                border: 2px solid ${props.borderColor};
                border-radius: 4px;
                margin-top: 10px;
                padding: 10px;
                line-height: 26px;
                position: relative;
                background-color: white;
            `}
        >
            {props.book.tags
                // a warning from observable says to use slice() like this if we don't want to modify the book object
                // (and another trick if we do).
                .slice()
                // current tags are inconsistent as to whether there is a space after
                // the colon. To make them look properly alphabetical, we remove any such space
                // for sorting purposes.
                .sort((x, y) =>
                    x.replace(": ", ":").localeCompare(y.replace(": ", ":"))
                )
                .map(t => (
                    <Tag key={t} content={t} delete={handleDelete}></Tag>
                ))}
            {newTagBoxVisible && (
                <Autocomplete
                    css={css`
                        .MuiOutlinedInput-root {
                            width: 250px !important;
                            padding: 0 !important;
                        }
                    `}
                    id="apNewTag"
                    freeSolo // user can create new tags not in options
                    options={tags.current}
                    renderInput={params => (
                        <TextField
                            {...params}
                            margin="none"
                            variant="outlined"
                        />
                    )}
                    onChange={handleNewTagChange}
                    onInputChange={handleNewTagInputChange}
                    onClose={handleClose}
                ></Autocomplete>
            )}
            <IconButton
                css={css`
                    position: absolute !important;
                    right: 0;
                    bottom: 0;
                    &.MuiIconButton-root {
                        color: ${theme.palette.secondary.main};
                    }
                `}
                onClick={() => setNewTagBoxVisible(!newTagBoxVisible)}
            >
                <AddCircleIcon />
            </IconButton>
        </div>
    );
});
