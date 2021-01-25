import { observable, makeObservable } from "mobx";
import { useObserver } from "mobx-react-lite";
// This is currently just a subset of what ParseServer returns,
// so don't go renaming anything
export class User {
    constructor(userRecord: any) {
        makeObservable(this, {
            moderator: observable
        });

        this.objectId = userRecord.objectId;
        this.sessionId = userRecord.sessionId;
        this.email = userRecord.email;
        this.username = userRecord.username;
        this.moderator = userRecord.moderator;
    }
    public objectId: string;
    public sessionId: string;
    public email: string;
    public username: string;
    public moderator: boolean; // set by ParseServerConnection.checkIfUserIsModerator() after successful login; not a built-in field.
}

// This just exists to facilitate mobx auto-re-rendering when we login or log out.
class UserHolder {
    public current?: User;

    constructor() {
        makeObservable(this, {
            current: observable
        });
    }
}
export const LoggedInUser: UserHolder = new UserHolder();

export function useGetLoggedInUser(): User | undefined {
    return useObserver(() => LoggedInUser.current);
}
