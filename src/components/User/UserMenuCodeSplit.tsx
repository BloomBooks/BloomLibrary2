import React from "react";

export interface IUserMenuProps extends React.HTMLProps<HTMLDivElement> {
    buttonHeight: string;
}

// This must be at module scope. Calling React.lazy inside the component would make a new
// component type on every render, so React would remount UserMenu each time the Header
// re-renders (every navigation), briefly showing a logged-in user as logged out (BL-17174).
const UserMenu = React.lazy(
    () => import(/* webpackChunkName: "userMenu" */ "./UserMenu")
);

// This is wrapped so that we can keep all the javascript involved in the UserMenu
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const UserMenuCodeSplit: React.FunctionComponent<IUserMenuProps> = (
    props
) => {
    // This is to prevent an inscrutable error about incompatible types
    const { ref, ...propsToPassDown } = props;

    return (
        <React.Suspense fallback={<div />}>
            <UserMenu {...propsToPassDown} />
        </React.Suspense>
    );
};
