const path = require("path");
const node_modules = path.resolve(__dirname, "node_modules");
const harvesterArtifactUserControlDir = path.resolve(
    __dirname,
    "src/components/HarvesterArtifactUserControl"
);

module.exports = {
    // mode must be set to either "production" or "development" in webpack 4.
    // Webpack-common is intended to be 'required' by something that provides that.
    context: __dirname,
    entry: {
        index:
            "./src/components/HarvesterArtifactUserControl/HarvesterArtifactUserControl.tsx"
    },

    output: {
        path: path.join(__dirname, "build"),
        filename: "HarvesterArtifactUserControlBundle.js",
        libraryTarget: "window",

        //makes the exports of bloom-player-root.ts accessible via window.NextBloomLibrary.X,
        // e.g., window.NextBloomLibrary.connectHarvestArtifactUserControl().
        library: "NextBloomLibrary"
    },

    resolve: {
        modules: [".", node_modules],
        extensions: [".js", ".jsx", ".ts", ".tsx"]
    },

    optimization: {
        minimize: false,
        namedModules: true,
        splitChunks: {
            cacheGroups: {
                default: false
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,

                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false, jsx: "react" }
                        }
                    }
                ]
            },
            {
                test: /\.less$/i,
                use: [
                    {
                        loader: "style-loader" // creates style nodes from JS strings,
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "less-loader" // compiles Less to CSS
                    }
                ]
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            // WOFF Font--needed?
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: "application/font-woff"
                    }
                }
            },
            { test: /\.(png|svg)$/, use: { loader: "url-loader" } }
        ]
    }
};
