export default [
    {
        plugins: ["@typescript-eslint"],
        extends: [
            // "eslint:recommended",
            // "plugin:@typescript-eslint/recommended",
        ],
        rules: {
            "no-var": "warn",
            "prefer-const": "warn",
            "no-bitwise": "warn",
            "no-warning-comments": [
                1,
                { terms: ["nocommit"], location: "anywhere" },
            ],
        },
        ignore: {
            files: ["node_modules", "public"],
        },
    },
];

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
