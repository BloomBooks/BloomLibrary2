// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { PublisherBanner } from "./PublisherBanner";
import { ExternalLink } from "./ExternalLink";
import { ListOfBookGroups } from "../ListOfBookGroups";
import { ByLanguageGroups } from "../ByLanguageGroups";
import { LevelGroups } from "../LevelGroups";

const imageBase = "https://share.bloomlibrary.org/bookshelf-images/";

export const GuatemalaMOEPage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Ministerio de Educación de Guatemala" };
    const description = (
        <div
            css={css`
                height: 250px;
                overflow-y: scroll;
            `}
        >
            <p>
                En esta estantería se encuentra una colección de libros y
                materiales de lectura, articulados con el Currículum Nacional
                Base, desarrollados por estudiantes, docentes, técnicos,
                escritores y población guatemalteca en general. El propósito es
                que estos materiales sean utilizados para fortalecer el hábito y
                las competencias de lectoescritura. Además, se dan a conocer los
                valores de las diferentes culturas que conviven en el país y se
                promueve la lectura y escritura en los idiomas nacionales. Más
                información del Ministerio de Educación en:
                <ExternalLink href="http://www.mineduc.gob.gt/portal/">
                    http://www.mineduc.gob.gt/portal/
                </ExternalLink>
            </p>
            <p>
                Esta estantería es posible gracias al apoyo del Pueblo de los
                Estados Unidos de América a través de la Agencia de los Estados
                Unidos de América para el Desarrollo Internacional (USAID, por
                sus siglas en inglés). El contenido de este material es
                responsabilidad exclusiva del Ministerio de Educación de
                Guatemala y el mismo no necesariamente refleja la perspectiva de
                USAID ni del Gobierno de los Estados Unidos de América.
            </p>
            <hr />
            <p>
                In this bookshelf, there is a collection of books and reading
                materials, aligned with the National Basic Curriculum, developed
                by students, teachers, technicians, writers, and Guatemalan
                people in general. The purpose of these materials is to
                strengthen reading habits and skills. In addition, the values of
                the different cultures that coexist in the country are made
                known and reading and writing in all of the nation’s languages
                are promoted. More information from the Ministry of Education
                at:
                <ExternalLink href="http://www.mineduc.gob.gt/portal/">
                    http://www.mineduc.gob.gt/portal/
                </ExternalLink>
            </p>
            <p>
                This bookshelf is made possible by the support of the American
                people through the United States Agency for International
                Development (USAID). The contents of this bookshelf are the sole
                responsibility of the Ministry of Education of Guatemala and do
                not necessarily reflect the views of USAID or the United States
                Government.
            </p>
        </div>
    );
    return (
        <div>
            <PublisherBanner
                title="Guatemala government logo"
                showTitle={false}
                filter={filter}
                logoUrl={`${imageBase}guatemala-moe-logo.svg`}
                collectionDescription={description}
            />

            <ListOfBookGroups>
                <ByLanguageGroups
                    titlePrefix=""
                    filter={filter}
                    excludeLanguages={["en"]}
                />
            </ListOfBookGroups>
        </div>
    );
};
