import { css } from "@emotion/react";

import React from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react-lite";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { HarvesterArtifactUserControl } from "./ArtifactVisibilityPanel/ArtifactVisibilityPanel";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { commonUI } from "../../theme";

// This used to have three panels, but two got moved to StaffControlsBox.tsx.
// Rather than refactor this back out, I'm taking the simple route of just
// leaving the remainder as is. Who knows if we'll add another panel here someday.
export const BookExtraPanels: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const user = useGetLoggedInUser();
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
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Which Format Buttons to Show for this Book
                        </AccordionSummary>
                        <AccordionDetails>
                            <HarvesterArtifactUserControl
                                book={props.book}
                                currentUserIsUploader={userIsUploader}
                                currentUserIsModerator={user?.moderator}
                            />
                        </AccordionDetails>
                    </Accordion>
                </>
            )}
        </div>
    );
});
