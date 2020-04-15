import React from "react";
import { CategoryCardGroup } from "./CategoryCardGroup";
import CategoryCard from "./CategoryCard";
import { ReactComponent as COVID19Icon } from "../assets/COVID-19.svg";
import { ReactComponent as BibleIcon } from "../assets/Bible.svg";
import { ReactComponent as STEMIcon } from "../assets/STEM.svg";

interface IProps {
    title: string;
}

export const SpecialInterestGroup: React.FunctionComponent<IProps> = (
    props
) => {
    return (
        <CategoryCardGroup {...props}>
            <CategoryCard
                key={"COVID-19"}
                title={"COVID-19 Books"}
                filter={{
                    bookshelf: "COVID-19",
                }}
                pageType={"Covid19"}
                img={""}
                icon={(p) => (
                    <COVID19Icon
                        {...p}
                        title={"Created by dDara from the Noun Project"}
                    ></COVID19Icon>
                )}
                iconScale={130}
            />
            <CategoryCard
                key={"Bible"}
                title={"Bible Books"}
                filter={{
                    bookshelf: "Bible",
                }}
                pageType={""}
                img={""}
                icon={(p) => (
                    <BibleIcon
                        {...p}
                        title={"Created by Andrew Doane from the Noun Project"}
                    ></BibleIcon>
                )}
                iconScale={130}
            />
            <CategoryCard
                key={"STEM"}
                title={"STEM Books"}
                filter={{
                    topic: "Math", //TODO:,Science,Environment", but I haven't taken the time to figure out that query
                }}
                pageType={""}
                img={""}
                icon={(p) => (
                    <STEMIcon
                        {...p}
                        title={"CC0 from the Noun Project"}
                        fill={"none"}
                    ></STEMIcon>
                )}
                iconScale={130}
            />
        </CategoryCardGroup>
    );
};
