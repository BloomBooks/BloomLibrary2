import { observable } from "mobx";
import { useObserver } from "mobx-react";
// This is currently just a subset of what ParseServer returns,
// so don't go renaming anything
export class User {
    constructor(userRecord: any) {
        this.objectId = userRecord.objectId;
        this.sessionId = userRecord.sessionId;
        this.email = userRecord.email;
        this.username = userRecord.username;
        this.administrator = userRecord.administrator;
        this.moderator = userRecord.moderator;
    }
    public objectId: string;
    public sessionId: string;
    public email: string;
    public username: string;
    public administrator: boolean;
    @observable
    public moderator: boolean; // set by ParseServerConnection.checkIfUserIsModerator() after successful login; not a built-in field.
}

// This just exists to facilitate mobx auto-re-rendering when we login or log out.
class UserHolder {
    @observable public current?: User;
}
export const LoggedInUser: UserHolder = new UserHolder();

export function useGetLoggedInUser(): User | undefined {
    return useObserver(() => LoggedInUser.current);
}
