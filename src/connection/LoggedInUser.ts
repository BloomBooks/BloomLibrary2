import { observable, makeObservable, action } from "mobx";

// This is currently just a subset of what ParseServer returns,
// so don't go renaming anything
export class User {
    constructor(userRecord: any) {
        makeObservable(this, {
            moderator: observable,
            setModerator: action,
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
    public moderator: boolean;
    // Observables (like 'moderator' above) should now only be set by actions (like 'setModerator' below).
    // set by ParseServerConnection.checkIfUserIsModerator() after successful login; not a built-in field.
    public setModerator(isModerator: boolean) {
        this.moderator = isModerator;
    }
}

// This just exists to facilitate mobx auto-re-rendering when we login or log out.
class UserHolder {
    public current?: User;
    public setCurrent(user: User | undefined): void {
        this.current = user;
    }

    constructor() {
        makeObservable(this, {
            current: observable,
            setCurrent: action,
        });
    }
}

export const LoggedInUser: UserHolder = new UserHolder();
