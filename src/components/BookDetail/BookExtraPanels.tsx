// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react-lite";
import {
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { HarvesterArtifactUserControl } from "./ArtifactVisibilityPanel/ArtifactVisibilityPanel";
import { LoggedInUser } from "../../connection/LoggedInUser";
import { commonUI } from "../../theme";

// This used to have three panels, but two got moved to StaffControlsBox.tsx.
// Rather than refactor this back out, I'm taking the simple route of just
// leaving the remainder as is. Who knows if we'll add another panel here someday.
export const BookExtraPanels: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const user = LoggedInUser.current;
    const userIsUploader = user?.username === props.book.uploader?.username;
    return (
        <div
            css={css`
                margin-top: 10px;
            `}
        >
            {(user?.moderator || userIsUploader) && (
                <>
                    <h2
                        css={css`
                            margin-bottom: 0;
                            color: ${commonUI.colors.bloomBlue};
                        `}
                        id="book.detail.formats"
                    >
                        Formats
                    </h2>
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            Which Format Buttons to Show for this Book
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <HarvesterArtifactUserControl
                                book={props.book}
                                currentUserIsUploader={userIsUploader}
                                currentUserIsModerator={user?.moderator}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </>
            )}
        </div>
    );
});
