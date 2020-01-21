import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Auth0Provider } from "./Auth0Provider";
import { getConnection } from "./connection/Connection";
import { ILocation } from "./Router";
import QueryString from "qs";

// auth0 recommended version, involves using their history mechanism
// and route provider. May want something similar using ours??
// const onRedirectCallback = appState => {
//     history.push(
//         appState && appState.targetUrl
//             ? appState.targetUrl
//             : window.location.pathname
//     );
// };

const onRedirectCallback = () => {
    // strip out the code and search params, keep any others.
    // There might be a useful integration of this with the Router code;
    // but the instance of that currently belongs to BrowseView, about three layers in.
    const queryWithoutQuestionMark = window.location.search.substr(1, 99999);
    const location = QueryString.parse(queryWithoutQuestionMark) as ILocation;
    delete location.code;
    delete location.state;
    let newSearch = QueryString.stringify(location);
    if (newSearch) {
        newSearch = "?" + newSearch;
    }
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname + newSearch
    );
};

const auth0Config = getConnection().auth0Config;

ReactDOM.render(
    <Auth0Provider
        domain={auth0Config.domain}
        client_id={auth0Config.clientId}
        redirect_uri={window.location.origin} // if changed, see Header.tsx signup function
        onRedirectCallback={onRedirectCallback}
    >
        <App />
    </Auth0Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
