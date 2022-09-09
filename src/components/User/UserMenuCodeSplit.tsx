import React from "react";

export interface IUserMenuProps extends React.HTMLProps<HTMLDivElement> {
    buttonHeight: string;
}

// This is wrapped so that we can keep all the javascript involved in the UserMenu
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const UserMenuCodeSplit: React.FunctionComponent<IUserMenuProps> = (
    props
) => {
    const UserMenu = React.lazy(
        () => import(/* webpackChunkName: "userMenu" */ "./UserMenu")
    );

    // This is to prevent an inscrutable error about incompatible types
    const { ref, ...propsToPassDown } = props;

    return (
        <React.Suspense fallback={<div />}>
            <UserMenu {...propsToPassDown} />
        </React.Suspense>
    );
};
