import { isEmbedded } from "./components/EmbeddingHost";

export function getAnchorProps(href: string): object {
    const externalLink = href.startsWith("http");
    const embeddedMode = isEmbedded();
    if (externalLink || embeddedMode) {
        return { href, target: "_blank", rel: "noopener noreferrer" };
    } else {
        return { href };
    }
}
