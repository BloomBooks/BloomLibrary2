import axios from "axios";
import { LoggedInUser, User } from "./LoggedInUser";
import * as Sentry from "@sentry/browser";

// This file exports a function getConnection(), which returns the headers
// needed to talk to our Parse Server backend db.
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
}
const prod: IConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
    },
    url: "https://bloom-parse-server-production.azurewebsites.net/parse/",
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dev: IConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR",
    },
    url: "https://bloom-parse-server-develop.azurewebsites.net/parse/",
};

const local: IConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "myAppId",
    },
    url: "http://localhost:1337/parse/",
};

export function getConnection(): IConnection {
    if (false) {
        // change to true when testing with local database
        return local;
    }
    if (
        window.location.hostname === "bloomlibrary.org" ||
        window.location.hostname === "next.bloomlibrary.org" ||
        window.location.hostname === "cf-next.bloomlibrary.org" ||
        window.location.hostname === "alpha.bloomlibrary.org"
    ) {
        return prod;
    }
    if (
        window.location.hostname === "dev.bloomlibrary.org" ||
        window.location.hostname === "dev-next.bloomlibrary.org"
    ) {
        return dev;
    }

    // Storybook is currently configured to look at development
    // Uncomment this to point it at production
    // if (
    //     window.location.hostname === "localhost" &&
    //     window.location.port === "9009"
    // ) {
    return prod;
    // }
    //return dev;
}

// This should only be called when there is a current user logged in.
// It attempts to retrieve a role with name moderator and this user as
// one of its users. If it gets one, this establishes that this user
// belongs to the moderator role, and that is recorded in the object.
function checkIfUserIsModerator() {
    LoggedInUser.current!.moderator = false; // default, unless we can verify otherwise
    const connection = getConnection();
    const userId = LoggedInUser.current!.objectId;
    axios
        .get(`${connection.url}roles`, {
            headers: connection.headers,
            params: {
                where: {
                    name: "moderator",
                    users: {
                        __type: "Pointer",
                        className: "_User",
                        objectId: userId,
                    },
                },
            },
        })
        .then((result) => {
            if (result.data.results.length > 0) {
                LoggedInUser.current!.moderator = true;
                /*
                was trying to get mobx / useGetLoggedInUser to cause a refresh once this is known
                const copy = LoggedInUser.current!;
                copy.moderator = true;
                LoggedInUser.current = copy;
                */
            }
        });
}

export async function connectParseServer(
    jwtToken: string,
    userId: string
    //,returnParseUser: (user: any) => void
) {
    return new Promise<any>((resolve, reject) => {
        const connection = getConnection();
        // Run a cloud code function (bloomLink) which,
        // if this is a new Firebase user with the email of a known parse server user, will link them.
        // It will do nothing if
        // - we have an existing parse server user with authData
        //   - in this case, the POST to users will log them in
        // - we have no existing parse server user
        //   - in this case, the POST to users will create the parse server user and link to the Firebase user
        axios
            .post(
                `${connection.url}functions/bloomLink`,
                {
                    token: jwtToken,
                    id: userId,
                },

                {
                    headers: connection.headers,
                }
            )
            .then(() => {
                // Now we can log in (or create a new parse server user if needed)
                axios
                    .post(
                        `${connection.url}users`,
                        {
                            authData: {
                                bloom: { token: jwtToken, id: userId },
                            },
                            username: userId,
                            email: userId, // needed in case we are creating a new user
                        },

                        {
                            headers: connection.headers,
                        }
                    )
                    .then((usersResult) => {
                        if (usersResult.data.sessionToken) {
                            LoggedInUser.current = new User(usersResult.data);
                            //Object.assign(CurrentUser, usersResult.data);
                            connection.headers["X-Parse-Session-Token"] =
                                usersResult.data.sessionToken;
                            //console.log("Got ParseServer Session ID");
                            resolve(usersResult.data);
                            //returnParseUser(result.data);
                            checkIfUserIsModerator();
                        } else failedToLoginInToParseServer();
                    })
                    .catch((err) => {
                        failedToLoginInToParseServer();
                        reject(err);
                    });
            })
            .catch((err) => {
                console.log(
                    "The `Bloom Link` call failed:" + JSON.stringify(err)
                );
                failedToLoginInToParseServer();
                reject(err);
            });
    });
}
function failedToLoginInToParseServer() {
    Sentry.captureException(
        new Error(
            "Login to parse server failed after successful firebase login"
        )
    );
    alert(
        "Oops, something went wrong when trying to log you into our database."
    );
}
// Remove the parse session header when the user logs out.
// This is probably redundant since currently the logout process reloads the whole page.
// Leaving it just in case that changes.
export function logout() {
    const connection = getConnection();
    axios
        .post(`${connection.url}logout`, {
            headers: connection.headers,
        })
        .then((response) => {
            console.log("ParseServer logged out.");
        })
        .catch((error) => console.error("While logging out, got" + error))
        .finally(() => {
            delete connection.headers["X-Parse-Session-Token"];
            LoggedInUser.current = undefined;
        });
}
