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
                key={"Health"}
                title={"COVID-19 & Health Books"}
                filter={{
                    topic: "Health"
                }}
                pageType={""}
                img={""}
            />
            <CategoryCard
                key={"Bible"}
                title={"Bible Books"}
                filter={{
                    bookshelf: "Bible"
                }}
                pageType={""}
                img={""}
            />
            <CategoryCard
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
