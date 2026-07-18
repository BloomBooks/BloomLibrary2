// ParseServer authentication service implementation
import axios from "axios";
import * as Sentry from "@sentry/browser";
import { IAuthenticationService } from "../../interfaces/IAuthenticationService";
import { UserModel } from "../../models/UserModel";
import { ParseConnection } from "./ParseConnection";
import { LoggedInUser, User } from "../../../connection/LoggedInUser";
import { informEditorOfSuccessfulLogin, isForEditor } from "../../../editor";
import { ParseUserRepository } from "./ParseUserRepository";

export class ParseAuthenticationService implements IAuthenticationService {
    private authStateListeners: ((user: UserModel | undefined) => void)[] = [];
    private userRepository = new ParseUserRepository();

    async connectUser(
        jwtToken: string,
        emailAddress: string,
        // The Google/Firebase profile picture, or null when unavailable (e.g. email-password login).
        // We only pass it through to the editor login POST; Parse itself doesn't use it.
        photoUrl?: string | null
    ): Promise<UserModel> {
        const connection = ParseConnection.getConnection();

        try {
            await axios.post(
                `${connection.url}functions/bloomLink`,
                {
                    token: jwtToken,
                    id: emailAddress,
                },
                {
                    headers: connection.headers,
                }
            );
        } catch (error) {
            console.log(
                "The `Bloom Link` call failed:" + JSON.stringify(error)
            );
            this.failedToLoginInToParseServer();
            throw error instanceof Error
                ? error
                : new Error("Bloom Link call failed");
        }

        let usersResult;
        try {
            usersResult = await axios.post(
                `${connection.url}users`,
                {
                    authData: {
                        bloom: { token: jwtToken, id: emailAddress },
                    },
                    username: emailAddress,
                    // Parse requires an `email` field when creating a new _User.
                    email: emailAddress,
                },
                {
                    headers: connection.headers,
                }
            );
        } catch (error) {
            this.failedToLoginInToParseServer();
            throw error instanceof Error
                ? error
                : new Error("Parse user login failed");
        }

        // We require BOTH a session token and an email.
        // We don't actually know why we would ever get here without either.
        // But we were sending posts to Bloom with a missing email value in the payload,
        // which caused Bloom's `/bloom/api/external/login` handler to throw a runtime exception. See BL-14503.
        // I don't see any reason to pretend a non-editor login was successful if email
        // is missing, either. And it simplifies the code to just check up front.
        // Throwing lets callers stop the login flow (for example, `firebase.ts` catches this
        // and signs the user out of Firebase) rather than silently continuing.
        if (!usersResult.data.sessionToken || !usersResult.data.email) {
            this.failedToLoginInToParseServer();
            throw new Error(
                "Missing sessionToken or email in usersResult.data"
            );
        }

        LoggedInUser.current = new User(usersResult.data);
        ParseConnection.setSessionToken(usersResult.data.sessionToken);

        if (isForEditor()) {
            informEditorOfSuccessfulLogin(usersResult.data, photoUrl);
        }

        const isModerator = await this.userRepository.checkUserIsModerator(
            usersResult.data.objectId
        );

        if (LoggedInUser.current) {
            LoggedInUser.current.moderator = isModerator;
        }

        const userModel = new UserModel({
            objectId: usersResult.data.objectId,
            username: usersResult.data.username || emailAddress,
            email: usersResult.data.email || emailAddress,
            sessionId: usersResult.data.sessionToken,
            createdAt: usersResult.data.createdAt || new Date().toISOString(),
            updatedAt: usersResult.data.updatedAt || new Date().toISOString(),
            moderator: isModerator,
        });

        this.notifyAuthStateListeners(userModel);
        return userModel;
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
            LoggedInUser.current = new User({
                objectId: user.objectId,
                sessionId: user.sessionId ?? "",
                email: user.email,
                username: user.username,
                moderator: user.moderator,
                informEditorResult: user.informEditorResult,
            });
            if (LoggedInUser.current) {
                LoggedInUser.current.showTroubleshootingStuff =
                    user.showTroubleshootingStuff ?? false;
            }
            ParseConnection.setSessionToken(user.sessionId);
            this.notifyAuthStateListeners(user);
            return;
        }

        LoggedInUser.current = undefined;
        ParseConnection.clearSessionToken();
        this.notifyAuthStateListeners(undefined);
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
