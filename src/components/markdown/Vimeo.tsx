import { css } from "@emotion/react";

import * as React from "react";

export const Vimeo: React.FunctionComponent<{
    id: string;
    className?: string;
}> = (props) => {
    return (
        <div
            className={"vimeo " + props.className}
            css={css`
                padding: 56.25% 0 0 0;
                position: relative;
                background-color: gray;
            `}
        >
            <iframe
                src={`https://player.vimeo.com/video/${props.id}?title=0&byline=0&portrait=0&autoplay=0`}
                css={css`
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                `}
                allow={"fullscreen; picture-in-picture"}
                allowFullScreen
                title={"video"}
            ></iframe>
        </div>
    );
};
