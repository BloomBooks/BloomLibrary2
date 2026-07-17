// Stub Supabase implementation of IAuthenticationService. Auth is out of
// scope for this migration step (anonymous browsing only); we still need
// this to be constructible and safe to query at app startup, since
// src/authentication/firebase/firebase.ts calls getAuthenticationService()
// at module load time even when nobody ever logs in. So: state-query methods
// return "nobody is logged in" rather than throwing, while methods that
// would actually perform an auth action throw.
import { IAuthenticationService } from "../../interfaces/IAuthenticationService";
import { UserModel } from "../../models/UserModel";

const NOT_IMPLEMENTED = "not implemented in Supabase data layer yet";

export class SupabaseAuthenticationService implements IAuthenticationService {
    private authStateListeners: ((user: UserModel | undefined) => void)[] = [];

    async connectUser(): Promise<UserModel> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async logout(): Promise<void> {
        throw new Error(NOT_IMPLEMENTED);
    }

    getCurrentUser(): UserModel | undefined {
        return undefined;
    }

    setCurrentUser(user: UserModel | undefined): void {
        this.authStateListeners.forEach((listener) => listener(user));
    }

    onAuthStateChanged(
        callback: (user: UserModel | undefined) => void
    ): () => void {
        this.authStateListeners.push(callback);
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    getSessionToken(): string | undefined {
        return undefined;
    }

    hasValidSession(): boolean {
        return false;
    }

    async sendConcernEmail(): Promise<void> {
        throw new Error(NOT_IMPLEMENTED);
    }
}
