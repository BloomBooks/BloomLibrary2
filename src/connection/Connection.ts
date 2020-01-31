import axios from "axios";
import config_local from "./auth_config_local.json";
import config_dev from "./auth_config_dev.json";
import config_prod from "./auth_config_prod.json";

// This file exports a function getConnection(), which returns an object containing
// various constants and secrets needed to communicate with Auth0 and parse-server.
// It keeps track of whether we're working with dev/staging or production or
// (via a one-line code change) a local database, and also stores and returns
// the token we get from parse-server when authorized as a particular user.
interface IConnection {
    headers: {
        "Content-Type": string;
        "X-Parse-Application-Id": string;
        "X-Parse-Session-Token"?: string;
    };
    url: string;
    // for auth0
    auth0Config: {
        domain: string;
        clientId: string;
    };
}
const prod: IConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5"
    },
    url: "https://bloom-parse-server-production.azurewebsites.net/parse/",
    auth0Config: config_prod
};
const dev: IConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR"
    },
    url: "https://bloom-parse-server-develop.azurewebsites.net/parse/",
    auth0Config: config_dev
};

const local: IConnection = {
    // for parse-server
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "myAppId"
    },
    url: "http://localhost:1337/parse/",
    auth0Config: config_local
};

export function getConnection(): IConnection {
    if (false) {
        // change to true when testing with local database
        return local;
    }
    if (
        window.location.hostname === "bloomlibrary.org"
        // for now, next.bloomlibrary.org is using the dev site.
        // || window.location.hostname === "next.bloomlibrary.org"
    ) {
        return prod;
    }

    // Storybook is currently configured to look at production
    if (
        window.location.hostname === "localhost" &&
        window.location.port === "9090"
    ) {
        return prod;
    }

    return dev;
}

export async function connectParsetoAuth0(
    jwtToken: string,
    userId: string
    //,returnParseUser: (user: any) => void
) {
    return new Promise<any>(resolve => {
        const connection = getConnection();
        // Run a cloud code function which, if this is a new user with the email of a known user,
        // will link them; and if it is a new email, will create a user with that ID and link them.
        axios
            .post(
                `${connection.url}functions/bloomLink`,
                {
                    token: jwtToken,
                    id: userId
                },

                {
                    headers: connection.headers
                }
            )
            .then(bloomLinkResult => {
                // now we can log in
                axios
                    .post(
                        `${connection.url}users`,
                        {
                            authData: {
                                bloom: { token: jwtToken, id: userId }
                            },
                            username: userId
                        },

                        {
                            headers: connection.headers
                        }
                    )
                    .then(
                        usersResult => {
                            if (usersResult.data.sessionToken) {
                                connection.headers["X-Parse-Session-Token"] =
                                    usersResult.data.sessionToken;
                                resolve(usersResult.data);
                                //returnParseUser(result.data);
                            }
                        },
                        error => {}
                    );
            });
    });
}

// Remove the parse session header when the user logs out.
// This is probably redundant since currently the logout process reloads the whole page.
// Leaving it just in case that changes.
export function logout() {
    const connection = getConnection();
    delete connection.headers["X-Parse-Session-Token"];
}
