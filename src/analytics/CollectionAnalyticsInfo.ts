import { ICollection } from "../model/ContentInterfaces";
import { getContextLangIso } from "../components/Routes";

interface ICollectionAnalyticsInfo {
    params: object;
    sendIt: boolean;
}

export function getCollectionAnalyticsInfo(
    collection: ICollection | undefined
): ICollectionAnalyticsInfo {
    if (!collection) {
        return { params: {}, sendIt: false };
    }
    const segments = collection.urlKey.split("/");
    const search = segments.find((x) => x.startsWith(":search:"));
    const params = {
        pathname: collection.urlKey,
        shelf: segments[0],
        features: [] as string[],
        searchString: search ? search.substring(":search:".length) : "",
        lang: "",
        tag: "",
    };

    if (collection.filter?.feature) {
        params.features = collection.filter.feature.split(" OR ");
    }
    // enhance: may also want to look for segments starting with feature: if we implement that

    if (segments[0].startsWith("language:")) {
        params.lang = getContextLangIso(segments[0]) as string;
    }
    // enhance: may also want to consider collection.filter.language or
    // later segments starting with :language:, but neither is used currently.

    const tags = [];

    if (collection.filter?.topic) {
        tags.push("topic:" + collection.filter.topic);
    }
    if (collection.filter?.otherTags) {
        tags.splice(tags.length, 0, collection.filter.otherTags);
    }
    const level = segments.find((x) => x.startsWith(":level:"));
    if (level) {
        tags.push(level.substring(1));
    }
    params.tag = tags.join(",");

    return { params, sendIt: true };
}
