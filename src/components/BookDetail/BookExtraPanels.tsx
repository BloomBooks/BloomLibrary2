// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import {
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { HarvesterArtifactUserControl } from "./ArtifactVisibilityPanel/ArtifactVisibilityPanel";
import { StaffPanel } from "../Admin/StaffPanel";
import { LoggedInUser } from "../../connection/LoggedInUser";
export const BookExtraPanels: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    const user = LoggedInUser.current;
    const userIsUploader = user?.username === props.book.uploader?.username;
    return (
        <div
            css={css`
                margin-top: 32px;
            `}
        >
            {(user?.administrator || userIsUploader) && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Artifact Controls
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <HarvesterArtifactUserControl
                            book={props.book}
                            currentUserIsUploader={userIsUploader}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}

            {user?.administrator && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Staff Controls
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <StaffPanel book={props.book!}></StaffPanel>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
            {user?.administrator && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Raw Book Data (Staff Only)
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
                            // This element is only seen by staff (and only useful to very tecnhical
                            // staff at that) so it doesn't need to be especially pretty.
                            css={css`
                                overflow: auto;
                                overflow-wrap: break-word;
                                width: calc(95vw - 4em);
                            `}
                        >
                            {JSON.stringify(props.book)}
                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
        </div>
    );
});
