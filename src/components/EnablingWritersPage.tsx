import React, { useContext } from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { LevelGroups } from "./LevelGroups";
import { ExternalLink } from "./banners/ExternalLink";
import { BookshelfGroup } from "./BookShelfGroup";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { CachedTablesContext } from "../App";
import { RowOfPageCards } from "./RowOfPageCards";

export const EnablingWritersPage: React.FunctionComponent = () => {
    const { collections } = useContext(CachedTablesContext);
    const filter = { bookshelf: "Enabling Writers Workshops" };
    const description = (
        <React.Fragment>
            <p>
                <ExternalLink href="https://www.globalreadingnetwork.net/publications-and-research/enabling-writers-workshop-program-guides-and-toolkits">
                    The Enabling Writers
                </ExternalLink>{" "}
                workshops (2016-2018) were sponsored by All Children Reading. In
                these workshops, teams of local writers were trained to produce
                hundreds of decodable and leveled books with content that
                reflect local children's culture and language.
            </p>
            <p>
                This initiative is an offshoot of a previous{" "}
                <ExternalLink href="https://allchildrenreading.org/competition/enabling-writers-prize/">
                    All Children Reading: A Grand Challenge for Development
                </ExternalLink>{" "}
                competition (2014-2015) to produce a book authoring software
                that can be used globally to develop books for use in early
                grade reading programs. The competition was supported by United
                States Agency for International Development, World Vision and
                the Australian government. This competition spurred us to add
                major new capabilities to Bloom, and we won the competition.
            </p>
        </React.Fragment>
    );
    const enablingWritersCollection = collections.get(
        "Enabling Writers Workshops"
    )!;
    return (
        <div>
            <PublisherBanner
                title="Enabling Writers Workshops"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/Enabling Writers Workshops.png`}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <RowOfPageCards
                    title="Sub-projects"
                    collection={enablingWritersCollection}
                    parents=""
                />
                <LevelGroups collection={enablingWritersCollection} />
            </ListOfBookGroups>
        </div>
    );
};
