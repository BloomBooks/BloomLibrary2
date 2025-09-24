import axios from "axios";
import type { AxiosStatic } from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import type { ILanguageRepository } from "../interfaces/ILanguageRepository";
import { ParseLanguageRepository } from "../implementations/parseserver/ParseLanguageRepository";
import { ParseConnection } from "../implementations/parseserver/ParseConnection";

vi.mock("axios");

const mockedAxios = (axios as unknown) as Mocked<AxiosStatic>;

describe("ParseLanguageRepository", () => {
    let repository: ILanguageRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        ParseConnection.reset();
        repository = new ParseLanguageRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
        ParseConnection.reset();
    });

    it("merges duplicates when cleaning language list", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        objectId: "en-1",
                        name: "English",
                        isoCode: "en",
                        usageCount: 5,
                    },
                    {
                        objectId: "en-2",
                        name: "English (Alt)",
                        isoCode: "en",
                        usageCount: 3,
                    },
                    {
                        objectId: "fr-1",
                        name: "Français",
                        englishName: "French",
                        isoCode: "fr",
                        usageCount: 2,
                    },
                ],
            },
        });

        const languages = await repository.getCleanedAndOrderedLanguageList();

        expect(languages).toHaveLength(2);
        expect(languages[0].isoCode).toBe("en");
        expect(languages[0].usageCount).toBe(8);
        expect(languages[1].isoCode).toBe("fr");
    });

    it("returns language info for a specific code", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        objectId: "sw-1",
                        name: "Kiswahili",
                        isoCode: "sw",
                        usageCount: 4,
                        bannerImageUrl: "banner.png",
                    },
                ],
            },
        });

        const info = await repository.getLanguageInfo("sw");

        expect(info).toHaveLength(1);
        expect(info[0].isoCode).toBe("sw");
        expect(info[0].bannerImageUrl).toBe("banner.png");
    });

    it("produces display names using legacy formatting", () => {
        const languages = [
            {
                objectId: "en-1",
                name: "English",
                englishName: "English",
                isoCode: "en",
                usageCount: 10,
            },
            {
                objectId: "fr-1",
                name: "Français",
                englishName: "French",
                isoCode: "fr",
                usageCount: 5,
            },
        ];

        const result = repository.getDisplayNamesFromLanguageCode(
            "fr",
            languages as any
        );

        expect(result?.primary).toBe("French");
        expect(result?.secondary).toContain("Français");
    });
});
