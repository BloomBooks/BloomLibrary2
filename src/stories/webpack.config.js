//https://github.com/johot/storybook4-cra2-typescript-react-docgen-typescript-demo/blob/master/.storybook/webpack.config.js
// Work around  "TypeScript error: Cannot compile namespaces when the '--isolatedModules' flag is provided.  TS1208"
// that you get when running `yarn start` with Create React App, when it sees this file that is used by storybook
export function dummy() {}
module.exports = (_baseConfig, _env, config) => {
    config.module.rules.push({
        test: /\.tsx?$/,
        use: [
            {
                loader: require.resolve("babel-loader"),
                options: {
                    presets: [require.resolve("babel-preset-react-app")]
                }
            },
            require.resolve("react-docgen-typescript-loader")
        ]
    });

    config.resolve.extensions.push(".ts", ".tsx");

    return config;
};
