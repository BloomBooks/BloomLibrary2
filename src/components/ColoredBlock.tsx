// Display a block with a colored background.
// Optional left/right padding is provided.
// Optional background image is allowed.  This feature is very rudimentary and untested at present.
import * as React from "react";

export interface IColoredBlockProps extends React.HTMLAttributes<HTMLElement> {
    color: string; // could be color name or RGB value like "#b1e29d"
    padding?: string; // optional measurement like "30px"
    image?: string; // optional value like "url("mybackground.png")"
}

export const ColoredBlock: React.FunctionComponent<IColoredBlockProps> = (
    props
) => {
    let divStyle = {
        backgroundColor: props.color,
        paddingLeft: props.padding,
        paddingRight: props.padding,
        backgroundImage: props.image,
    };
    return (
        <React.Fragment>
            <div style={divStyle}>{props.children}</div>
        </React.Fragment>
    );
};
