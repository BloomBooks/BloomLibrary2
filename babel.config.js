/* this is for jest */

module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react"],
        ["@babel/preset-typescript", { allowDeclareFields: true }],
    ],
};
