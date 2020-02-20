import { observable } from "mobx";

// This is currently just a subset of what ParseServer returns,
// so don't go renaming anything
export interface IUser {
    objectId: string;
    sessionId: string;
    email: string;
    username: string;
    administrator: boolean;
    moderator: boolean; // set by ParseServerConnection.checkIfUserIsModerator() after successful login; not a built-in field.
}

// This just exists to facilitate mobx auto-re-rendering when we login or log out.
class UserHolder {
    @observable public current?: IUser;
}
export const LoggedInUser: UserHolder = new UserHolder();
