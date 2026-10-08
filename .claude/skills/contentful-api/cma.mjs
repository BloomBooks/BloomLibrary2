// Minimal Contentful Management API (CMA) client for the bloomlibrary.org space.
// Reads the token from BLOOM_CONTENTFUL_CMA_WRITE_TOKEN; never takes it as an argument.
//
// CLI:
//   node cma.mjs page <urlKey>                       print a page entry's id, version, status, fields
//   node cma.mjs get-entry <entryId>                 print an entry as JSON
//   node cma.mjs set-field <entryId> <field> <file> [locale]   set a field from a file's text (default locale unless given); leaves a draft
//   node cma.mjs find-assets <text>                  list assets whose title/description/filename match
//   node cma.mjs upload-asset <fileOrUrl> <title> <description>   create, process and publish an asset; prints its id and url
//   node cma.mjs delete-asset <assetId>              unpublish and delete an asset (check nothing uses it first)
//   node cma.mjs publish-entry <entryId>             publish the entry's current version
//
// Or import { cma, defaultLocale, ... } from a script inside this folder.

import { readFileSync, existsSync } from "node:fs";
import { basename, extname } from "node:path";

export const SPACE = "72i7e2mqidxz";
export const ENV = "master";
const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const UPLOAD = `https://upload.contentful.com/spaces/${SPACE}`;

function token() {
    const t = process.env.BLOOM_CONTENTFUL_CMA_WRITE_TOKEN;
    if (!t) throw new Error("BLOOM_CONTENTFUL_CMA_WRITE_TOKEN is not set in this process (see SKILL.md, 'Token')");
    return t;
}

export async function cma(method, path, { body, version, raw, contentType } = {}) {
    const headers = { Authorization: `Bearer ${token()}` };
    if (version !== undefined) headers["X-Contentful-Version"] = String(version);
    if (body !== undefined) headers["Content-Type"] = contentType || "application/vnd.contentful.management.v1+json";
    const res = await fetch(path.startsWith("http") ? path : BASE + path, {
        method,
        headers,
        body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
    return text ? JSON.parse(text) : undefined;
}

let localeCache;
export async function defaultLocale() {
    if (!localeCache) {
        const locales = await cma("GET", "/locales");
        localeCache = locales.items.find((l) => l.default).code;
    }
    return localeCache;
}

export function status(sys) {
    if (!sys.publishedVersion) return "draft (never published)";
    if (sys.version > sys.publishedVersion + 1) return "changed since last publish";
    return "published";
}

export async function findPage(urlKey) {
    const r = await cma("GET", `/entries?content_type=page&fields.urlKey=${encodeURIComponent(urlKey)}`);
    if (r.items.length !== 1) throw new Error(`expected 1 page with urlKey=${urlKey}, found ${r.items.length}`);
    return r.items[0];
}

export async function setField(entryId, field, value, locale) {
    const loc = locale || (await defaultLocale());
    const entry = await cma("GET", `/entries/${entryId}`);
    entry.fields[field] = { ...(entry.fields[field] || {}), [loc]: value };
    return cma("PUT", `/entries/${entryId}`, { body: { fields: entry.fields }, version: entry.sys.version });
}

export async function publishEntry(entryId) {
    const entry = await cma("GET", `/entries/${entryId}`);
    return cma("PUT", `/entries/${entryId}/published`, { version: entry.sys.version });
}

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

export async function uploadAsset(fileOrUrl, title, description) {
    const loc = await defaultLocale();
    const fileName = basename(new URL(fileOrUrl, "file:///").pathname);
    const file = { contentType: MIME[extname(fileName).toLowerCase()] || "application/octet-stream", fileName };
    if (existsSync(fileOrUrl)) {
        const up = await cma("POST", `${UPLOAD}/uploads`, { body: readFileSync(fileOrUrl), raw: true, contentType: "application/octet-stream" });
        file.uploadFrom = { sys: { type: "Link", linkType: "Upload", id: up.sys.id } };
    } else {
        file.upload = fileOrUrl;
    }
    let asset = await cma("POST", "/assets", {
        body: { fields: { title: { [loc]: title }, description: { [loc]: description }, file: { [loc]: file } } },
    });
    await cma("PUT", `/assets/${asset.sys.id}/files/${loc}/process`, { version: asset.sys.version });
    for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        asset = await cma("GET", `/assets/${asset.sys.id}`);
        if (asset.fields.file[loc].url) break;
    }
    if (!asset.fields.file[loc].url) throw new Error(`asset ${asset.sys.id} did not finish processing`);
    asset = await cma("PUT", `/assets/${asset.sys.id}/published`, { version: asset.sys.version });
    return { id: asset.sys.id, url: "https:" + asset.fields.file[loc].url };
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd && basename(process.argv[1] || "") === "cma.mjs") {
    const out = (x) => console.log(JSON.stringify(x, null, 2));
    if (cmd === "page") {
        const p = await findPage(args[0]);
        out({ id: p.sys.id, version: p.sys.version, status: status(p.sys), fields: p.fields });
    } else if (cmd === "get-entry") out(await cma("GET", `/entries/${args[0]}`));
    else if (cmd === "set-field") {
        const e = await setField(args[0], args[1], readFileSync(args[2], "utf8"), args[3]);
        out({ id: e.sys.id, version: e.sys.version, status: status(e.sys) });
    } else if (cmd === "find-assets") {
        const loc = await defaultLocale();
        const r = await cma("GET", `/assets?query=${encodeURIComponent(args[0])}&limit=50`);
        out(r.items.map((a) => ({ id: a.sys.id, title: a.fields.title?.[loc], url: a.fields.file?.[loc]?.url, status: status(a.sys) })));
    } else if (cmd === "upload-asset") out(await uploadAsset(args[0], args[1], args[2]));
    else if (cmd === "delete-asset") {
        let a = await cma("GET", `/assets/${args[0]}`);
        if (a.sys.publishedVersion) a = await cma("DELETE", `/assets/${args[0]}/published`, { version: a.sys.version });
        await cma("DELETE", `/assets/${args[0]}`, { version: a.sys.version });
        out({ deleted: args[0] });
    }
    else if (cmd === "publish-entry") {
        const e = await publishEntry(args[0]);
        out({ id: e.sys.id, publishedVersion: e.sys.publishedVersion });
    } else throw new Error(`unknown command ${cmd}`);
}
