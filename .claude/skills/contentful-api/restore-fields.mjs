// node restore-fields.mjs <entryId> <backup.json>
// Puts an entry's fields back to the `fields` object in a backup saved from `cma.mjs page`
// (fields absent from the backup are removed). Leaves a draft; publish separately.
import { readFileSync } from "node:fs";
import { cma, status } from "./cma.mjs";

const [entryId, backupFile] = process.argv.slice(2);
const backup = JSON.parse(readFileSync(backupFile, "utf8").replace(/^﻿/, ""));
const entry = await cma("GET", `/entries/${entryId}`);
const e = await cma("PUT", `/entries/${entryId}`, { body: { fields: backup.fields }, version: entry.sys.version });
console.log(JSON.stringify({ id: e.sys.id, version: e.sys.version, status: status(e.sys) }));
