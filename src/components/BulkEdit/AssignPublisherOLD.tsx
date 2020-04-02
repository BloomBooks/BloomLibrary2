// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import { Button, Checkbox, FormControlLabel } from "@material-ui/core";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { getConnection } from "../../connection/ParseServerConnection";
import { axios } from "@use-hooks/axios";
import { constructParseBookQuery } from "../../connection/LibraryQueryHooks";
import { FilterHolder } from "./BulkEditPage";

export const AssignPublisherOLD: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
}> = observer(props => {
    const [valueToSet, setValueToSet] = useState<string | undefined>("");
    const [armed, setArmed] = useState(false);
    const user = useGetLoggedInUser();
    const waitingForFilter = !(
        (
            !!props.filterHolder.completeFilter.bookshelf ||
            !!props.filterHolder.completeFilter.search
        ) // copyright goes in search
    );

    return (
        (user?.moderator && (
            <div
                css={css`
                    background-color: #daffb6;
                    border: solid thin;
                    border-radius: 5px;
                    padding: 10px;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <h2
                        css={css`
                            margin-top: 0;
                        `}
                    >
                        Change Publisher
                    </h2>
                    <FormControlLabel
                        css={css`
                        margin-left: 20px;
                        //background-color: ${armed ? "orange" : "transparent"};
                    `}
                        control={
                            <Checkbox
                                checked={armed}
                                onChange={e => {
                                    setArmed(e.target.checked);
                                }}
                            />
                        }
                        label="I know what I'm doing, I know there is no undo. Arm torpedoes."
                    />
                </div>

                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <TextField
                        variant="outlined"
                        label="Publisher to set"
                        css={css`
                            width: 600px;
                        `}
                        defaultValue={valueToSet}
                        onChange={evt => {
                            const v = evt.target.value.trim();
                            setValueToSet(v.length ? v : undefined);
                        }}
                    />{" "}
                    {waitingForFilter && (
                        <span
                            css={css`
                                color: red;
                                margin-top: auto;
                            `}
                        >
                            Filter the target set down first by copyright or
                            bookshelf.
                        </span>
                    )}
                    <Button
                        variant="outlined"
                        css={css`
                            margin-top: 20px;
                        `}
                        disabled={
                            !armed ||
                            // We currently do not allow setting every single book; it's too likely that this is a mistake.
                            // We currently do not all setting a value to "", but we could change that if we need to set empty values.
                            !valueToSet ||
                            waitingForFilter
                        }
                        onClick={() => {
                            // console.log(
                            //     `Would set the publisher to "${valueToSet}" for all books matching ${JSON.stringify(
                            //         staticCurrentFilter.current
                            //     )}`
                            // );
                            if (valueToSet)
                                ChangePublisher(
                                    props.filterHolder.completeFilter,
                                    valueToSet,
                                    props.refresh
                                );
                        }}
                    >
                        Assign Publisher
                    </Button>
                </div>
            </div>
        )) || (
            <div>
                ---- You must be logged in as a moderator to use this page ----
            </div>
        )
    );
});

async function ChangePublisher(
    filter: IFilter,
    publisher: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: { keys: "objectId,title", ...finalParams }
    });

    const promises: Array<Promise<any>> = [];
    for (const book of books.data.results) {
        console.log(book.title);
        promises.push(
            axios.put(
                `${getConnection().url}classes/books/${book.objectId}`,
                {
                    updateSource: "libraryUserControl",
                    publisher
                },
                { headers }
            )
        );
    }
    Promise.all(promises)
        .then(() => refresh())
        .catch(error => {
            alert(error);
        });
}
