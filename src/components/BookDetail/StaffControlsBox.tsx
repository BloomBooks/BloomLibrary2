import { css } from "@emotion/react";

import React, { Fragment } from "react";
import { observer } from "mobx-react-lite";
import {
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from "@material-ui/core";

import { Book } from "../../model/Book";
import { useGetUserIsModerator } from "../../connection/LoggedInUser";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { commonUI } from "../../theme";
import { ControlsBox } from "./ControlsBox";

export const StaffControlsBox: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const userIsModerator = useGetUserIsModerator();
    const showControlsBox = userIsModerator;

    if (!showControlsBox) return <Fragment />;

    // causes webpack to create a chunk for this which we only download as needed.
    const StaffPanel = React.lazy(
        () => import(/* webpackChunkName: "staffPanel" */ "../Admin/StaffPanel")
    );
    const ReactJsonView = React.lazy(
        () =>
            import(/* webpackChunkName: "react-json-view" */ "react-json-view")
    );

    return (
        <ControlsBox>
            <h1
                css={css`
                    color: ${commonUI.colors.bloomBlue};
                    margin-top: 0;
                `}
            >
                You have staff permission on this book
            </h1>
            <ExpansionPanel defaultExpanded={true}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    Staff Controls
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <React.Suspense
                        fallback={
                            <div>Loading chunk for showing staff panel...</div>
                        }
                    >
                        <StaffPanel book={props.book!}></StaffPanel>
                    </React.Suspense>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    Raw Book Data
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div
                        // raw book data typically has some very long strings without spaces,
                        // which the browser is reluctant to break. The overflow-wrap allows
                        // it to break them at undesirable places, but it still wants to make
                        // the panel as wide as it possibly can. A width of 100%, for reasons
                        // I don't understand, doesn't use the browser width minus various
                        // parent margins, but seems to be based on the nearest parental
                        // max-width. That currently makes it 800px wide, even on screens
                        // that are much smaller, which in turn makes the parent that wide
                        // and prevents various things being responsive. The width setting here
                        // does not allow it to be wider than the viewport (minus unfortunately
                        // duplicated information about how wide parent margins are).
                        // I picked 95 rather than 100 to give a bit of wiggle room.
                        // This element is only seen by staff (and only useful to very technical
                        // staff at that) so it doesn't need to be especially pretty.
                        css={css`
                            overflow: auto;
                            overflow-wrap: break-word;
                            width: calc(95vw - 4em);
                        `}
                    >
                        <React.Suspense
                            fallback={
                                <div>Loading chunk for showing json...</div>
                            }
                        >
                            <ReactJsonView src={props.book} theme="monokai" />
                        </React.Suspense>
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </ControlsBox>
    );
});
