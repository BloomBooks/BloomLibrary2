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

export const BookExtraPanels: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    //const { parseUser } =  useAuth0(); Temporarily disabled because this breaks Storybook
    const parseUser: any = { staff: true };

    return (
        <div
            css={css`
                margin-top: 32px;
            `}
        >
            {/* Todo: BL-8090 also shown if parseUser is the uploader of the book */}
            {parseUser && parseUser.staff && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Artifact Controls
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <HarvesterArtifactUserControl bookId={props.book.id} />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
            {/* The admin panel is only shown if the user is logged in as a parse administrator.  */}
            {parseUser && parseUser.staff && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Staff Controls
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <StaffPanel book={props.book!}></StaffPanel>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
            {parseUser && parseUser.staff && (
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
