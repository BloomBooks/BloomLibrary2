import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        ...pluginReact.configs.flat.recommended,
    },
    // { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
    {
        plugins: {
            react: pluginReact,
            "react-hooks": pluginReactHooks,
        },
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
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/reportUnusedDisableDirectives": "off",
            "react/react-in-jsx-scope": "off",
            "react/display-name": "off",
            "react/no-unescaped-entities": "off",
            "react/no-unknown-property": ["error", { ignore: ["css"] }],
            ...pluginReactHooks.configs.recommended.rules,
        },
        ignores: ["node_modules", "public"],

        // We need this until/if we get all the rules sorted out after switching to vite
        linterOptions: { reportUnusedDisableDirectives: "off" },

        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
