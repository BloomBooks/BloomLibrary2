import React, { useContext } from "react";
import { css } from "emotion";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";
import { IFilter } from "../IFilter";
import * as ReactImage from "react-image";
import { BookCount } from "./BookCount";

interface IProps {
    title: string;
    bookCount?: string;
    filter: IFilter;
    pageType: string;
    img: string;
}

const CategoryCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    // some bookshelves have multiple levels, separated by "/". For now,
    // just use the last part.
    const parts = props.title.split("/");
    const title = parts[parts.length - 1];

    const titleElementIfNoImage = (
        <h2
            className={css`
                text-align: center;
                flex-grow: 1; // push the rest to the bottom5
            `}
        >
            {title}
        </h2>
    );

    return (
        <CheapCard
            className={css`
                width: 220px;
                padding: 10px;
            `}
            onClick={() => {
                //alert("click " + this.props.title);
                router!.push({
                    title: props.title,
                    pageType: props.pageType ? props.pageType : "category",
                    filter: props.filter
                });
            }}
        >
            {/* We want to show an image for the category if we have one */}
            <ReactImage
                src={props.img}
                className={css`
                    max-height: 129px;
                    max-width: 198px;
                    margin-left: auto;
                    margin-right: auto;
                `}
                // While we're waiting, show the text title
                loader={titleElementIfNoImage}
                // If we could not get an image, show the text title
                unloader={titleElementIfNoImage}
            />

            <div
                className={css`
                    margin-top: auto;
                    text-align: center;
                `}
            >
                <BookCount message={`{0} Books`} filter={props.filter} />
            </div>
        </CheapCard>
    );
};

export default CategoryCard;
