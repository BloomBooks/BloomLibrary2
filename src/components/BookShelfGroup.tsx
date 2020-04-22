import React, { useContext } from "react";
import { useGetBookshelvesByCategory } from "../connection/LibraryQueryHooks";
import CategoryCard from "./CategoryCard";
import { Bookshelf } from "../model/Bookshelf";
import { CachedTablesContext } from "../App";
import { CategoryCardGroup } from "./CategoryCardGroup";

const encodeUrl = require("encodeurl");
interface IProps {
    title: string;
    bookShelfCategory: string; // project, org, publisher, custom
    // The part of the bookshelf "path" leading up to the current page. E.g. "Enabling Writers Workshops/"
    pathToTheCurrentLevel?: string;
    excludeTheseChildBookshelves?: string[];
}
/* This lets us show bookshelves. Not the books in them, but the list of shelves, themselves.
    It's not obvious that we want/need the current system with bookshelves which live in the database.
    On the one hand, we may find we need to do code work anyhow to do a good job of presenting a shelf,
    so why not just locate it in the code.

    On the other hand, we will eventually need to support user-generated shelves. We may also eventually
    need to support alternate book library sites, and those would be even more driven by database
    instead of code.

    So for the moment, I'm just leaving things as they are. We can query for all bookshelves, but the
    home page will also choose to feature Enabling writers, from code. So it's a mix of approaches
    for now.
*/

// Normally the bookshelf name matches the image name, but if not we change it here:
const nameToImageMap = new Map<string, string>([
    //  // something in our pipeline won't deliver an image that starts with "3"
    ["3Asafeer", "Asafeer"],
    ["Room To Read", "Room to Read"],
    ["Ministerio de Educación de Guatemala", "guatemala-moe-logo.svg"],
    ["Resources for the Blind, Inc. (Philippines)", "Resources for the Blind"],
]);

export const BookshelfGroup: React.FunctionComponent<IProps> = (props) => {
    // At this point there are so few bookshelves that we just retrieve the whole list and then filter here.
    // Might be a good thing to cache.
    const bookshelfResults = useGetBookshelvesByCategory(
        props.bookShelfCategory
    );

    // Bookshelves are hierarchical, and use slashes to convey the full path.
    // We only display one level at a time. At each level, we want to show cards
    // for all the "children" of the current level.
    // E.g. if we are at art/ we might have [art/painting/impressionists, art/painting/cubists, art/sculpture].
    // From that we need to determine that on this level, we should be showing [painting, sculpture].

    let bookshelfPathsAtThisLevel = props.pathToTheCurrentLevel
        ? bookshelfResults.filter((b) =>
              b.key.startsWith(props.pathToTheCurrentLevel!)
          )
        : bookshelfResults;
    if (props.excludeTheseChildBookshelves) {
        bookshelfPathsAtThisLevel = bookshelfPathsAtThisLevel.filter(
            (b) =>
                !props.excludeTheseChildBookshelves?.some(
                    (ex) => b.key.indexOf(ex) > -1
                )
        );
    }

    const prefix: string = props.pathToTheCurrentLevel || "";
    const allNamesAtThisLevel = bookshelfPathsAtThisLevel
        .map((b) => b.key.replace(prefix, ""))
        .map((name) => {
            const i = name.indexOf("/");
            return i < 0 ? name : name.substr(0, i);
        });

    const uniqueNamesAtThisLevel = [
        ...Array.from(new Set(allNamesAtThisLevel)),
    ];

    const { bookshelves } = useContext(CachedTablesContext);

    const cards =
        bookshelfResults &&
        uniqueNamesAtThisLevel.sort().map((nextLevel: string) => {
            let imageName = nameToImageMap.get(nextLevel) ?? nextLevel;
            // there is (was?) a convention of naming the shelf image after the shelf, with png
            if (imageName.indexOf(".") < 0) imageName += ".png";
            // note, this will often be the *start* of an actual bookshelf path, e.g. "Enabling Writers Workshops/"
            const fullBookshelfKey =
                (props.pathToTheCurrentLevel || "") + nextLevel;
            const bookshelf = Bookshelf.parseBookshelfKey(
                fullBookshelfKey,
                bookshelves
            );
            return (
                <CategoryCard
                    key={fullBookshelfKey}
                    preTitle={bookshelf.countryDisplayName}
                    title={bookshelf.displayName || ""}
                    bookCount="??"
                    filter={{
                        bookshelf: fullBookshelfKey,
                    }}
                    pageType={props.bookShelfCategory}
                    img={
                        "https://share.bloomlibrary.org/bookshelf-images/" +
                        imageName
                    }
                />
            );
        });

    return <CategoryCardGroup {...props}>{cards}</CategoryCardGroup>;
};
