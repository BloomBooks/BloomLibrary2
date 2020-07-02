// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState, FunctionComponent } from "react";

import { useGetCollection } from "../../model/Collections";

import { useDocumentTitle } from "../Routes";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import { DataStudioDashboardScreen } from "./DataStudioDasboardScreen";
import { ComprehensionQuestionsReport } from "./ComprehensionQuestionsReport";

export interface IScreenProps {
    collectionName: string;
    start: Date;
    end: Date;
}
export interface IScreen {
    label: string;
    component: React.FunctionComponent<IScreenProps>;
}
export const Pretend: React.FunctionComponent<IScreenProps> = (props) => {
    return <h1>Pretend</h1>;
};
const screens: IScreen[] = [];
export function RegisterScreen(screen: IScreen) {
    screens.push(screen);
}
RegisterScreen({
    label: "Comprehension Questions",
    component: (p: IScreenProps) => (
        <ComprehensionQuestionsReport {...p}></ComprehensionQuestionsReport>
    ),
});

RegisterScreen({
    label: "Bloom Reader Sessions",
    component: (p: IScreenProps) => (
        <DataStudioDashboardScreen {...p}></DataStudioDashboardScreen>
    ),
});

export const CollectionStatsPage: React.FunctionComponent<{
    collectionName: string;
}> = (props) => {
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    // remains empty (and unused) except in byLanguageGroups mode, when a callback sets it.
    //const [booksAndLanguages, setBooksAndLanguages] = useState("");
    const { collection, loading } = useGetCollection(props.collectionName);
    //const { params, sendIt } = getCollectionAnalyticsInfo(collection);
    useDocumentTitle(collection?.label + " statistics");

    if (!collection) {
        return <div>Collection not found</div>;
    }
    const pageLeftMargin = 10;
    const kgray = "#ececec";
    return (
        <div
            css={css`
                margin-left: ${pageLeftMargin}px;
                h1 {
                    font-size: 36px;
                    line-height: 28px;
                }
                h2 {
                    margin-block-start: 0;
                    font-size: 24px;
                    line-height: 28px;
                }
            `}
        >
            <h1>{collection?.label}</h1>
            <h2>Bloom Collection Statistics</h2>
            <div
                css={css`
                    background-color: ${kgray};
                    //height: 75px;
                    margin-left: -${pageLeftMargin}px; // push back out to the edge
                    padding-top: 20px;
                    padding-bottom: 20px;
                    padding-left: ${pageLeftMargin}px;
                `}
            >
                <FormControl>
                    <Select
                        css={css`
                            background-color: white;
                            padding-left: 10px;
                            min-width: 300px;
                        `}
                        native
                        value={currentScreenIndex}
                        onChange={(e) =>
                            setCurrentScreenIndex(e.target.value as number)
                        }
                        inputProps={{
                            name: "age",
                            id: "age-native-simple",
                        }}
                    >
                        {screens.map((screen, index) => (
                            <option key={index} value={index}>
                                {screen.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div
                css={css`
                    //height: 500px;
                `}
            >
                {screens[currentScreenIndex].component({
                    collectionName: props.collectionName,
                    start: new Date(),
                    end: new Date(),
                })}
            </div>
            <div
                css={css`
                    padding: 10px;
                    height: 100px;
                    background-color: ${kgray};
                    margin-left: -${pageLeftMargin}px; // push back out to the edge
                `}
            >
                <span
                    css={css`
                        font-size: 20px;
                    `}
                >
                    🛈
                </span>
                <h3
                    css={css`
                        display: inline;
                    `}
                >
                    {" "}
                    About this screen
                </h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Mauris praesent praesent pretium dictum ipsum. Consequat,
                    dictumst et lacus condimentum aliquet consequat, vitae in
                    placerat. Dolor ullamcorper.
                </p>
            </div>
        </div>
    );
};
