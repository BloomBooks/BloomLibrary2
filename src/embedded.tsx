export function getAnchorProps(href: string): object {
    const externalLink = href.startsWith("http");
    const embeddedMode = window.location.pathname.startsWith("/embed/");
    if (externalLink || embeddedMode) {
        return { href, target: "_blank", rel: "noopener noreferrer" };
    } else {
        return { href };
    }
}
