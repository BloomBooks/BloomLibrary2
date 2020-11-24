import { isEmbedded } from "./components/EmbeddingHost";

export interface IAnchorProps {
    href: string;
    to: string;
    target?: string;
    rel?: string;
}

export function getAnchorProps(href: string): IAnchorProps {
    const externalLink = href.startsWith("http");
    const embeddedMode = isEmbedded();
    const toLoc = href.length > 0 ? href : "/";
    if (externalLink || embeddedMode) {
        return {
            href,
            to: toLoc,
            target: "_blank",
            rel: "noopener noreferrer",
        };
    } else {
        return { href, to: toLoc };
    }
}
