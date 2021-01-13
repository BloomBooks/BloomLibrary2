// Display a testimonial with a left border highlighting the text and attribution.
import * as React from "react";

export const Testimonial: React.FunctionComponent<{}> = (props) => {
    return <div className="testimonial-border">{props.children}</div>;
};
