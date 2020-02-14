import React, { useEffect, useRef } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import {
    Button,
    MenuItem,
    FormControl,
    Select,
    FormHelperText
} from "@material-ui/core";
import { ArtifactVisibilitySettings } from "../../../model/ArtifactVisibilitySettings";

import pdfIcon from "./pdf.png";
import epubIcon from "./epub.png";
import bloomReaderIcon from "./bloomd.png";
import readIcon from "../read.svg";
import translationIcon from "../translation.svg";
import { ArtifactType } from "../ArtifactHelper";
import { bloomRed } from "../../../theme";

const useStyles = makeStyles(() =>
    createStyles({
        a: {
            textDecoration: "none",
            "&:hover": { textDecoration: "none" }
        },
        artifactAndChoice: {
            padding: 10
        },
        button: {
            width: 100,
            height: 55
        },
        buttonWithText: {
            color: "white",
            textTransform: "none", // prevent all caps
            backgroundColor: bloomRed
        },
        buttonWithIconOnly: {
            "& img": { height: 43 } // makes it the same as a button with text
        },
        select: {
            width: 200
        },
        formControl: {
            marginLeft: 50
        }
    })
);

// A button to view/download the artifact, a select box to choose to hide/show it,
// and an optional message giving the user more information about why we would
// hide or show it by default.
export const ArtifactAndChoice: React.FunctionComponent<{
    type: ArtifactType;
    visibility: ArtifactVisibilitySettings;
    url: string;
    onChange: (show: string) => void;
}> = props => {
    const classes = useStyles();

    const getInitialShowValue = (): string => {
        if (!props.visibility || props.visibility.user === undefined) {
            return "auto";
        }
        return props.visibility.user ? "show" : "hide";
    };

    const [show, setShow] = React.useState(getInitialShowValue());
    const isFirstRun = useRef(true);
    useEffect(() => {
        // Do not call onChange during component mount
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        props.onChange(show);
    }, [show, props]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setShow(event.target.value as string);
    };

    const getAutoText = (): string => {
        let showOrNot = "Show";
        if (props.visibility && !props.visibility.getDecisionSansUser()) {
            showOrNot = "Hide";
        }
        return `Automatic (${showOrNot})`;
    };

    const getRationaleText = (): string => {
        if (!props.visibility) {
            return "";
        }
        if (props.visibility.hasLibrarianDecided()) {
            return `Bloom staff has determined that this should be "${
                props.visibility.isLibrarianHide() ? "Hide" : "Show"
            }"`;
        }
        if (props.visibility.hasHarvesterDecided()) {
            return `Our system has guessed that this should be "${
                props.visibility.isHarvesterHide() ? "Hide" : "Show"
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
        <div className={classes.artifactAndChoice}>
            <a
                href={props.url}
                target={isInternalUrl() ? undefined : "_blank"}
                className={classes.a}
            >
                {getButton()}
            </a>
            <FormControl className={classes.formControl}>
                <Select
                    value={show}
                    onChange={handleChange}
                    autoWidth
                    className={classes.select}
                >
                    <MenuItem value="auto">{getAutoText()}</MenuItem>
                    <MenuItem value="show">Show</MenuItem>
                    <MenuItem value="hide">Hide</MenuItem>
                </Select>
                <FormHelperText>
                    {show === "auto" && getRationaleText()}
                </FormHelperText>
            </FormControl>
        </div>
    );
};
