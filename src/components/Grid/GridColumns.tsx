// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, FunctionComponent } from "react";
import {
    Column as DevExpressColumn,
    TableFilterRow
} from "@devexpress/dx-react-grid";

import {
    Checkbox,
    Link,
    TableCell,
    Select,
    MenuItem,
    useTheme
} from "@material-ui/core";
import { Book } from "../../model/Book";
import { Router } from "../../Router";
import QueryString from "qs";
import titleCase from "title-case";
import { IFilter } from "../../IFilter";

export interface IGridColumn extends DevExpressColumn {
    moderatorOnly?: boolean;
    defaultVisible?: boolean;
    // A column definition specifies this if it needs a custom filter control
    getCustomFilterComponent?: FunctionComponent<TableFilterRow.CellProps>;
    // Whether the column uses a default (text box) filter or a custom filter control,
    // given a BloomLibrary filter, modify it to include the value the user has set while using this column's filter control
    addToFilter?: (filter: IFilter, value: string) => void;
}

const kTagsToFilterOutOfTagsList = ["bookshelf:", "system:Incoming"];
export function getBookGridColumns(router: Router): IGridColumn[] {
    // Note, the order here is also the default order in the table
    const columns = [
        {
            name: "title",
            title: "Title",
            defaultVisible: true,
            getCellValue: (b: Book) => (
                <Link
                    href={`/?bookId=${b.id}&pageType=book-detail&title=${b.title}`}
                    css={css`
                        color: black !important;
                    `}
                    target="_blank"
                >
                    {b.title}
                </Link>
            ),
            addToFilter: (filter: IFilter, value: string) => {
                // enhance: at the moment we don't have a "title:" search axis, so this will search other fields as well
                filter.search = value;
            }
        },
        {
            name: "languages",
            title: "Languages",
            defaultVisible: true,
            getCellValue: (b: Book) => b.languages.map(l => l.name).join(", "),
            addToFilter: (filter: IFilter, value: string) => {
                // enhance: at the moment we don't have a "language:" search axis, so this will search other fields as well
                filter.search = value;
            }
        },
        {
            name: "tags",
            title: "Other Tags",
            getCellValue: (b: Book) =>
                b.tags
                    .filter(
                        t =>
                            !kTagsToFilterOutOfTagsList.find(tagToFilterOut =>
                                t.startsWith(tagToFilterOut)
                            )
                    )
                    .join(", "),
            addToFilter: (filter: IFilter, value: string) => {
                filter.otherTags = value;
            }
        },
        {
            name: "bookshelves",
            title: "Bookshelves",
            defaultVisible: true,
            getCellValue: (b: Book) =>
                b.tags
                    .filter(t => t.startsWith("bookshelf:"))
                    .map(t => (
                        <GridSearchLink key={t} search={t}>
                            {t.replace(/bookshelf:/, "")}
                        </GridSearchLink>
                    )),
            addToFilter: (filter: IFilter, value: string) => {
                filter.bookshelf = value;
            }
        },
        {
            name: "incoming",
            moderatorOnly: true,
            defaultVisible: true,
            getCellValue: (b: Book) => (
                <TagCheckbox book={b} tag={"system:Incoming"} />
            )
        },
        {
            name: "topic",

            defaultVisible: true,

            getCellValue: (b: Book) =>
                b.tags
                    .filter(t => t.startsWith("topic:"))
                    .map(t => (
                        <GridSearchLink key={t} search={t}>
                            {t.replace(/topic:/, "")}
                        </GridSearchLink>
                    )),
            addToFilter: (filter: IFilter, value: string) => {
                filter.topic = titleCase(value);
            }
        },
        {
            name: "harvestState",
            addToFilter: (filter: IFilter, value: string) => {
                filter.search = `harvestState:${value}`;
            },
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => (
                <ChoicesFilterCell
                    choices={["", "Done", "Failed"]}
                    {...props}
                />
            )
        },
        { name: "license" },
        { name: "copyright" },
        { name: "pageCount" },
        { name: "createdAt" },
        {
            name: "uploader",
            defaultVisible: true,
            moderatorOnly: true,
            getCellValue: (b: Book) => (
                <GridSearchLink
                    key={b.id}
                    search={`uploader:${b.uploader?.username}`}
                >
                    {b.uploader?.username}
                </GridSearchLink>
            ),
            addToFilter: (filter: IFilter, value: string) => {
                filter.search = `uploader:${value}`;
            }
        }
    ];

    // generate the capitalized column names since the grid doesn't do that.
    return (
        columns
            //.sort((a, b) => a.name.localeCompare(b.name))
            .map(c => {
                const x = { ...c };
                if (c.title === undefined) {
                    x.title = titleCase(c.name);
                }
                return x;
            })
    );
}

export const GridSearchLink: React.FunctionComponent<{
    search: string;
}> = props => {
    const location = {
        title: props.search,
        pageType: "grid",
        filter: {
            search: props.search
        }
    };
    const url = "/grid/?" + QueryString.stringify(location);
    return (
        <Link
            css={css`
                color: black !important;
            `}
            href={url}
        >
            {props.children}
        </Link>
    );
};

const TagCheckbox: React.FunctionComponent<{
    book: Book;
    tag: string;
}> = props => {
    const [present, setPresent] = useState(props.book.tags.includes(props.tag));
    return (
        <Checkbox
            checked={present}
            onChange={e => {
                props.book.setBooleanTag(props.tag, e.target.checked);
                props.book.saveAdminDataToParse();
                setPresent(e.target.checked);
            }}
        />
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ChoicesFilterCell: React.FunctionComponent<TableFilterRow.CellProps & {
    choices: string[];
}> = props => {
    const theme = useTheme();
    return (
        <TableCell>
            {/* <Checkbox
            //value={props.filter ? props.filter.value : ""}
            checked={props.filter ? props.filter.value==="true" : false}
            onChange={e =>
                props.onFilter({
                    columnName: props.column.name,
                    operation: "contains",
                    value: e.target.value ? "true" : "false"
                })
            }
        /> */}
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                color="secondary" //<--- doesn't work
                value={props.filter?.value || ""}
                css={css`
                    font-size: 0.875rem !important;
                `}
                onChange={e =>
                    props.onFilter({
                        columnName: props.column.name,
                        operation: "contains",
                        value: e.target.value as string
                    })
                }
            >
                {props.choices.map(c => (
                    <MenuItem key={c} value={c}>
                        {c.length === 0 ? "All" : c}
                    </MenuItem>
                ))}
            </Select>
        </TableCell>
    );
};
