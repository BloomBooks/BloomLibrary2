// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import { Book } from "../../model/Book";

import React, { useState } from "react";
import {
    TextField,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Checkbox,
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { HideBookControl } from "./HideBookControl";
import {
    TagsChooser,
    BookLanguagesChooser,
    FeaturesChooser,
} from "./StaffMultiChoosers";
import { Prompt } from "react-router-dom";
import { commonUI } from "../../theme";

interface IProps {
    book: Book;
}
const borderColor = "#b0e1e8"; // or perhaps border color ${theme.palette.secondary.light}? The value here came from note in BL-8046

// A function that can be added as a listener to window.beforeunload when we need to prompt
// the user before navigating. It MUST be defined OUTSIDE the StaffPanel function, otherwise,
// each render creates a different instance of the function and removeEventListener does
// not work.
const preventUnload = (e: Event) => {
    e.preventDefault(); // causes standard browsers to prompt
    e.returnValue = true; // caues non-standard browsers to prompt
};

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

    const handleRequestHarvest = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        props.book.harvestState = "Requested";
        // Possible todo: save harvestState immediately to Parse instead of
        // merely activating the Save button.
        setModified(true);
    };

    const setModified = (val: boolean) => {
        if (val === modified) {
            return;
        }
        setModifiedState(val);

        // This handles changes outside the react router system.
        // Unfortunately we are not allowed to control or localize the message.
        // Note that we must pass a static function so we can pass the exact same
        // function instance to remove as to add.
        if (val) {
            window.addEventListener("beforeunload", preventUnload);
        } else {
            window.removeEventListener("beforeunload", preventUnload);
        }
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
        setModified(false);
        document.location.reload();
    };

    // insert a <br/> between each entry in the array of log entries
    const renderHarvestLog = (log: string[]) => {
        const spans = [];
        for (let i = 0; i < log.length; ++i) {
            if (i > 0) {
                spans.push(<br key={i + "br"} />);
            }
            spans.push(<span key={i}>{log[i]}</span>);
        }
        return <div>{spans}</div>;
    };

    // .Mui-focused is the only one of these .Mui-xxx classes that doesn't
    // seem to get a number appended to the end sometimes. That makes them
    // very susceptible to breaking. The same control that has classes
    // MuiFormControl-root and MuiInputBase-root when you go to the detail
    // url directly has MuiFormControl-root-436 and MuiInputBase-root-464
    // when you inject "create/" into the url. Since this css only applies
    // to this React local TextField component, just use the tag names.
    // Also since the inner 'css' in the emotion 'css={css`style string`}'
    // is just a function, I was able to pull out the common styles into a string
    // and use a css(someCombinedString) format.
    const commonTextFieldStyles: string = `fieldset {
            border-color: ${borderColor} !important;
            border-width: 2px !important;
        }
        label {
            color: darkGrey;
        }
        .Mui-focused {
            color: black;
        }
        background-color: white;`;

    return (
        // review: is there some shade-of-grey constant we should use for the background color?
        <div
            css={css`
                width: 100%;
                display: flex;
                flex-direction: column;
            `}
        >
            <Prompt
                // This works for changes INSIDE the react router system, that is,
                // ones like typing in the search dialog that result ultimately in
                // calls to react router's history.push() or history.replace() etc.
                // Most changes, including following an href to elsewhere in bl.org,
                // do not trigger this, which is why we also set up an event handler for
                // window.beforeunload.
                // It's tempting to try to make this look more like the browser's
                // standard prompt for beforeunload, but that's different in each browser,
                // so we may as well just be as clear as we can.
                when={modified}
                message="Please save your changes or Cancel"
            />
            <a
                href={`mailto:${props.book.uploader?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                css={css`
                    margin-left: auto;
                    color: ${commonUI.colors.bloomBlue};
                `}
            >
                {props.book.uploader?.username}
            </a>
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
                        css={css(
                            `
                                div {
                                    margin-bottom: 1em;
                                }` + commonTextFieldStyles
                        )}
                        label="Title"
                        variant="outlined"
                        multiline
                        rows={2}
                        value={props.book.title || ""}
                        onChange={handleTitleChange}
                    ></TextField>
                    <TextField
                        id="apSummary"
                        className="staff-text-field"
                        css={css(commonTextFieldStyles)}
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
                        css={css(
                            `
                            margin-top: 10px !important;
                            div {
                                margin-bottom: 1em;
                            }
                            textarea {
                                height: 87px;
                            }` + commonTextFieldStyles
                        )}
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
                        css={css(
                            `
                            div {
                                margin-bottom: 1em;
                            }` + commonTextFieldStyles
                        )}
                        value={props.book.keywordsText || ""}
                        onChange={(event) => {
                            props.book.keywordsText = event.target.value;
                            setModified(true);
                        }}
                    ></TextField>
                </div>
            </div>
            <BookLanguagesChooser
                setModified={setModified}
                book={props.book}
            ></BookLanguagesChooser>
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
                    value={props.book.publisher || ""}
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
                    value={props.book.originalPublisher || ""}
                    onChange={(event) => {
                        props.book.originalPublisher = event.target.value;
                        setModified(true);
                    }}
                ></TextField>
                <TextField
                    label="Edition"
                    variant="outlined"
                    css={css`
                        background-color: white;
                    `}
                    value={props.book.edition}
                    onChange={(event) => {
                        props.book.edition = event.target.value;
                        setModified(true);
                    }}
                ></TextField>
            </div>
            <div
                css={css`
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    width: 100%;
                `}
            >
                <div>
                    <FormControlLabel
                        //Is exactly the same as another book except for the branding (BL-10685)"
                        label={"Is a Rebrand"}
                        control={
                            <Checkbox
                                checked={props.book.rebrand}
                                onChange={(e) => {
                                    props.book.rebrand = e.target.checked;
                                    setModified(true);
                                }}
                            ></Checkbox>
                        }
                    ></FormControlLabel>
                    <HideBookControl
                        book={props.book}
                        setModified={setModified}
                    />
                </div>
                <div
                    css={css`
                        border: 2px solid ${borderColor};
                        border-radius: 4px;
                        margin-top: 1.1em;
                        margin-left: 10px;
                        padding: 10px;
                        background-color: white;
                        width: 50%;
                    `}
                >
                    <label
                        css={css`
                            padding-left: 5px;
                            padding-right: 5px;
                            position: relative;
                            top: -20px;
                            left: 5px;
                            background-color: white;
                        `}
                    >
                        Harvester
                    </label>
                    <div
                        css={css`
                            display: flex;
                            flex-direction: row;
                            justify-content: space-between;
                            width: 100%;
                            top: -10px;
                            position: relative;
                        `}
                    >
                        <div>Status: {props.book.harvestState}</div>
                        <Button
                            onClick={handleRequestHarvest}
                            variant="outlined"
                            color="secondary"
                            disabled={props.book.harvestState === "Requested"}
                            css={css`
                                margin-left: auto !important;
                                margin-right: 10px !important;
                                min-width: 90px !important;
                            `}
                        >
                            Request Harvesting
                        </Button>
                    </div>
                    <div>Log: {renderHarvestLog(props.book.harvestLog)}</div>
                </div>
            </div>
            <div
                id="apControls"
                css={css`
                    display: flex;
                    flex-direction: row;
                    margin-top: 1em;
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
