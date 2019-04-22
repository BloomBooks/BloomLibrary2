import React from "react";
import { BookGroup } from "./BookGroup";
import { css } from "emotion";
import { PublisherBanner } from "./PublisherBanner";
import { IFilter } from "../Router";
import { BookCount } from "./BookCount";
import { useTopicList } from "./useQueryBlorg";
import { BannerContents, LanguageBanner } from "./Banners";

export const CategoryPage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => (
    <>
        <BannerContents
            title={props.title}
            about="some about"
            bookCountMessage="{0}  books"
            filter={props.filter}
        />
        <ul>
            <BookGroup title={`All books`} filter={props.filter} />
        </ul>
    </>
);

export const LanguagePage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => (
    <>
        <LanguageBanner filter={props.filter} title={props.title} />
        <ul>
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
            <BookGroupForEachTopic filter={props.filter} />
            <BookGroup
                title={`All ${props.filter.language} books.`}
                filter={props.filter}
            />
        </ul>
    </>
);
export const BookGroupForEachTopic: React.FunctionComponent<{
    filter: IFilter;
}> = props => {
    const { response, loading, error, reFetch } = useTopicList();
    if (response) {
        console.log(response);
        return (
            <>
                {response.data["results"].map((tag: any) => {
                    if (tag.name.split(":")[0] === "topic") {
                        const topic = tag.name.split(":")[1];
                        return (
                            <BookGroup
                                title={`${topic} books`}
                                filter={{
                                    ...props.filter,
                                    ...{ topic: topic }
                                }}
                            />
                        );
                    } else return <></>;
                })}
            </>
        );
    } else return <>"waiting for topics"</>;
};

const blackOnWhite = css`
    background-color: white;
    height: 100%;
    & h1 {
        color: black;
    }
    padding-left: 20px;
    padding-top: 20px;
`;

// export const AfricaStoryBookPage: React.FunctionComponent = () => {
//     return (
//         <div className={blackOnWhite}>
//             <PublisherBanner logoUrl="https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/African_Storybook_logo_blue.png/150px-African_Storybook_logo_blue.png" />
//             <ul>
//                 <BookGroup
//                     title="African Storybook Project Books in Bloom Format"
//                     filter={{ otherTags: "bookshelf:African Storybook" }}
//                 />
//             </ul>
//         </div>
//     );
// };
// export const BookDashPage: React.FunctionComponent = () => {
//     return (
//         <div className={blackOnWhite}>
//             <PublisherBanner logoUrl="https://allchildrenreading.org/wordpress/wp-content/uploads/2017/04/book-dash-logo-full-colour_full-transparency-300x149.png" />
//             <ul>
//                 <BookGroup
//                     title="Book Dash Books in Bloom Format"
//                     filter={{ otherTags: "bookshelf:Book Dash" }}
//                 />
//             </ul>
//         </div>
//     );
// };

// export const PrathamPage: React.FunctionComponent = () => {
//     return (
//         <div className={blackOnWhite}>
//             <PublisherBanner logoUrl="https://prathambooks.org/wp-content/uploads/2018/04/Logo-black.png" />
//             <ul>
//                 <BookGroup
//                     title="Pratham Level 1 Books"
//                     filter={{ otherTags: "bookshelf:Pratham" }}
//                 />
//                 <BookGroup
//                     title="Pratham Level 2 Books"
//                     filter={{ otherTags: "bookshelf:Pratham" }}
//                 />
//                 <BookGroup
//                     title="Pratham Level 3 Books"
//                     filter={{ otherTags: "bookshelf:Pratham" }}
//                 />
//             </ul>
//         </div>
//     );
// };
