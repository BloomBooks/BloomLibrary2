export function getAnchorProps(href: string): object {
    const externalLink = href.startsWith("http");
    const embeddedMode = window.self !== window.top;
    if (externalLink || embeddedMode) {
        return { href, target: "_blank", rel: "noopener noreferrer" };
    } else {
        return { href };
    }
}
