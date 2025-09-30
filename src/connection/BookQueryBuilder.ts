import { Book } from "../model/Book";
import { BooleanOptions, IFilter, parseBooleanOptions } from "../IFilter";
import { processRegExp } from "../Utilities";
import { kTopicList } from "../model/ClosedVocabularies";
import { kTagForNoLanguage } from "../model/Language";
import { BookOrderingScheme } from "../model/ContentInterfaces";
import { isAppHosted } from "../components/appHosted/AppHostedUtils";

const facets = [
    "title:",
    "uploader:",
    "copyright:",
    "license:",
    "harvestState:",
    "country:",
    "phash:",
    "bookHash:",
    "level:",
    "feature:",
    "originalPublisher:",
    "publisher:",
    "language:",
    "brandingProjectName:",
    "branding:",
    "rebrand:",
    "bookInstanceId:",
];

export const bookDetailFields =
    "title,allTitles,baseUrl,bookOrder,inCirculation,draft,license,licenseNotes,summary,copyright,harvestState,harvestLog," +
    "tags,pageCount,phashOfFirstContentImage,bookHashFromImages," +
    "show," +
    "credits,country,features,internetLimits," +
    "librarianNote,uploader,langPointers,importedBookSourceUrl,downloadCount,suitableForMakingShells,lastUploaded," +
    "harvestStartedAt,publisher,originalPublisher,keywords,bookInstanceId,brandingProjectName,edition,rebrand,bloomPUBVersion";

export const kNameOfNoTopicCollection = "Other";

let reportedDerivativeProblem = false;

export function isFacetedSearchString(searchString: string): boolean {
    for (const facet of facets) {
        if (searchString.toLowerCase().startsWith(facet.toLowerCase()))
            return true;
        if (searchString.toLowerCase().includes(" " + facet.toLowerCase()))
            return true;
    }
    return false;
}

export function splitString(
    input: string,
    allTagsInDatabase: string[]
): { otherSearchTerms: string; specialParts: string[] } {
    const possibleParts = [...facets, ...allTagsInDatabase];
    let otherSearchTerms = input
        .replace(/ {2}/g, " ")
        .trim()
        .replace(/: /g, ":");
    const specialParts: string[] = [];
    for (;;) {
        let gotOne = false;
        const otherSearchTermsLc = otherSearchTerms.toLowerCase();
        for (const possiblePart of possibleParts) {
            const possiblePartLowerCase = possiblePart.toLowerCase();
            const index = otherSearchTermsLc.indexOf(possiblePartLowerCase);
            if (index < 0) continue;
            gotOne = true;
            let end = index + possiblePart.length;
            const isFacet = facets.includes(possiblePart);
            let part = otherSearchTerms.substring(index, end);
            if (isFacet) {
                const result = getFacetPartWithOrWithoutQuotes(
                    otherSearchTerms,
                    index,
                    end
                );
                part = result.part;
                end = result.end;
            }
            if (!isFacet && possibleParts.indexOf(part) < 0) {
                part = possiblePart;
            }
            specialParts.push(part);
            otherSearchTerms = (
                otherSearchTerms.substring(0, index) +
                " " +
                otherSearchTerms.substring(end, otherSearchTerms.length)
            )
                .replace(/\s+/, " ")
                .trim();
            break;
        }
        if (!gotOne) break;
    }

    return { otherSearchTerms, specialParts };
}

export function constructParseSortOrder(
    sortingArray: { columnName: string; descending: boolean }[]
) {
    let order = "";
    if (sortingArray?.length > 0) {
        order = sortingArray[0].columnName;
        if (sortingArray[0].descending) {
            order = "-" + order;
        }
    }
    return order;
}

export function constructParseBookQuery(
    params: any,
    filter: IFilter,
    allTagsFromDatabase: string[],
    orderingScheme?: BookOrderingScheme,
    limit?: number,
    skip?: number
): object {
    if (orderingScheme === undefined)
        orderingScheme = BookOrderingScheme.Default;

    if (filter?.derivedFromCollectionName) {
        alert("Attempted to load books with an invalid filter.");
        console.error(
            `Called constructParseBookQuery with a filter containing truthy derivedFromCollectionName (${filter.derivedFromCollectionName}). See useProcessDerivativeFilter().`
        );
    }

    console.assert(filter, "Filter is unexpectedly falsey. Investigate why.");
    const f: IFilter = filter ? filter : {};

    if (limit) {
        params.limit = limit;
    }
    if (skip) {
        params.skip = skip;
    }

    params.where = filter ? JSON.parse(JSON.stringify(filter)) : {};

    if (params.keys) {
        params.keys = params.keys.replace(/ /g, "");
    }

    const tagsAll: string[] = [];
    const tagParts: object[] = [];
    if (!!f.search) {
        const { otherSearchTerms, specialParts } = splitString(
            f.search!,
            allTagsFromDatabase
        );
        for (const part of specialParts) {
            const facetParts = part.split(":").map((p) => p.trim());
            let facetLabel = facetParts[0];
            const facetValue = facetParts[1];
            switch (facetLabel) {
                case "title":
                case "copyright":
                case "country":
                case "publisher":
                case "originalPublisher":
                case "edition":
                case "brandingProjectName":
                case "branding":
                    if (facetLabel === "branding")
                        facetLabel = "brandingProjectName";
                    params.where[facetLabel] = regex(facetValue);
                    break;
                case "license":
                    params.where.license = {
                        $regex: `^${facetValue}$`,
                        ...caseInsensitive,
                    };
                    break;
                case "uploader":
                    params.where.uploader = {
                        $inQuery: {
                            where: {
                                email: regex(facetValue),
                            },
                            className: "_User",
                        },
                    };
                    break;
                case "feature":
                    params.where.features = facetValue;
                    if (facetValue === "activity") {
                        params.where.features = { $in: ["activity", "quiz"] };
                    }
                    break;
                case "phash":
                    params.where.phashOfFirstContentImage = regexCaseSensitive(
                        facetValue
                    );
                    break;
                case "bookHash":
                    params.where.bookHashFromImages = facetValue;
                    break;
                case "harvestState":
                    params.where.harvestState = facetValue;
                    break;
                case "rebrand":
                    f.rebrand = parseBooleanOptions(facetValue);
                    break;
                case "language":
                    f.language = facetValue;
                    break;
                case "level":
                    if (facetValue === "empty") {
                        tagParts.push({
                            $nin: [
                                "level:1",
                                "level:2",
                                "level:3",
                                "level:4",
                                "computedLevel:1",
                                "computedLevel:2",
                                "computedLevel:3",
                                "computedLevel:4",
                            ],
                        });
                    } else {
                        tagParts.push({
                            $in: [
                                "computedLevel:" + facetValue,
                                "level:" + facetValue,
                            ],
                        });
                        const otherPrimaryLevels = [
                            "level:1",
                            "level:2",
                            "level:3",
                            "level:4",
                        ].filter((x) => x.indexOf(facetValue) < 0);

                        tagParts.push({
                            $nin: otherPrimaryLevels,
                        });
                    }
                    break;
                case "bookInstanceId":
                    params.where.bookInstanceId = facetValue;
                    f.draft = BooleanOptions.All;
                    f.inCirculation = BooleanOptions.All;
                    break;
                default:
                    tagsAll.push(part);
                    break;
            }
        }
        if (otherSearchTerms.length > 0) {
            params.where.search = {
                $text: {
                    $search: {
                        $term: removeUnwantedSearchTerms(otherSearchTerms),
                    },
                },
            };
            if (orderingScheme === BookOrderingScheme.Default) {
                if (params.keys === undefined) {
                    params.keys = bookDetailFields;
                }
                if (params.keys.indexOf("$score") < 0) {
                    params.keys = "$score," + params.keys;
                }
            }
        } else {
            delete params.where.search;
        }
    }
    if (params.where.search?.length === 0) {
        delete params.where.search;
    }

    configureQueryParamsForOrderingScheme(params, orderingScheme);

    if (f.language != null) {
        delete params.where.language;

        if (f.language === kTagForNoLanguage) {
            params.where.langPointers = { $eq: [] };
        } else {
            params.where.langPointers = {
                $inQuery: {
                    where: { isoCode: f.language },
                    className: "language",
                },
            };
        }
    }

    if (f.otherTags != null) {
        delete params.where.otherTags;
        f.otherTags.split(",").forEach((t) => tagsAll.push(t));
    }

    if (f.bookShelfCategory != null) {
        delete params.where.bookShelfCategory;
    }

    if (f.bookshelf) {
        delete params.where.bookshelf;
    }

    if (f.topic) {
        delete params.where.topic;
        if (f.topic === kNameOfNoTopicCollection) {
            tagParts.push({
                $nin: kTopicList.map((t) => "topic:" + t),
            });
        } else if (f.topic.indexOf(",") >= 0) {
            const topicsRegex = f.topic
                .split(",")
                .map((s) => "topic:" + processRegExp(s))
                .join("|");
            tagParts.push({
                $regex: topicsRegex,
                ...caseInsensitive,
            });
        } else {
            const topicRegex = `^topic:${processRegExp(f.topic)}$`;
            tagParts.push({
                $regex: topicRegex,
                ...caseInsensitive,
            });
        }
    }
    if (tagsAll.length === 1 && tagParts.length === 0) {
        if (tagsAll[0].startsWith("*") || tagsAll[0].endsWith("*")) {
            const tagRegex = getPossiblyAnchoredRegex(tagsAll[0]);
            params.where.tags = { $regex: tagRegex };
        } else {
            params.where.tags = tagsAll[0];
        }
    } else {
        if (tagsAll.length) {
            const tagsAll2: any[] = [];
            tagsAll.forEach((tag) => {
                if (tag.startsWith("*") || tag.endsWith("*")) {
                    tagsAll2.push({ $regex: getPossiblyAnchoredRegex(tag) });
                } else {
                    tagsAll2.push(tag);
                }
            });
            if (tagsAll2.length === 1) {
                tagParts.push(tagsAll2[0]);
            } else {
                tagParts.push({
                    $all: tagsAll2,
                });
            }
        }
        if (tagParts.length === 1) {
            params.where.tags = tagParts[0];
        } else if (tagParts.length > 1) {
            params.where.$and = tagParts.map((p: any) => {
                return {
                    tags: p,
                };
            });
        }
    }
    if (f.feature != null) {
        delete params.where.feature;
        const features = f.feature.split(" OR ");
        if (features.length === 1) {
            params.where.features = f.feature;
        } else {
            params.where.features = { $in: features };
        }
    }
    delete params.where.inCirculation;
    switch (f.inCirculation) {
        case undefined:
        case BooleanOptions.Yes:
            params.where.inCirculation = true;
            break;
        case BooleanOptions.No:
            params.where.inCirculation = false;
            break;
        case BooleanOptions.All:
            break;
    }
    delete params.where.draft;
    switch (f.draft) {
        case BooleanOptions.Yes:
            params.where.draft = true;
            break;
        case undefined:
        case BooleanOptions.No:
            params.where.draft = false;
            break;
        case BooleanOptions.All:
            break;
    }

    delete params.where.keywordsText;
    if (f.keywordsText) {
        const [, keywordStems] = Book.getKeywordsAndStems(f.keywordsText);
        params.where.keywordStems = {
            $all: keywordStems,
        };
    }

    if (f.publisher) {
        params.where.publisher = f.publisher;
    }
    if (f.originalPublisher) {
        params.where.originalPublisher = f.originalPublisher;
    }
    if (f.edition) {
        params.where.edition = f.edition;
    }
    if (f.brandingProjectName) {
        params.where.brandingProjectName = f.brandingProjectName;
    }

    delete params.where.derivedFrom;
    delete params.where.bookLineageArray;
    if (f.derivedFrom) {
        processDerivedFrom(f, allTagsFromDatabase, params);
    }

    delete params.where.originalCredits;
    if (f.originalCredits) {
        params.where.credits = f.originalCredits;
    }

    delete params.where.rebrand;
    switch (f.rebrand) {
        case BooleanOptions.Yes:
            params.where.rebrand = true;
            break;
        case BooleanOptions.No:
            params.where.rebrand = false;
            break;
        case BooleanOptions.All:
            break;
    }

    params.where.baseUrl = { $exists: true };

    if (isAppHosted()) {
        params.where.hasBloomPub = true;
    }

    if (f.anyOfThese) {
        delete params.where.anyOfThese;
        params.where.$or = [];
        for (const child of f.anyOfThese) {
            const pbq = constructParseBookQuery({}, child, []) as any;
            simplifyInnerQuery(pbq.where, child);
            params.where.$or.push(pbq.where);
        }
    }
    return params;
}

function regexCaseSensitive(value: string) {
    return {
        $regex: processRegExp(value),
    };
}

const caseInsensitive = { $options: "i" };

function regex(value: string) {
    return {
        $regex: processRegExp(value),
        ...caseInsensitive,
    };
}

export function simplifyInnerQuery(where: any, innerQueryFilter: IFilter) {
    if (!innerQueryFilter.inCirculation) {
        delete where.inCirculation;
    }
    if (!innerQueryFilter.draft) {
        delete where.draft;
    }
    delete where.baseUrl;
}

function configureQueryParamsForOrderingScheme(
    params: any,
    orderingScheme: BookOrderingScheme
) {
    switch (orderingScheme) {
        case BookOrderingScheme.None:
            delete params.order;
            break;

        case BookOrderingScheme.Default:
            if (params.keys && params.keys.indexOf("$score") >= 0) {
                params.order = "$score";
            } else {
                params.order = "-createdAt";
            }
            break;
        case BookOrderingScheme.NewestCreationsFirst:
            params.order = "-createdAt";
            break;
        case BookOrderingScheme.LastUploadedFirst:
            params.order = "-lastUploaded";
            break;
        case BookOrderingScheme.TitleAlphabetical:
        case BookOrderingScheme.TitleAlphaIgnoringNumbers:
            delete params.order;
            params.limit = Number.MAX_SAFE_INTEGER;
            break;

        default:
            throw new Error("Unhandled book ordering scheme");
    }
}

function removeUnwantedSearchTerms(searchTerms: string): string {
    const termsToRemove = [
        "book",
        "books",
        "libro",
        "libros",
        "livre",
        "livres",
    ];
    return searchTerms
        .replace(
            new RegExp("\\b(" + termsToRemove.join("|") + ")\\b", "gi"),
            " "
        )
        .replace(/\s{2,}/g, " ")
        .trim();
}

function processDerivedFrom(
    f: IFilter,
    allTagsFromDatabase: string[],
    params: any
) {
    if (!f || !f.derivedFrom) return;

    let nonParentFilter: any;
    if (f.derivedFrom.otherTags) {
        nonParentFilter = { tags: { $ne: f.derivedFrom.otherTags } };
    } else if (f.derivedFrom.publisher) {
        nonParentFilter = {
            publisher: { $ne: f.derivedFrom.publisher },
        };
    } else if (f.derivedFrom.brandingProjectName) {
        nonParentFilter = {
            brandingProjectName: {
                $ne: f.derivedFrom.brandingProjectName,
            },
        };
    } else if (!reportedDerivativeProblem) {
        reportedDerivativeProblem = true;
        alert(
            "derivatives collection may include items from original collection"
        );
    }
    const innerWhere = (constructParseBookQuery(
        {},
        f.derivedFrom,
        allTagsFromDatabase
    ) as any).where;
    simplifyInnerQuery(innerWhere, f.derivedFrom);
    const bookLineage = {
        bookLineageArray: {
            $select: {
                query: { className: "books", where: innerWhere },
                key: "bookInstanceId",
            },
        },
    };
    if (params.where.$and) {
        params.where.$and.push(bookLineage);
    } else {
        params.where.$and = [bookLineage];
    }
    if (nonParentFilter) {
        params.where.$and.push(nonParentFilter);
    }
}

function getFacetPartWithOrWithoutQuotes(
    searchString: string,
    startIndex: number,
    endIndex: number
): { part: string; end: number } {
    const facet = searchString.substring(startIndex, endIndex);
    const len = searchString.length;
    if (len === endIndex) {
        return { part: facet, end: endIndex };
    }
    let start = endIndex;
    let end: number;
    let facetPart: string;
    if (searchString[start] === '"') {
        start++;
        let first = start;
        do {
            end = searchString.indexOf('"', first);
            if (end < 0) {
                end = len;
                break;
            } else if (end > first && searchString[end - 1] === "\\") {
                first = end + 1;
                continue;
            } else {
                break;
            }
        } while (true);
        facetPart = searchString.substring(start, end);
        if (end < len && searchString[end] === '"') {
            end++;
        }
        facetPart = facetPart.replace(/\\"/g, '"');
    } else {
        end = searchString.indexOf(" ", start);
        if (end < 0) {
            end = len;
        }
        facetPart = searchString.substring(start, end);
    }
    return { part: facet + facetPart, end };
}

function getPossiblyAnchoredRegex(tagValue: string): string {
    if (tagValue.startsWith("*") && tagValue.endsWith("*")) {
        return processRegExp(
            tagValue.substring(0, tagValue.length - 1).substring(1)
        );
    }
    if (tagValue.endsWith("*")) {
        const tagPrefix = tagValue.substring(0, tagValue.length - 1);
        return "^" + processRegExp(tagPrefix);
    }
    const tagSuffix = tagValue.substring(1);
    return processRegExp(tagSuffix) + "$";
}
