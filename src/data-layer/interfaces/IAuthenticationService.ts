// Authentication service interface
import { UserModel } from "./IUserRepository";

export interface IAuthenticationService {
    // Authentication operations
    connectUser(
        jwtToken: string,
        emailAddress: string,
        // The Google/Firebase profile picture, or null when unavailable (e.g. email-password
        // login). Only passed through to the editor login POST; the backend doesn't use it.
        photoUrl?: string | null
    ): Promise<UserModel>;
    logout(): Promise<void>;

    // Current user state
    getCurrentUser(): UserModel | undefined;
    setCurrentUser(user: UserModel | undefined): void;

    // State change notifications
    onAuthStateChanged(
        callback: (user: UserModel | undefined) => void
    ): () => void;

    // Session management
    getSessionToken(): string | undefined;
    hasValidSession(): boolean;

    // Email operations (found in current codebase)
    sendConcernEmail(
        fromAddress: string,
        content: string,
        bookId: string
    ): Promise<void>;
}
