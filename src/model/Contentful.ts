import { IBanner, IMedia, ICollection } from "./ContentInterfaces";

/* The aim is to keep knowledge of Contentful limited to this file, to the extent
that we think it is worth it. Meanwhile, rest of the code can use generic structures.
This makes the rest of the code a bit simpler to understand, type-safe, and cheaper
to change to a different system in the future. */

export function convertContentfulBannerToIBanner(fields: any): IBanner {
    const b: IBanner = { ...fields };
    b.backgroundImage = convertContentfulMediaToIMedia(fields.backgroundImage);
    b.logo = convertContentfulMediaToIMedia(fields.logo);
    return b;
}

export function convertContentfulCollectionToICollection(
    fields: any
): ICollection {
    // if (!fields || !fields.urlKey) {
    //     return undefined;
    // }
    let order: string | undefined;
    switch (fields.bookSortOrder) {
        case "newest-first":
            order = "-createdAt";
            break;
    }
    let bannerId = fields.banner?.sys?.id;
    if (!bannerId) {
        if (fields.urlKey.startsWith("language:")) {
            bannerId = "7v95c68TL9uJBe4pP5KTN0"; // also in makeLanguageCollection
        } else if (fields.urlKey.startsWith("topic:")) {
            bannerId = "7E1IHa5mYvLLSToJYh5vfW"; // also in makeTopicCollection
        } else {
            bannerId = "Qm03fkNd1PWGX3KGxaZ2v";
        }
    }
    const icon = convertContentfulMediaToIMedia(
        fields?.iconForCardAndDefaultBanner
    );
    const result: ICollection = {
        urlKey: fields.urlKey as string,
        label: fields.label,
        richTextLabel: fields.richTextLabel,
        filter: fields.filter,
        iconForCardAndDefaultBanner: icon,
        hideLabelOnCardAndDefaultBanner: fields.hideLabelOnCardAndDefaultBanner,
        childCollections: getSubCollections(fields.childCollections),
        bannerId,
        layout: fields.layout?.fields?.name || "by-level",
        order,
    };

    return result;
}

interface IContentfulMedia {
    fields: {
        title: string; // localized will be something like this: { [key: string]: string };
        description: string; // localized will be something like this: { [key: string]: string };
        file: {
            //[key: string]: {
            // localized will be something like this: { [key: string]: {... file fields}
            fileName: string;
            contentType: string;
            upload?: string;
            url?: string;
            //};
        };
    };
}
function convertContentfulMediaToIMedia(
    media: IContentfulMedia
): IMedia | undefined {
    if (!media) return undefined;
    const a: IMedia = { url: "", credits: "", altText: "" };

    if (media?.fields?.description) {
        const parts = (media.fields.description as string).split("Credits:");
        a.credits = (parts[1] ?? "").trim();
        a.altText = parts[0].trim();
    }
    a.url = media.fields.file.url || "";
    return a;
}

function getSubCollections(childCollections: any[]): ICollection[] {
    if (!childCollections) {
        return [];
    }
    // The final map here is a kludge to convince typescript that filtering out
    // the undefined elements yields a collection without any undefineds.
    return (
        childCollections
            .map((x: any) => convertContentfulCollectionToICollection(x.fields))
            //.filter((y) => y)
            .map((z) => z!)
    );
}
