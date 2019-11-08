import React from "react";
import ReactDOM from "react-dom";

export const HarvesterArtifactUserControl: React.FunctionComponent<{}> = props => {
    return <h1>Hello</h1>;
};

export function connectHarvestArtifactUserControl(
    attachmentPoint: HTMLElement,
    props: Object
) {
    ReactDOM.render(
        React.createElement(HarvesterArtifactUserControl, props),
        attachmentPoint
    );
}
