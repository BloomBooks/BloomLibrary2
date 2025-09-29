import axios from "axios";
import type { AxiosStatic } from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import type { ITagRepository } from "../interfaces/ITagRepository";
import { ParseTagRepository } from "../implementations/parseserver/ParseTagRepository";
import { ParseConnection } from "../implementations/parseserver/ParseConnection";

vi.mock("axios");

const mockedAxios = (axios as unknown) as Mocked<AxiosStatic>;

describe("ParseTagRepository", () => {
    let repository: ITagRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        ParseConnection.reset();
        repository = new ParseTagRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
        ParseConnection.reset();
    });

    it("fetches a tag by id", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        objectId: "tag-1",
                        name: "topic:science",
                        category: "topic",
                        createdAt: "2023-01-01T00:00:00Z",
                        updatedAt: "2023-02-01T00:00:00Z",
                    },
                ],
            },
        });

        const tag = await repository.getTag("tag-1");

        expect(tag?.objectId).toBe("tag-1");
        expect(tag?.name).toBe("topic:science");
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/tag"),
            expect.objectContaining({
                params: expect.objectContaining({
                    where: { objectId: "tag-1" },
                    limit: 1,
                }),
            })
        );
    });

    it("returns null when tag is not found", async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

        const tag = await repository.getTag("missing");

        expect(tag).toBeNull();
    });

    it("queries tags with pagination and filter", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    { objectId: "1", name: "topic:science" },
                    { objectId: "2", name: "topic:math" },
                ],
                count: 5,
            },
        });

        const result = await repository.getTags({
            pagination: { limit: 2, skip: 0 },
            filter: { category: "topic" },
            orderBy: "name",
        });

        expect(result.items).toHaveLength(2);
        expect(result.totalCount).toBe(5);
        expect(result.hasMore).toBe(true);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/tag"),
            expect.objectContaining({
                params: expect.objectContaining({
                    limit: 2,
                    skip: 0,
                    where: { category: "topic" },
                    order: "name",
                }),
            })
        );
    });

    it("fetches tag list sorted by name", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    { objectId: "1", name: "Animals" },
                    { objectId: "2", name: "Science" },
                ],
            },
        });

        const tags = await repository.getTagList();

        expect(tags).toEqual(["Animals", "Science"]);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/tag"),
            expect.objectContaining({
                params: expect.objectContaining({
                    order: "name",
                    keys: "name",
                }),
            })
        );
    });

    it("fetches topic list with regex filter", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    { objectId: "1", name: "topic:science" },
                    { objectId: "2", name: "topic:math" },
                ],
            },
        });

        const topics = await repository.getTopicList();

        expect(topics).toHaveLength(2);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/tag"),
            expect.objectContaining({
                params: expect.objectContaining({
                    where: {
                        name: { $regex: "^topic:", $options: "i" },
                    },
                }),
            })
        );
    });

    it("validates tag formats", () => {
        expect(repository.validateTag("topic:science")).toBe(true);
        expect(repository.validateTag("system:admin")).toBe(true);
        expect(repository.validateTag("invalid tag")).toBe(false);
        expect(repository.validateTag("")).toBe(false);
    });

    it("processes tags by trimming, validating, and deduplicating", () => {
        const processed = repository.processTagsForBook([
            " topic:science ",
            "topic:science",
            "",
            "invalid tag",
            "system:admin",
        ]);

        expect(processed).toEqual(["topic:science", "system:admin"]);
    });
});
