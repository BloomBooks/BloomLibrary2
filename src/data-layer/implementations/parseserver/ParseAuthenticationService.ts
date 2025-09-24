// ParseServer authentication service implementation
import axios from "axios";
import * as Sentry from "@sentry/browser";
import { IAuthenticationService } from "../../interfaces/IAuthenticationService";
import { UserModel } from "../../models/UserModel";
import { ParseConnection } from "./ParseConnection";
import { LoggedInUser, User } from "../../../connection/LoggedInUser";
import { informEditorOfSuccessfulLogin, isForEditor } from "../../../editor";

export class ParseAuthenticationService implements IAuthenticationService {
    private authStateListeners: ((user: UserModel | undefined) => void)[] = [];

    async connectUser(jwtToken: string, userId: string): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            const connection = ParseConnection.getConnection();

            // Run a cloud code function (bloomLink) which,
            // if this is a new Firebase user with the email of a known parse server user, will link them.
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
                                LoggedInUser.current = new User(
                                    usersResult.data
                                );
                                ParseConnection.setSessionToken(
                                    usersResult.data.sessionToken
                                );

                                if (isForEditor()) {
                                    informEditorOfSuccessfulLogin(
                                        usersResult.data
                                    );
                                }

                                // Check if user is moderator
                                this.checkIfUserIsModerator();

                                // Convert to UserModel
                                const userModel = new UserModel({
                                    objectId: usersResult.data.objectId,
                                    username:
                                        usersResult.data.username || userId,
                                    email: usersResult.data.email || userId,
                                    sessionId: usersResult.data.sessionToken,
                                    createdAt:
                                        usersResult.data.createdAt ||
                                        new Date().toISOString(),
                                    updatedAt:
                                        usersResult.data.updatedAt ||
                                        new Date().toISOString(),
                                });

                                this.notifyAuthStateListeners(userModel);
                                resolve(userModel);
                            } else {
                                this.failedToLoginInToParseServer();
                                reject(new Error("No session token received"));
                            }
                        })
                        .catch((err) => {
                            this.failedToLoginInToParseServer();
                            reject(err);
                        });
                })
                .catch((err) => {
                    console.log(
                        "The `Bloom Link` call failed:" + JSON.stringify(err)
                    );
                    this.failedToLoginInToParseServer();
                    reject(err);
                });
        });
    }

    async logout(): Promise<void> {
        const connection = ParseConnection.getConnection();

        try {
            await axios.post(`${connection.url}logout`, null, {
                headers: connection.headers,
            });
            console.log("ParseServer logged out.");
        } catch (error) {
            console.error("While logging out, got" + error);
        } finally {
            ParseConnection.clearSessionToken();
            LoggedInUser.current = undefined;
            this.notifyAuthStateListeners(undefined);
        }
    }

    getCurrentUser(): UserModel | undefined {
        if (!LoggedInUser.current) {
            return undefined;
        }

        return new UserModel({
            objectId: LoggedInUser.current.objectId,
            username: LoggedInUser.current.username,
            email: LoggedInUser.current.email,
            sessionId: ParseConnection.getSessionToken(),
            moderator: LoggedInUser.current.moderator,
            showTroubleshootingStuff:
                LoggedInUser.current.showTroubleshootingStuff,
            createdAt: new Date().toISOString(), // User doesn't have these fields, so use current time
            updatedAt: new Date().toISOString(),
        });
    }

    setCurrentUser(user: UserModel | undefined): void {
        if (user) {
            // This would need to update the LoggedInUser.current as well
            // For now, just notify listeners
            this.notifyAuthStateListeners(user);
        } else {
            LoggedInUser.current = undefined;
            ParseConnection.clearSessionToken();
            this.notifyAuthStateListeners(undefined);
        }
    }

    onAuthStateChanged(
        callback: (user: UserModel | undefined) => void
    ): () => void {
        this.authStateListeners.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    hasValidSession(): boolean {
        return this.isLoggedIn();
    }

    isLoggedIn(): boolean {
        return (
            ParseConnection.hasSessionToken() &&
            LoggedInUser.current !== undefined
        );
    }

    getSessionToken(): string | undefined {
        return ParseConnection.getSessionToken();
    }

    async sendConcernEmail(
        fromAddress: string,
        content: string,
        bookId: string
    ): Promise<void> {
        const connection = ParseConnection.getConnection();

        await axios.post(
            `${connection.url}functions/sendConcernEmail`,
            {
                fromAddress,
                content,
                bookId,
            },
            {
                headers: connection.headers,
            }
        );
    }

    private async checkIfUserIsModerator(): Promise<void> {
        if (!LoggedInUser.current) {
            return;
        }

        const connection = ParseConnection.getConnection();

        try {
            const result = await axios.get(
                `${connection.url}classes/moderators?where={"user": {"__type":"Pointer","className":"_User","objectId":"${LoggedInUser.current.objectId}"}}`,
                {
                    headers: connection.headers,
                }
            );

            if (result.data.results.length > 0) {
                LoggedInUser.current.moderator = true;
            }
        } catch (error) {
            console.error("Error checking moderator status:", error);
        }
    }

    private failedToLoginInToParseServer(): void {
        Sentry.captureException(
            new Error(
                "Login to parse server failed after successful firebase login"
            )
        );
        alert(
            "Oops, something went wrong when trying to log you into our database."
        );
    }

    private notifyAuthStateListeners(user: UserModel | undefined): void {
        this.authStateListeners.forEach((listener) => listener(user));
    }
}
