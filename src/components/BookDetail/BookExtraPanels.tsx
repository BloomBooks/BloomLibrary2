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
import { HarvesterArtifactUserControl } from "../HarvesterArtifactUserControl/HarvesterArtifactUserControl";
import { AdminPanel } from "../Admin/AdminPanel";
import { useAuth0 } from "../../Auth0Provider";

export const BookExtraPanels: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    //const { parseUser } =  useAuth0(); Temporarily disabled because this breaks Storybook
    const parseUser: any = { administrator: true };

    return (
        <div
            css={css`
                margin-top: 32px;
            `}
        >
            {/* Todo: BL-8090 also shown if parseUser is the uploader of the book */}
            {parseUser && parseUser.administrator && (
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
            {parseUser && parseUser.administrator && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Admin Controls
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <AdminPanel book={props.book!}></AdminPanel>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
            {parseUser && parseUser.administrator && (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        Raw Book Data (Admin Only)
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
