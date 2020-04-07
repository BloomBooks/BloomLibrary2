import React from "react";
import CategoryCard from "./CategoryCard";
import { CategoryCardGroup } from "./CategoryCardGroup";

const encodeUrl = require("encodeurl");

// Normally the publisher name matches the image name, but if not we change it here:
const nameToImageMap = new Map<string, string>([
    //  // something in our pipeline won't deliver an image that starts with "3"
    ["3Asafeer", "Asafeer"],
    ["Room To Read", "Room to Read"],
]);

export const PublisherGroup: React.FunctionComponent<{}> = (props) => {
    // enhance: once we get the Publisher field filled in, we can switch to getting a full list of publishers
    // and then us the following group
    const publishers = [
        "African Storybook",
        "3Asafeer",
        "Book Dash",
        "Little Zebra Books",
        "Pratham",
        "Room To Read",
    ];
    const cards = publishers.sort().map((publisher) => {
        const imageName = nameToImageMap.get(publisher) ?? publisher;
        return (
            <CategoryCard
                key={publisher}
                //preTitle={publisher}
                title={publisher}
                bookCount="??"
                filter={{
                    publisher,
                }}
                pageType={"project"}
                img={
                    "https://share.bloomlibrary.org/bookshelf-images/" +
                    encodeUrl(imageName) +
                    ".png"
                }
            />
        );
    });

    return (
        <CategoryCardGroup title="Publishers" {...props}>
            {cards}
        </CategoryCardGroup>
    );
};
