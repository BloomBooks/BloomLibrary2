// Stub Supabase implementation of IAuthenticationService. Auth is out of
// scope for this migration step (anonymous browsing only); we still need
// this to be constructible and safe to query at app startup, since
// src/authentication/firebase/firebase.ts calls getAuthenticationService()
// at module load time even when nobody ever logs in. So: state-query methods
// return "nobody is logged in" rather than throwing, while methods that
// would actually perform an auth action throw.
import { IAuthenticationService } from "../../interfaces/IAuthenticationService";
import { UserModel } from "../../models/UserModel";
import { SupabaseConnection } from "./SupabaseConnection";

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

    // Unlike the rest of this class, this is a real implementation: it calls
    // the send-concern-email edge function (bloom-core-supabase), which
    // replaces the Parse cloud function of the same purpose. Note that under
    // the current mixed-mode registration (SWITCHOVER-READINESS.md D1) the
    // live path is still ParseAuthenticationService; this becomes active when
    // Supabase auth lands.
    async sendConcernEmail(
        fromAddress: string,
        content: string,
        bookId: string
    ): Promise<void> {
        const { error } = await SupabaseConnection.getClient().functions.invoke(
            "send-concern-email",
            {
                body: { fromAddress, content, bookId },
            }
        );
        if (error) {
            throw new Error(`Failed to send concern email: ${error.message}`);
        }
    }
}
