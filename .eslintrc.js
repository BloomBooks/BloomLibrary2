module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
        "no-var": "warn",
        "prefer-const": "warn",
        "no-bitwise": "warn",
        "no-warning-comments": [
            1,
            { terms: ["nocommit"], location: "anywhere" },
        ],
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off", //would prefer a "warn", but there are so many at the moment!
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/no-inferrable-types": "off", //would prefer a "warn", but there are so many at the moment!
        "no-case-declarations": "warn",
        "prefer-rest-params": "warn",
        "prefer-spread": "warn",
        "@typescript-eslint/ban-types": "warn", // TODO: fix these so we can turn back on?
    },
};

/* This was our tslint
{
    "extends": ["tslint:latest", "tslint-config-prettier"],
    "rules": {
        "curly": false,
        "no-submodule-imports": false,
        "no-empty": false,
        "no-implicit-dependencies": false,
        "ordered-imports": false,
        "object-literal-sort-keys": false,
        "no-var-requires": false,
        "no-console": false,
        "comment-format": false,
        "member-ordering": false,
        "no-string-literal": false,
        "no-unused-variable": {
            "severity": "warning"
        },
        "max-classes-per-file": {
            "severity": "warning"
        },
        "no-var-keyword": {
            "severity": "warning"
        }
    }
}
*/
