// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

import { Breadcrumbs } from "../Breadcrumbs";
import { GridControl } from "./GridControl";
import { IFilter } from "../../IFilter";
import { useSetBrowserTabTitle } from "../Routes";
import Button from "@material-ui/core/Button";
import { useIntl } from "react-intl";
import DownloadCsvIcon from "../../export/download-csv.svg";
import {
    setGridExportFilter,
    setGridExportColumnInfo,
    getAllGridDataAndExportCsv,
} from "./GridExport";
import { observer } from "mobx-react-lite";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";

// we need the observer in order to get the logged in user, which may not be immediately available
// we require the user to be logged in to see this grid.
export const GridPage: React.FunctionComponent<{ filters: string }> = observer(
    (props) => {
        useSetBrowserTabTitle("Grid");
        let contextFilter: IFilter = {};
        if (props.filters && props.filters.startsWith(":search:")) {
            const search = props.filters
                .split("/")[0]
                .substring(":search:".length);
            contextFilter = { search };
        }

        const l10n = useIntl();

        const user = useGetLoggedInUser();
        if (!user) {
            return <div>You must log in to see this page.</div>;
        }
        return (
            <div>
                <div
                    css={css`
                        margin-top: 5px;
                        margin-left: 22px;
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <Breadcrumbs />
                </div>
                <GridControl
                    contextFilter={contextFilter}
                    setCurrentFilter={setGridExportFilter}
                    setExportData={setGridExportColumnInfo}
                />
                <div
                    css={css`
                        display: flex;
                    `}
                >
                    <Button onClick={() => getAllGridDataAndExportCsv()}>
                        <img
                            alt={l10n.formatMessage({
                                id: "stats.download.csvIcon",
                                defaultMessage: "download CSV",
                            })}
                            src={DownloadCsvIcon}
                        />
                    </Button>
                </div>
            </div>
        );
    }
);
