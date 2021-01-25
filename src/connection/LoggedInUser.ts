import { observable, makeObservable, autorun } from "mobx";
import { useState } from "react";

// This is currently just a subset of what ParseServer returns,
// so don't go renaming anything
export class User {
    constructor(userRecord: any) {
        makeObservable(this, {
            moderator: observable,
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
            current: observable,
        });
    }
}
export const LoggedInUser: UserHolder = new UserHolder();

// We want this to return the LoggedInUser.current, as currently observed...
// causing whatever calls this to re-render when the user changes.
// Previously done with mobx useObserver, which looked much simpler, but is
// now deprecated, this seems to be the best available replacement.
export function useGetLoggedInUser(): User | undefined {
    const [user, setUser] = useState(LoggedInUser.current);
    autorun(() => {
        if (LoggedInUser.current !== user) {
            setUser(LoggedInUser.current);
        }
    });
    return user;
}
