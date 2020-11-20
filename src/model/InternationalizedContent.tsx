import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouterContent from "../model/RouterContent";
import {
    useGetTagList,
    useGetCleanedAndOrderedLanguageList,
    IBookshelfResult,
    useGetBookshelvesByCategory,
} from "../connection/LibraryQueryHooks";
import {
    OSFeaturesContext,
    bloomDesktopAvailable,
    bloomReaderAvailable,
    cantUseBloomD,
    mobile,
} from "../components/OSFeaturesContext";
import UnderConstruction from "../components/UnderConstruction";
import {
    useInternationalizedTopics,
    ITopic,
} from "../model/useInternationalizedTopics";
import { ILanguage } from "../model/Language";

interface ICachedTables {
    tags: string[];
    languagesByBookCount: ILanguage[];
    bookshelves: IBookshelfResult[];
    topics: ITopic[];
}
// for use when we aren't in a react context with hooks
export const CachedTables: ICachedTables = {
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
    topics: [],
};

export const CachedTablesContext = React.createContext<ICachedTables>({
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
    topics: [],
});

// This needs to be a separate component because 'useInternationalizedTopics()' must be inside of
// IntlProvider (which is the top level component of App.tsx). By moving all the CachedTables stuff inside
// here, we are able to add topics and (eventually) features to that cached system as well.
export const InternationalizedContent: React.FunctionComponent = () => {
    const tags = useGetTagList();
    const languagesByBookCount = useGetCleanedAndOrderedLanguageList();
    const bookshelves = useGetBookshelvesByCategory();
    const topics = useInternationalizedTopics();
    CachedTables.bookshelves = bookshelves;
    CachedTables.tags = tags;
    CachedTables.languagesByBookCount = languagesByBookCount;
    CachedTables.topics = topics;

    const showUnderConstruction =
        window.location.hostname !== "bloomlibrary.org" &&
        window.location.hostname !== "embed.bloomlibrary.org" &&
        !window.location.hostname.startsWith("dev") &&
        window.location.hostname !== "localhost";

    return (
        <CachedTablesContext.Provider
            value={{
                tags,
                languagesByBookCount,
                bookshelves,
                topics,
            }}
        >
            <OSFeaturesContext.Provider
                value={{
                    bloomDesktopAvailable,
                    bloomReaderAvailable,
                    cantUseBloomD,
                    mobile,
                }}
            >
                {showUnderConstruction && <UnderConstruction />}

                <Router>
                    <RouterContent />
                </Router>
            </OSFeaturesContext.Provider>
        </CachedTablesContext.Provider>
    );
};

export default InternationalizedContent;
