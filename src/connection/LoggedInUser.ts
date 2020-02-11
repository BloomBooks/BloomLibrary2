import { observable } from "mobx";

// This is currently just a subset of what ParseServer returns,
// so don't go renaming anything
export interface IUser {
    sessionId: string;
    email: string;
    username: string;
    administrator: boolean;
}

// This just exists to facilitate mobx auto-re-rendering when we login or log out.
class UserHolder {
    @observable public current?: IUser;
}
export const LoggedInUser: UserHolder = new UserHolder();
