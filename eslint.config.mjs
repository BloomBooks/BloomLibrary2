import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    // { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
    // pluginReact.configs.flat.recommended,
    {
        rules: {
            "no-var": "warn",
            "prefer-const": "warn",
            "no-bitwise": "warn",
            "no-warning-comments": [
                1,
                { terms: ["nocommit"], location: "anywhere" },
            ],

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/ban-types": "off",
            " @typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-empty-object-type": "off",
        },
        ignores: ["node_modules", "public"],
    },
];
