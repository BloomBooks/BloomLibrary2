// node diff-published.mjs <entryId>
// Reports whether an entry's draft fields equal its published fields, and which differ.
import { cma } from "./cma.mjs";

const id = process.argv[2];
const draft = await cma("GET", `/entries/${id}`);
const pub = (await cma("GET", `/public/entries?sys.id=${id}`)).items[0];
if (!pub) {
    console.log("never published");
} else {
    const keys = new Set([...Object.keys(draft.fields), ...Object.keys(pub.fields)]);
    const differ = [...keys].filter((k) => JSON.stringify(draft.fields[k]) !== JSON.stringify(pub.fields[k]));
    console.log(differ.length ? `fields differing from published: ${differ.join(", ")}` : "draft fields equal published");
}
