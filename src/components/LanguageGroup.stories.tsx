import { LanguageGroup } from "./LanguageGroup";

export default {
    title: "LanguageGroup",
    component: LanguageGroup,
};

// TODO: this doesn't ever come up with results, nor give an error in console. Running under chrome --disable-web-security didn't help.

export const Default = () => <LanguageGroup />;
