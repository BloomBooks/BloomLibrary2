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

        //makes the exports of bloom-player-root.ts accessible via window.BloomPlayer.X,
        // e.g., window.BloomPlayer.BloomPlayerCore.
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
                include: harvesterArtifactUserControlDir,

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
            {
                // this allows things like background-image: url("myComponentsButton.svg") and have the resulting path look for the svg in the stylesheet's folder
                // the last few seem to be needed for (at least) slick-carousel to build.
                test: /\.(svg|jpg|png|ttf|eot|gif)$/,
                use: {
                    loader: "file-loader"
                }
            }
        ]
    }
};
