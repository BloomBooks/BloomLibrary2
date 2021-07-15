// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import {
    Button,
    MenuItem,
    FormControl,
    Select,
    FormHelperText,
} from "@material-ui/core";
import { ArtifactVisibilitySettings } from "../../../model/ArtifactVisibilitySettings";

import pdfIcon from "../../../assets/Pdf.svg";
import epubIcon from "../../../assets/EPub.svg";
import bloomReaderIcon from "../../../assets/BloomPub.svg";
import readIcon from "../../../assets/Read.svg";
import translationIcon from "../../../assets/Translation.svg";
import { commonUI } from "../../../theme";
import { useGetLoggedInUser } from "../../../connection/LoggedInUser";
import { ArtifactType } from "../../../model/Book";

const useStyles = makeStyles(() =>
    createStyles({
        a: {
            textDecoration: "none",
            "&:hover": { textDecoration: "none" },
        },
        artifactAndChoice: {
            padding: 10,

            // This CSS makes it so that even if rationaleText is long, and the combined width of artifact + margin + rationaleText would've exceeded this container's width,
            // the artifact link and the choice div will still be vertically aligned.
            // (The choice div will be shrunk to fit inside the container (rationaleText will become wrapped))
            display: "flex",
            flexWrap: "nowrap", // nowrap is actually already the default value, but it's key to achieving the formatting we want
            justifyContent: "flex-start", // flex-start is actually already the default value, but it's key to achieving the formatting we want
        },
        button: {
            width: 100,
            height: 55,
        },
        buttonWithText: {
            color: "white",
            textTransform: "none", // prevent all caps
            backgroundColor: commonUI.colors.bloomRed,
        },
        buttonWithIconOnly: {
            "& img": { height: 43 }, // makes it the same as a button with text
        },
        select: {
            width: 200,
        },
    })
);

// A button to view/download the artifact, a select box to choose to hide/show it,
// and an optional message giving the user more information about why we would
// hide or show it by default.
export const ArtifactAndChoice: React.FunctionComponent<{
    type: ArtifactType;
    // the parent should give us the settings of the uploader if that is who is logged in,
    // or the moderator otherwise (people who are neither never see this component)
    visibilitySettings: ArtifactVisibilitySettings;
    url: string;
    onChange: (show: string) => void;
    currentUserIsUploader: boolean;
}> = (props) => {
    const classes = useStyles();
    const user = useGetLoggedInUser();

    const getThisPersonsChoice = (): string => {
        const decisionByThisPerson = props.currentUserIsUploader
            ? props.visibilitySettings.user
            : props.visibilitySettings.librarian;
        if (decisionByThisPerson === undefined) {
            return "auto";
        }
        return decisionByThisPerson ? "show" : "hide";
    };

    const [thisPersonsChoice, setThisPersonsChoice] = React.useState(
        getThisPersonsChoice()
    );

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const newValue = event.target.value as string;
        setThisPersonsChoice(newValue);
        props.onChange(newValue);
    };

    const getAutoText = (): string => {
        let showOrNot = "Show";
        if (
            props.visibilitySettings &&
            !props.visibilitySettings.getDecisionSansUser()
        ) {
            showOrNot = "Hide";
        }
        return `Automatic (${showOrNot})`;
    };

    const getRationaleText = (): string => {
        // console.log(
        //     "ArtifactAndChoice from getRationaleText():" + JSON.stringify(props)
        // );
        // console.log(
        //     "getRationaleText():" +
        //         props.visibilitySettings.hasUserDecided().toString()
        // );
        if (!props.visibilitySettings) {
            return "";
        }
        if (
            !props.currentUserIsUploader &&
            props.visibilitySettings.hasUserDecided()
        ) {
            return `The uploader has determined that this should be "${
                props.visibilitySettings.isUserHide() ? "Hide" : "Show"
            }" and currently staff cannot override that.`;
        }
        if (props.visibilitySettings.hasLibrarianDecided()) {
            return `Bloom staff has determined that this should be "${
                props.visibilitySettings.isLibrarianHide() ? "Hide" : "Show"
            }"`;
        }
        if (props.visibilitySettings.hasHarvesterDecided()) {
            return `Our system has guessed that this should be "${
                props.visibilitySettings.isHarvesterHide() ? "Hide" : "Show"
            }"`;
        }
        return "";
    };

    const getArtifactIcon = (): React.ReactNode => {
        let src;
        let alt;
        switch (props.type) {
            case ArtifactType.pdf:
                src = pdfIcon;
                alt = "PDF";
                break;
            case ArtifactType.epub:
                src = epubIcon;
                alt = "epub";
                break;
            case ArtifactType.bloomReader:
                src = bloomReaderIcon;
                alt = "Bloom Reader";
                break;
            case ArtifactType.readOnline:
                src = readIcon;
                alt = "Read online";
                break;
            case ArtifactType.shellbook:
                src = translationIcon;
                alt = "Download Translation";
                break;
        }
        return <img src={src} alt={alt} />;
    };

    const getArtifactButtonText = (): string | undefined => {
        if (props.type === "readOnline") {
            return "Read";
        }
        return undefined;
    };

    const getButton = (): React.ReactNode => {
        const text = getArtifactButtonText();
        if (text) {
            return (
                <Button
                    variant="outlined"
                    className={`${classes.button} ${classes.buttonWithText}`}
                    startIcon={getArtifactIcon()}
                >
                    {text}
                </Button>
            );
        }
        return (
            <Button
                variant="outlined"
                className={`${classes.button} ${classes.buttonWithIconOnly}`}
            >
                {getArtifactIcon()}
            </Button>
        );
    };

    const isInternalUrl = (): boolean => {
        return props.url.startsWith("/");
    };

    return (
        <div
            className={classes.artifactAndChoice}
            // Using makeStyles to set the margin-left doesn't work. It gets overridden by the
            // default .MuiFormControl-root. So we hack it here. Except somehow that Mui class
            // changes when we are under the Create tab, so we have to use our own class.
            css={css`
                .choice-control {
                    margin-left: 50px;
                }
            `}
        >
            <a
                href={props.url}
                target={isInternalUrl() ? undefined : "_blank"}
                rel="noreferrer"
                className={classes.a}
            >
                {getButton()}
            </a>
            <FormControl className="choice-control">
                <Select
                    value={thisPersonsChoice}
                    onChange={handleChange}
                    autoWidth
                    className={classes.select}
                    disabled={
                        // currently the user always wins, so disable these controls if we're seeing them because
                        // we are a moderator.
                        props.visibilitySettings.hasUserDecided() &&
                        !props.currentUserIsUploader
                    }
                >
                    <MenuItem value="auto">{getAutoText()}</MenuItem>
                    <MenuItem value="show">Show</MenuItem>
                    <MenuItem value="hide">Hide</MenuItem>
                </Select>
                <FormHelperText>
                    {(thisPersonsChoice === "auto" ||
                        // we show this for moderators even if not on auto because a moderator can currently be
                        // overridden by the uploader, and this can be confusing.
                        user?.moderator) &&
                        getRationaleText()}
                </FormHelperText>
            </FormControl>
        </div>
    );
};
