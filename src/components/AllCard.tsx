import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { MoreOrAllCard } from "./MoreCard";

export const AllCard: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    return (
        <MoreOrAllCard
            collection={props.collection}
            href={`/${[props.collection.urlKey]}/:all:true`}
        />
    );
};
