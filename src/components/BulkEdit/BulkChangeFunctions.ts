import { IFilter } from "FilterTypes";
import { DataLayerFactory } from "../../data-layer/factory/DataLayerFactory";
import { BookModel } from "../../data-layer/models/BookModel";
import { BookGridQuery } from "../../data-layer/types/QueryTypes";
import { Sorting } from "../../data-layer/types/CommonTypes";

export async function ChangeColumnValueForAllBooksInFilter(
    filter: IFilter,
    columnName: string,
    newValue: string | boolean,
    refresh: () => void
) {
    try {
        const factory = DataLayerFactory.getInstance();
        const bookRepository = factory.createBookRepository();

        // Create query to get all matching books
        const query: BookGridQuery = {
            filter,
            sorting: [],
            pagination: {
                limit: Number.MAX_SAFE_INTEGER, // Get all matching books
                skip: 0,
            },
            fieldSelection: ["id", "title"], // Only need minimal fields for bulk update
        };

        // Get matching books
        const result = await bookRepository.getBooksForGrid(query);

        if (!result.totalMatchingBooksCount) {
            refresh();
            return;
        }

        // Prepare update data
        const updateData: any = {
            updateSource: "bloom-library-bulk-edit",
            [columnName]: newValue,
        };

        // Update all books
        const promises: Array<Promise<void>> = [];
        for (const book of result.onePageOfMatchingBooks) {
            console.log(book.title);
            promises.push(bookRepository.updateBook(book.id, updateData));
        }

        await Promise.all(promises);
        refresh();
    } catch (error) {
        console.error("Error in bulk column value change:", error);
        alert(`Error: ${error}`);
    }
}

export async function AddTagAllBooksInFilter(
    filter: IFilter,
    newTag: string,
    refresh: () => void
) {
    try {
        if (!newTag.includes(":")) {
            // Provide a default prefix if none is provided.  Otherwise a "topic" prefix is
            // chosen for us.  See https://issues.bloomlibrary.org/youtrack/issue/BL-8990.
            if (newTag.startsWith("-")) {
                newTag = "-tag:" + newTag.substr(1);
            } else {
                newTag = "tag:" + newTag;
            }
        }

        const factory = DataLayerFactory.getInstance();
        const bookRepository = factory.createBookRepository();

        // Create query to get all matching books with tags
        const query: BookGridQuery = {
            filter,
            sorting: [],
            pagination: {
                limit: Number.MAX_SAFE_INTEGER, // Get all matching books
                skip: 0,
            },
            fieldSelection: ["id", "title", "tags"], // Need tags field for manipulation
        };

        // Get matching books
        const result = await bookRepository.getBooksForGrid(query);

        if (!result.totalMatchingBooksCount) {
            refresh();
            return;
        }

        const promises: Array<Promise<void>> = [];
        let changeCount = 0;

        for (const book of result.onePageOfMatchingBooks) {
            const currentTags = (book as any).tags || [];
            let newTags = [...currentTags];

            // a tag that starts with "-" means that we want to remove it
            if (newTag[0] === "-") {
                const tagToRemove = newTag.substr(1, newTag.length - 1);
                newTags = newTags.filter((t: string) => t !== tagToRemove);
            } else if (newTags.indexOf(newTag) < 0) {
                newTags.push(newTag);
            }

            if (newTags.length !== currentTags.length) {
                ++changeCount;
                promises.push(
                    bookRepository.updateBook(book.id, {
                        updateSource: "bloom-library-bulk-edit",
                        tags: newTags,
                    } as any)
                );
            }
        }

        console.log(`Changing tags on ${changeCount} books...`);
        await Promise.all(promises);
        refresh();
    } catch (error) {
        console.error("Error in bulk tag change:", error);
        alert(`Error: ${error}`);
    }
}

export async function AddFeatureToAllBooksInFilter(
    filter: IFilter,
    newFeature: string,
    refresh: () => void
) {
    try {
        const factory = DataLayerFactory.getInstance();
        const bookRepository = factory.createBookRepository();

        // Create query to get all matching books with features
        const query: BookGridQuery = {
            filter,
            sorting: [],
            pagination: {
                limit: Number.MAX_SAFE_INTEGER, // Get all matching books
                skip: 0,
            },
            fieldSelection: ["id", "title", "features"], // Need features field for manipulation
        };

        // Get matching books
        const result = await bookRepository.getBooksForGrid(query);

        if (!result.totalMatchingBooksCount) {
            refresh();
            return;
        }

        const promises: Array<Promise<void>> = [];
        let changeCount = 0;

        for (const book of result.onePageOfMatchingBooks) {
            const currentFeatures = (book as any).features || [];
            let newFeatures = [...currentFeatures];

            // a feature that starts with "-" means that we want to remove it
            if (newFeature[0] === "-") {
                const featureToRemove = newFeature.substr(
                    1,
                    newFeature.length - 1
                );
                newFeatures = newFeatures.filter(
                    (f: string) => f !== featureToRemove
                );
            } else if (newFeatures.indexOf(newFeature) < 0) {
                newFeatures.push(newFeature);
            }

            if (newFeatures.length !== currentFeatures.length) {
                ++changeCount;
                promises.push(
                    bookRepository.updateBook(book.id, {
                        updateSource: "bloom-library-bulk-edit",
                        features: newFeatures,
                    } as any)
                );
            }
        }

        console.log(`Changing features on ${changeCount} books...`);

        // ENHANCE: Or we could await Promise.all.
        // The caller (bulkEditPanel) could await this promise and then call props.refresh()
        // Instead of passing callbacks down the stack many layers.
        await Promise.all(promises);
        refresh();
    } catch (error) {
        console.error("Error in bulk feature change:", error);
        alert(`Error: ${error}`);
    }
}
