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
                            css={css`
                                overflow: auto;
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
