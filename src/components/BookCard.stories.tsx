import type { Meta, StoryObj } from "@storybook/react";
import { BookCard } from "./BookCard";

const meta: Meta<typeof BookCard> = {
    title: "BookCard",
    component: BookCard,
};

export default meta;
type Story = StoryObj<typeof BookCard>;

export const Simple: Story = {
    args: {
        laziness: "swiper",
        basicBookInfo: {
            title: "Grandpa Fish and the Radio",
            allTitles: "",
            objectId: "6rvW9OSAe9",
            baseUrl: "sampleUrl", // You might want to replace this with an actual URL or import it
            languages: [
                {
                    name: "English",
                    englishName: "English",
                    isoCode: "en",
                    usageCount: 3,
                    objectId: "englishnonsense",
                },
                {
                    name: "Francais",
                    englishName: "French",
                    isoCode: "fr",
                    usageCount: 3,
                    objectId: "frenchnonsense",
                },
                {
                    name: "Deutsch",
                    englishName: "German",
                    isoCode: "de",
                    usageCount: 3,
                    objectId: "Germannonsense",
                },
            ],
            tags: ["level:2"],
            features: [
                "motion",
                "talkingBook",
                "talkingBook:en",
                "talkingBook:fr",
                "blind",
                "blind:en",
                "activity",
            ],
            license: "",
            copyright: "",
            pageCount: "",
            createdAt: "",
            edition: "",
        },
    },
};
