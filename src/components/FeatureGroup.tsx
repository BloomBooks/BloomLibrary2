import React from "react";
import { featureSpecs } from "./FeatureHelper";
import { CategoryCardGroup } from "./CategoryCardGroup";

interface IProps {
    title: string;
}

export const FeatureGroup: React.FunctionComponent<IProps> = (props) => {
    // We don't necessarily want to display all features from featureSpecs or in that order,
    // so this array lets us customize which ones and in which order.
    const featureKeysToDisplayInOrder = [
        "talkingBook",
        "comic",
        "activity",
        "signLanguage",
        "blind",
        "motion",
    ];

    const featureSpecsFilteredAndOrdered = featureSpecs
        .filter((f) => featureKeysToDisplayInOrder.includes(f.featureKey))
        .sort((a, b) => {
            return (
                featureKeysToDisplayInOrder.indexOf(a.featureKey) -
                featureKeysToDisplayInOrder.indexOf(b.featureKey)
            );
        });

    const cards = featureSpecsFilteredAndOrdered.map((featureSpec) => {
        const featureKey = featureSpec.featureKey;

        return (
            <div>Needs to be reimplemented</div>
            // <CategoryCard
            //     key={featureKey}
            //     title={featureSpec.featureTitle}
            //     bookCount=""
            //     filter={featureSpec.filter}
            //     href={"feature/" + featureKey}
            //     icon={featureSpec.icon}
            //     iconScale={featureSpec.iconScale}
            //     img={""}
            // />
        );
    });

    return <CategoryCardGroup {...props}>{cards}</CategoryCardGroup>;
};
