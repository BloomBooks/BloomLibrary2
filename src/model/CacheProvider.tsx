import React from "react";

import {
    useGetTagList,
    useGetCleanedAndOrderedLanguageList,
    IBookshelfResult,
    useGetBookshelvesByCategory,
} from "../connection/LibraryQueryHooks";

import { ILanguage } from "./Language";

interface ICachedTables {
    tags: string[];
    languagesByBookCount: ILanguage[];
    bookshelves: IBookshelfResult[];
}

// for use when we aren't in a react context with hooks
export const CachedTables: ICachedTables = {
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
};

export const CachedTablesContext = React.createContext<ICachedTables>({
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
});

export const CacheProvider: React.FunctionComponent = (props) => {
    CachedTables.bookshelves = useGetBookshelvesByCategory();
    CachedTables.tags = useGetTagList();
    CachedTables.languagesByBookCount = useGetCleanedAndOrderedLanguageList();

    return (
        <CachedTablesContext.Provider
            value={{
                bookshelves: CachedTables.bookshelves,
                languagesByBookCount: CachedTables.languagesByBookCount,
                tags: CachedTables.tags,
            }}
        >
            {props.children}
        </CachedTablesContext.Provider>
    );
};

// export const CacheProvider: React.FunctionComponent<{value}> = (props) => {
//     CachedTables.bookshelves = useGetBookshelvesByCategory();
//     CachedTables.tags = useGetTagList();
//     CachedTables.languagesByBookCount = useGetCleanedAndOrderedLanguageList();

//     return (
//         <CachedTablesContext.Provider value={props.value}>
//             {props.children}
//         </CachedTablesContext.Provider>
//     );
// };

export default CacheProvider;
