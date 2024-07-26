import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const langtags = JSON.parse(
    fs.readFileSync(path.join(__dirname, "langtags.json"), "utf8")
);

const reduced_langtags = langtags
    .filter(
        (langtag) => !!langtag.full
        // I'm not convinced that the following three lines are a good idea.
        // && !(/^[a-z]{2,3}-[A-Z]{2}$/.test(langtag.tag))
        // && !(/^[a-z]{2,3}-[A-Z][a-z]{3}$/.test(langtag.tag))
        // && !(/^[a-z]{2,3}-[A-Z][a-z]{3}-[A-Z]{2}$/.test(langtag.tag))
    )
    .map((langtag) => {
        const reduced = {
            tag: langtag.tag,
            name: langtag.name,
            names: langtag.names,
            region: langtag.region,
            regionname: langtag.regionname,
            // we aren't using these fields currently
            //regions: langtag.regions,
            //iso639_3: langtag.iso639_3 && langtag.iso639_3 !== langtag.tag ? langtag.iso639_3 : undefined,
        };
        return reduced;
    });

fs.writeFileSync(
    path.join(__dirname, "reduced-langtags.json"),
    JSON.stringify(reduced_langtags, null, 2),
    "utf8"
);
