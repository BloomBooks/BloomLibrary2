// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { Book } from "../../model/Book";

import React, { useState } from "react";
import {
    TextField,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
} from "@material-ui/core";
import { observer } from "mobx-react";
import { HideBookControl } from "./HideBookControl";
import {
    TagsChooser,
    BookLanguagesChooser,
    BookshelvesChooser,
    FeaturesChooser,
} from "./StaffMultiChoosers";

interface IProps {
    book: Book;
}
const borderColor = "#b0e1e8"; // or perhaps border color ${theme.palette.secondary.light}? The value here came from note in BL-8046

// This React functional component displays some staff controls, shown (for example)
// in the book detail page when the logged-in use is an moderator.
const StaffPanel: React.FunctionComponent<IProps> = observer((props) => {
    // Whether anything has been edited and not yet saved.
    const [modified, setModifiedState] = useState(false);

    // Todo: react router replacement for this.
    // Keeps the router in sync with our modified flag. The router
    // will prevent navigation when something needs saving.
    // useEffect(() => {
    //     if (router) {
    //         router.waitingOnSaveOrCancel = modified;
    //     }
    // }, [modified, router]);

    const handleSummaryChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        props.book.summary = event.target.value;
        setModified(true);
    };
    const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.book.librarianNote = event.target.value;
        setModified(true);
    };
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const t = event.target.value;
        if (t) props.book.title = t;
        setModified(true);
    };
    // const handleRelatedBooksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     props.book.librarianNote = event.target.value;
    //     setModified(true);
    // };

    const saveBook = () => {
        props.book.saveAdminDataToParse();
    };

    const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.book.level = (event.target as HTMLInputElement).value;
        setModified(true);
    };

    const setModified = (val: boolean) => {
        if (val === modified) {
            return;
        }
        setModifiedState(val);
    };

    const handleSave = () => {
        if (modified) {
            // blur should handle any content in new tag box.
            //makeNewTag(newTagContent); // does nothing if it already exists or is empty
            saveBook();
            setModified(false);
        }
    };

    const handleCancel = () => {
        // avoid unsaved changes warning.
        // Note that setting modified false is not enough, that won't affect
        // router.waitingOnSaveOrCancel until the next render.
        // It's also not necessary, because the reload reconstructs the page
        // completely, destroying all the pre-existing state.
        // Todo: react router equivalent
        //router!.waitingOnSaveOrCancel = false;
        document.location.reload();
    };

    return (
        // review: is there some shade-of-grey constant we should use for the background color?
        <div
            css={css`
                width: 100%;
            `}
        >
            <div
                id="apTopRow"
                css={css`
                    display: flex;
                    flex-direction: row;
                    margin-top: 10px !important;
                `}
            >
                <div
                    id="apTopLeft"
                    css={css`
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                    `}
                >
                    <TextField
                        css={css`
                            .MuiOutlinedInput-notchedOutline {
                                border-color: ${borderColor} !important;
                                border-width: 2px !important;
                            }
                            .MuiInputLabel-root {
                                color: darkGrey;
                            }
                            .MuiInputBase-root {
                                margin-bottom: 1em;
                            }
                            .MuiInputLabel-root.Mui-focused {
                                color: black;
                            }
                            background-color: white;
                        `}
                        label="Title"
                        variant="outlined"
                        multiline
                        rows={2}
                        value={props.book.title || ""}
                        onChange={handleTitleChange}
                    ></TextField>
                    <TextField
                        id="apSummary"
                        css={css`
                            .MuiOutlinedInput-notchedOutline {
                                border-color: ${borderColor} !important;
                                border-width: 2px !important;
                            }
                            .MuiInputLabel-root {
                                color: darkGrey;
                            }
                            .MuiInputLabel-root.Mui-focused {
                                color: black;
                            }
                            background-color: white;
                        `}
                        label="Summary"
                        variant="outlined"
                        multiline
                        rows={2}
                        value={props.book.summary || ""}
                        onChange={handleSummaryChange}
                    ></TextField>
                    <TextField
                        id="apNotes"
                        // 87px height aligns it with the Level radio buttons,
                        // at least in Chrome.
                        css={css`
                            margin-top: 10px !important;
                            .MuiOutlinedInput-notchedOutline {
                                border-color: ${borderColor} !important;
                                border-width: 2px !important;
                            }
                            .MuiInputBase-input {
                                height: 87px;
                            }
                            .MuiInputBase-root {
                                margin-bottom: 1em;
                            }

                            .MuiInputLabel-root {
                                color: darkGrey;
                            }
                            .MuiInputLabel-root.Mui-focused {
                                color: black;
                            }
                            background-color: white;
                        `}
                        label="Notes"
                        variant="outlined"
                        multiline
                        rows={4} // may be redundant with height forced in css above
                        value={props.book.librarianNote}
                        onChange={handleNotesChange}
                    ></TextField>
                </div>
                <div
                    id="apLevel"
                    css={css`
                        border: 2px solid ${borderColor};
                        border-radius: 4px;
                        margin-left: 10px;
                        padding: 10px;
                        background-color: white;
                        margin-bottom: 1em;
                    `}
                >
                    <FormLabel component="legend">Level</FormLabel>
                    <RadioGroup
                        aria-label="level"
                        name="level"
                        value={props.book.level}
                        onChange={handleLevelChange}
                    >
                        <FormControlLabel
                            value="1"
                            control={<Radio color="secondary" />}
                            label="1: first words and phrases"
                        />
                        <FormControlLabel
                            value="2"
                            control={<Radio color="secondary" />}
                            label="2: first sentences"
                        />
                        <FormControlLabel
                            value="3"
                            control={<Radio color="secondary" />}
                            label="3: first paragraphs"
                        />
                        <FormControlLabel
                            value="4"
                            control={<Radio color="secondary" />}
                            label="4: longer paragraphs"
                        />
                    </RadioGroup>
                    <div>
                        Computed: {props.book.getTagValue("computedLevel")}
                    </div>
                </div>
            </div>
            <div
                id="apKeywordsRow"
                css={css`
                    display: flex;
                    flex-direction: row;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                    `}
                >
                    <TextField
                        label="Keywords"
                        variant="outlined"
                        css={css`
                            .MuiOutlinedInput-notchedOutline {
                                border-color: ${borderColor} !important;
                                border-width: 2px !important;
                            }
                            .MuiInputLabel-root {
                                color: darkGrey;
                            }
                            .MuiInputBase-root {
                                margin-bottom: 1em;
                            }
                            .MuiInputLabel-root.Mui-focused {
                                color: black;
                            }
                            background-color: white;
                        `}
                        value={props.book.keywordsText || ""}
                        onChange={(event) => {
                            props.book.keywordsText = event.target.value;
                            setModified(true);
                        }}
                    ></TextField>
                </div>
            </div>
            <BookshelvesChooser
                setModified={setModified}
                book={props.book}
            ></BookshelvesChooser>
            <div
                css={css`
                    margin-top: 1em;
                    display: flex;
                    & > div {
                        margin-right: 10px;
                    }
                `}
            >
                <TagsChooser
                    setModified={setModified}
                    book={props.book}
                ></TagsChooser>
                <BookLanguagesChooser
                    setModified={setModified}
                    book={props.book}
                ></BookLanguagesChooser>

                <FeaturesChooser
                    setModified={setModified}
                    book={props.book}
                ></FeaturesChooser>
            </div>
            <div
                css={css`
                    margin-top: 1em;
                    & > div {
                        margin-right: 1em;
                    }
                `}
            >
                <TextField
                    label="Publisher"
                    variant="outlined"
                    css={css`
                        background-color: white;
                    `}
                    value={props.book.publisher}
                    onChange={(event) => {
                        props.book.publisher = event.target.value;
                        setModified(true);
                    }}
                ></TextField>
                <TextField
                    label="Original Publisher"
                    variant="outlined"
                    css={css`
                        background-color: white;
                    `}
                    value={props.book.originalPublisher}
                    onChange={(event) => {
                        props.book.originalPublisher = event.target.value;
                        setModified(true);
                    }}
                ></TextField>
            </div>
            <HideBookControl book={props.book} setModified={setModified} />
            <div
                id="apControls"
                css={css`
                    display: flex;
                    flex-direction: row;
                    margin-top: 10px;
                `}
            >
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={!modified}
                    css={css`
                        margin-left: auto !important;
                        margin-right: 10px !important;
                        min-width: 90px !important;
                    `}
                >
                    Save
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="outlined"
                    color="primary"
                    disabled={!modified}
                    css={css`
                        min-width: 90px !important;
                    `}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
});

// const Box: React.FunctionComponent = (props) => (
//     <div
//         css={css`
//             border: 2px solid ${borderColor};
//             border-radius: 4px;
//             margin-top: 10px;
//             padding: 10px;
//             line-height: 26px;
//             position: relative;
//             background-color: white;
//         `}
//         {...props}
//     >
//         {props.children}
//     </div>
// );

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default StaffPanel;
