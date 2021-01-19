import React from "react";
import TruncateMarkup from "react-truncate-markup";

// This is useful in cases where we don't need TruncateMarkup for shorter content,
// but want it when needed. For most children, we don't want to pay the cost of checking
// the length and using the TruncateMarkup component, but for longer ones we do.
// The condition should be false only when you are sure (perhaps experimentally)
// that content never requires truncation, such as the length of a string being less than
// some quite conservative limit. Err on the side of using TruncateMarkup too often, as that
// only affects performance, while using it too seldom could affect appearance.
export const SmartTruncateMarkup: React.FunctionComponent<{
    condition: boolean;
    lines: number;
}> = (props) => {
    return (
        <React.Fragment>
            {props.condition ? (
                <TruncateMarkup
                    // test false positives css={css`color: red;`}
                    lines={props.lines}
                >
                    {props.children}
                </TruncateMarkup>
            ) : (
                props.children
            )}
        </React.Fragment>
    );
};
