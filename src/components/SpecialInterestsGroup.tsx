import React from "react";
import { CategoryCardGroup } from "./CategoryCardGroup";
import CategoryCard from "./CategoryCard";

interface IProps {
    title: string;
}

export const SpecialInterestGroup: React.FunctionComponent<IProps> = props => {
    return (
        <CategoryCardGroup {...props}>
            <CategoryCard
                // TODO Andrew,
                // 1) I've added svgs to assets for these
                // 2) can we get these credits into the `title` attribute of the images
                // credits Created by dDara from the Noun Project
                key={"Health"}
                title={"COVID-19 & Health Books"}
                filter={{
                    topic: "Health"
                }}
                pageType={""}
                img={""}
            />
            <CategoryCard
                // credits Created by Andrew Doane from the Noun Project
                key={"Bible"}
                title={"Bible Books"}
                filter={{
                    bookshelf: "Bible"
                }}
                pageType={""}
                img={""}
            />
            <CategoryCard
                // CC0 from the Noun Project
                key={"STEM"}
                title={"STEM Books"}
                filter={{
                    topic: "Math"
                }}
                pageType={""}
                img={""}
            />
        </CategoryCardGroup>
    );
};
