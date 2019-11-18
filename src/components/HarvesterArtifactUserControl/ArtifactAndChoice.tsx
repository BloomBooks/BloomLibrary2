import React, { useEffect, useRef } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import {
    Button,
    MenuItem,
    FormControl,
    Select,
    FormHelperText
} from "@material-ui/core";
import { ShowSettings } from "./ShowSettings";
import ReadIcon from "../icons/ReadIcon";

import pdfIcon from "../../assets/pdf.png";
import epubIcon from "../../assets/epub.png";
import bloomReaderIcon from "../../assets/bloomd.png";
import { ArtifactType } from "./HarvesterArtifactHelper";
import { bloomRed } from "../styles";

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
    showSettings: ShowSettings;
    url: string;
    onChange: (show: string) => void;
}> = props => {
    const classes = useStyles();

    const getInitialShowValue = (): string => {
        if (!props.showSettings || props.showSettings.user === undefined)
            return "auto";
        return props.showSettings.user ? "show" : "hide";
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
    }, [show]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setShow(event.target.value as string);
    };

    const getAutoText = (): string => {
        let show = "Show";
        if (props.showSettings && !props.showSettings.getDecisionSansUser())
            show = "Hide";
        return `Automatic (${show})`;
    };

    const getRationaleText = (): string => {
        if (!props.showSettings) return "";
        if (props.showSettings.hasLibrarianDecided()) {
            return `Bloom staff has determined that this should be "${
                props.showSettings.isLibrarianHide() ? "Hide" : "Show"
            }"`;
        }
        if (props.showSettings.hasHarvesterDecided()) {
            return `Our system has guessed that this should be "${
                props.showSettings.isHarvesterHide() ? "Hide" : "Show"
            }"`;
        }
        return "";
    };

    const getArtifactIcon = () => {
        switch (props.type) {
            case "pdf":
                return <img src={pdfIcon} />;
            case "epub":
                return <img src={epubIcon} />;
            case "bloomReader":
                return <img src={bloomReaderIcon} />;
            case "readOnline":
                return <ReadIcon />;
        }
        return undefined;
    };

    const getArtifactButtonText = () => {
        if (props.type === "readOnline") return "Read";
        return undefined;
    };

    const getButton = (): React.ReactNode => {
        const text = getArtifactButtonText();
        if (text)
            return (
                <Button
                    variant="outlined"
                    className={`${classes.button} ${classes.buttonWithText}`}
                    startIcon={getArtifactIcon()}
                >
                    {text}
                </Button>
            );
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
