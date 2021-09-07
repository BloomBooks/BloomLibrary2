/*
For more information, see readme-l10.md
*/

import crowdin, { SourceFilesModel } from "@crowdin/crowdin-api-client";
import download from "download";
import tempDirectory from "temp-dir";
import decompress from "decompress";
import * as Path from "path";
import * as fs from "fs-extra";

const Retry = require("async-retry");

const kTargetDirectory = "./public/translations";

const crowdinApiToken: string = process.env.bloomCrowdinApiToken || "";
const kCrowdinProjectId = 261564;

async function requestAndWaitForCrowdinBuild(): Promise<number | undefined> {
    const crowdinAccess = new crowdin({
        token: crowdinApiToken,
    });

    try {
        console.log("Requesting a crowdin build...");
        const buildRequestResult = await crowdinAccess.translationsApi.buildProject(
            kCrowdinProjectId,
            {
                // NOTE: there is a problem with these... they may be ignored: https://github.com/crowdin/crowdin-api-client-js/issues/85
                exportApprovedOnly: true,
                skipUntranslatedStrings: true,
                // ENHANCE use this?: branchId
            }
        );
        console.log(JSON.stringify(buildRequestResult, null, 4));

        // The way this api works is, normally it just finds a build on their server and tells you it's there.
        // But sometimes it will have to go prepare the build for around a minute. In that case, you have to
        // keep checking until it is done. Here we check every 5 seconds for up to 10 minutes.
        const buildId = await Retry(
            async (bail: any) => {
                console.log("Checking build status...");
                const statusResult = await crowdinAccess.translationsApi.checkBuildStatus(
                    kCrowdinProjectId,
                    buildRequestResult.data.id
                );
                if (statusResult.data.status === "finished")
                    // we don't actually need a result, but that is how this async-retry knows to stop retrying
                    return statusResult.data.id;

                if (["canceled", "failed"].includes(statusResult.data.status)) {
                    bail(
                        new Error(`Build failed (${statusResult.data.status})`)
                    );
                }
                // otherwise, we'll retry.
                console.log(`${statusResult.data.progress} %`);
                throw new Error("not really an error, but need to retry");
            },
            {
                retries: 60,
                minTimeout: 5 * 1000,
            }
        );
        return buildId;
    } catch (err) {
        console.error(
            "error getting crowdin to start a new build: " +
                JSON.stringify(err, null, 4)
        );
        return undefined;
    }
}

// Given the id of a known crowdin build that is available, we can download and unzip it into place.
async function downloadAndUnpackCrowdinBuild(crowdinBuildId: number) {
    const crowdinAccess = new crowdin({
        token: crowdinApiToken,
    });
    try {
        const buildInfo = await crowdinAccess.translationsApi.downloadTranslations(
            kCrowdinProjectId,
            crowdinBuildId
        );
        console.log("buildInfo:");
        console.log(JSON.stringify(buildInfo, null, 4));
        if (!buildInfo.data.url) {
            console.error(
                `Error: The Crowdin Build did not give a url. Is the build finished?`
            );
            return;
        }
        const url = buildInfo.data.url;
        console.log("downloading from " + url);
        await download(url, tempDirectory);
        console.log("download complete");

        await decompress(
            Path.join(tempDirectory, "SIL-Bloom.zip"),
            kTargetDirectory,
            {
                filter: (f) => {
                    return f.path.indexOf("BloomLibrary.org") > -1;
                },
            }
        );
        console.log(`Decompressed to ${kTargetDirectory}`);
    } catch (err) {
        console.error("error: " + JSON.stringify(err, null, 4));
    }
}

async function updateCrowdinFile(
    fileList: SourceFilesModel.File[],
    path: string
) {
    const filename = Path.basename(path);
    const fileId = getCrowdinFileId(fileList, filename);
    const json = fs.readFileSync(path);
    if (json.indexOf("message") === -1) {
        throw Error(`Failed json sanity check: no "message" in ${path}`);
    }
    const crowdinAccess = new crowdin({
        token: crowdinApiToken,
    });

    // Crowdin requires that you first upload to a new storage object, and then
    // make a second call to replace the existing file with that storage object.
    crowdinAccess.uploadStorageApi
        .addStorage(filename, json)
        .then((response) => {
            console.log(`Uploaded "${filename}"`);
            crowdinAccess.sourceFilesApi
                .updateOrRestoreFile(kCrowdinProjectId, fileId, {
                    storageId: response.data.id,
                })
                .then((updateResponse) =>
                    console.log(`Update complete for "${filename}"`)
                )
                .catch((error) => {
                    console.error(error);
                    throw error;
                });
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
}

async function getListOfFilesOnCrowdin(): Promise<SourceFilesModel.File[]> {
    const crowdinAccess = new crowdin({
        token: crowdinApiToken,
    });
    console.log(`Getting file ids from...`);
    const result = await crowdinAccess.sourceFilesApi.listProjectFiles(
        kCrowdinProjectId,
        {}
    );
    return result.data.map((record) => record.data);
}

function getCrowdinFileId(
    fileList: SourceFilesModel.File[],
    filename: string
): number {
    for (const file of fileList) {
        //console.log(file.name);
        if (file.name === filename) return file.id;
    }

    throw Error(`Could not find ${filename} on Crowdin.`);
}

/**
 * Remove directory recursively
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function deleteDirectory(directory: string) {
    if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach((entry) => {
            const entryPath = Path.join(directory, entry);
            if (fs.lstatSync(entryPath).isDirectory()) {
                deleteDirectory(entryPath);
            } else {
                fs.unlinkSync(entryPath);
            }
        });
        fs.rmdirSync(directory);
    }
}

async function go() {
    const options = [process.argv[2], process.argv[3]];
    if (options.includes("upload")) {
        // NB: we haven't implemented using crowdin branches yet, but I *think* the copy of "Code Strings.json" in each branch will have a unique id
        const fileList = await getListOfFilesOnCrowdin();
        for (const filename of fileList.filter(
            (f) =>
                f.name.toLocaleLowerCase().indexOf("contentful") < 0 &&
                f.name.toLocaleLowerCase().indexOf(".csv") < 0 &&
                f.path.indexOf("BloomLibrary.org") > -1
        )) {
            updateCrowdinFile(
                fileList,
                "src/localization/" + Path.basename(filename.path)
            );
        }
    }
    if (options.includes("download")) {
        if (fs.pathExistsSync(kTargetDirectory))
            deleteDirectory(kTargetDirectory);
        const buildId = await requestAndWaitForCrowdinBuild();
        console.log("build id: " + buildId);
        if (buildId) {
            downloadAndUnpackCrowdinBuild(buildId);
        }

        // write out a list of files for code to use
        const fileList = await getListOfFilesOnCrowdin();
        fs.writeFileSync(
            "./src/localization/crowdin-file-names.json",
            "[" +
                fileList
                    .filter((f) => f.directoryId === 90)
                    .filter((f) => f.name !== "Bloom Library Strings.csv") //deprecated
                    .map((f) => `"${f.name}"`)
                    .join(",") +
                "]"
        );
    }
}

go();

// this is bogus but it makes TS decide that we are module and thus are allowed to use "import()"
export default go;
