import { css } from "@emotion/react";

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

export const GridPage: React.FunctionComponent<{ filters: string }> = (
    props
) => {
    useSetBrowserTabTitle("Grid");
    let contextFilter: IFilter = {};
    if (props.filters && props.filters.startsWith(":search:")) {
        const search = props.filters.split("/")[0].substring(":search:".length);
        contextFilter = { search };
    }

    const l10n = useIntl();

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
};
