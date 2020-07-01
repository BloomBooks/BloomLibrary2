import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { useCollectionStats } from "../connection/LibraryQueryHooks";

// The casing here is unfortunate, but that's what the database gives us no matter what we do there.
// Could be enhanced by remapping all the fields in the Azure function or here, but those
// didn't seem worth it just to change the case.
interface ICollectionStats {
    // TODO: Update me when the final schema is ready.
    length: number;
}

function getEmptyCollectionStats(): ICollectionStats {
    return { length: 0 };
}

// TODO: A good name. Perhaps SelectionStats? These matching the selection?
// FilterSelectionStats?
// FilterResultStats?
export const CollectionStats: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    function useGetCollectionStats(collection: ICollection): ICollectionStats {
        const { response } = useCollectionStats(collection.filter);
        if (response && response["data"] && response["data"]["stats"])
            return response["data"]["stats"];
        return getEmptyCollectionStats();
    }

    function shouldDisplayBookStats(stats: ICollectionStats): boolean {
        // Append ?debug=true to the end of your URL to get this to show up
        return window.location.search.includes("debug=true");

        // TODO: Implement me once there is real data and real requirements to work with.
        //     return (
        //         stats.totaldownloads > 0 ||
        //         stats.totalreads > 0 ||
        //         stats.libraryviews > 0
        //     );
    }

    const stats = useGetCollectionStats(props.collection);
    return (
        (shouldDisplayBookStats(stats) && (
            <div>
                <strong>
                    <u>CollectionStats</u>
                </strong>
                <table>
                    <tbody>
                        <tr>
                            <td>NumBooks</td>
                            <td>{stats.length}</td>
                        </tr>
                        <tr>
                            <td>RawResponse</td>
                            <td>{JSON.stringify(stats)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )) ||
        null
    );
};
