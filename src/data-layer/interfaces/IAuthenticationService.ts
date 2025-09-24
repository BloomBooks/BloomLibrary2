// Authentication service interface
import { UserModel } from "./IUserRepository";

export interface IAuthenticationService {
    // Authentication operations
    connectUser(jwtToken: string, userId: string): Promise<UserModel>;
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
