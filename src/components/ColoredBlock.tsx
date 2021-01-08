// Display a block with a colored background.
// Optional padding is provided.
// Optional background image is allowed. (This feature is very rudimentary and untested at present.)
import * as React from "react";

export interface IColoredBlockProps extends React.HTMLAttributes<HTMLElement> {
    color: string; // could be color name or RGB value like "#b1e29d"
    padding?: string; // optional measurement like "0px 30px"
    image?: string; // optional value like "url('mybackground.png')"
}

export const ColoredBlock: React.FunctionComponent<IColoredBlockProps> = (
    props
) => {
    const divStyle = {
        backgroundColor: props.color,
        padding: props.padding,
        backgroundImage: props.image,
    };
    return <div style={divStyle}>{props.children}</div>;
};
