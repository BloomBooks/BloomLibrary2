// Provide multiple columns within an outer block using flex.
// flex-grow and flex-basis are used to control the relative widths of the columns.
// The default is equal-width columns as much as possible depending on content.
import * as React from "react";

export const Columns: React.FunctionComponent<{}> = (props) => {
    return <div className="multiple-column-container">{props.children}</div>;
};

export interface IColumnProps extends React.HTMLAttributes<HTMLElement> {
    flexGrow?: number; // optional value
}

export const Column: React.FunctionComponent<IColumnProps> = (props) => {
    const divProps = {
        flexGrow: props.flexGrow ? props.flexGrow : 1,
        flexBasis: "1%", // every column starts at 1%, then grows proportionally to flexGrow
    };
    return <div style={divProps}>{props.children}</div>;
};
