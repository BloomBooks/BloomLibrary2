import React from "react";
import { PageNotFound } from "./PageNotFound";

/* React ErrorBoundaries work only for exceptions that happen during rendering.
We were trying to funnel exceptions that happen outside of that (e.g. search box code) into the
same <ErrorBoundary>. This failed because the url got a mysterious "?" appended to it and then
the whole page would reload. We don't know why.

let MainErrorBoundary: ErrorBoundary | undefined;
window.onerror = (message, url, col, line, err) => {
    if (err) {
        MainErrorBoundary!.handleExternalError(err);
        return !!MainErrorBoundary;
    }
    return false;
};
*/

export class ErrorBoundary extends React.Component<{
    url: string;
}> {
    public state: { error: Error | undefined } = { error: undefined };

    public static getDerivedStateFromError(error: Error) {
        return { error };
    }
    /* didn't work, see comment on MainErrorBoundary.
        public handleExternalError(error: Error) {
        this.setState({ error });
    }*/

    // after we show the error and the user tries to go somewhere else, we need
    // to clear this error state otherwise they will just keep seeing the error.
    public componentDidUpdate(previousProps: any) {
        if (previousProps.url !== this.props.url) {
            this.setState({ error: undefined });
        }
    }
    public render() {
        //didn't work MainErrorBoundary = this;
        if (this.state.error) {
            if (this.state.error?.message.startsWith("404")) {
                return <PageNotFound />;
            }
            return <h1>Oops! Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
