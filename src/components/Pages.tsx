import React, { Component } from "react";
import { BookGroup } from "./BookGroup";
import CategoryGroup from "./CategoryGroup";
import { css, cx } from "emotion";
import { PublisherBanner } from "./PublisherBanner";
import { IFilter } from "../Router";
import { BookCount } from "./BookCount";

interface IProps {
    filter: IFilter;
}
export const LanguagePage: React.FunctionComponent<IProps> = props => (
    <>
        <BookCount filter={props.filter} />
        <ul style={{ backgroundColor: "purple" }}>
            <BookGroup
                title={`Featured ${props.filter.language} books.`}
                filter={{
                    ...props.filter,
                    ...{ otherTags: "bookshelf:Featured" }
                }}
            />
            <BookGroup
                title="Most Recent"
                filter={props.filter}
                order={"-createdAt"}
            />
            <BookGroup
                title={`All ${props.filter.language} books.`}
                filter={props.filter}
            />
        </ul>
    </>
);
export const CategoryPage: React.FunctionComponent = () => (
    <ul style={{ backgroundColor: "grey" }}>
        <BookGroup
            title="Books in this category"
            filter={{ otherTags: "bookshelf:Featured" }}
        />
        <CategoryGroup title="Some kind of subcategory" />
    </ul>
);
const blackOnWhite = css`
    background-color: white;
    height: 100%;
    & h1 {
        color: black;
    }
    padding-left: 20px;
    padding-top: 20px;
`;

export const AfricaStoryBookPage: React.FunctionComponent = () => {
    return (
        <div className={blackOnWhite}>
            <PublisherBanner logoUrl="https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/African_Storybook_logo_blue.png/150px-African_Storybook_logo_blue.png" />
            <ul>
                <BookGroup
                    title="African Storybook Project Books in Bloom Format"
                    filter={{ otherTags: "bookshelf:African Storybook" }}
                />
            </ul>
        </div>
    );
};
export const BookDashPage: React.FunctionComponent = () => {
    return (
        <div className={blackOnWhite}>
            <PublisherBanner logoUrl="https://allchildrenreading.org/wordpress/wp-content/uploads/2017/04/book-dash-logo-full-colour_full-transparency-300x149.png" />
            <ul>
                <BookGroup
                    title="Book Dash Books in Bloom Format"
                    filter={{ otherTags: "bookshelf:Book Dash" }}
                />
            </ul>
        </div>
    );
};

export const PrathamPage: React.FunctionComponent = () => {
    return (
        <div className={blackOnWhite}>
            <PublisherBanner logoUrl="https://prathambooks.org/wp-content/uploads/2018/04/Logo-black.png" />
            <ul>
                <BookGroup
                    title="Pratham Level 1 Books"
                    filter={{ otherTags: "bookshelf:Pratham" }}
                />
                <BookGroup
                    title="Pratham Level 2 Books"
                    filter={{ otherTags: "bookshelf:Pratham" }}
                />
                <BookGroup
                    title="Pratham Level 3 Books"
                    filter={{ otherTags: "bookshelf:Pratham" }}
                />
            </ul>
        </div>
    );
};
