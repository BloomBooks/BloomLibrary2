export interface ILangTagData {
    tag: string;
    name: string;
    names?: string[];
    region: string;
    regionname: string;
    regions?: string[];
}

// If we go back to using the country id data, we'll need this interface.
// export interface ICountryIdData {
//     a2: string; // 2-letter code (names match what is in the json data file)
//     a3: string; // 3-letter code
//     n: string; // name
// }

// Basic user information used by the uploader-grid page and language-grid page.

export interface IBasicUserInfo {
    objectId: string; // needed only to ensure uniqueness in a list of users
    createdAt: string; // when the user was created/registered.
    username: string; // the user's email address, real or not.
}
export interface IMinimalBookInfo {
    objectId: string;
    createdAt: string;
    tags: string[];
    lang1Tag?: string;
    show?: { pdf: { langTag: string } }; // there is more, but this is what we're using to get at l1 at the moment
    uploader: IBasicUserInfo;
}
