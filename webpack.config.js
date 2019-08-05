const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
	entry: "./src/js/index.js",
	devServer: {
		contentBase: "./src",
		port: 9100
	},
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ["babel-loader"]
			}
		]
	},
	node: {
		__dirname: false
	},
	output: {
		path: path.resolve(__dirname, "build"),
		publicPath: "/",
		filename: "bundle.js"
	},
	resolve: {
		extensions: ["*", ".js", ".jsx"]
	},
	plugins: [
		new CopyWebpackPlugin([
			{
				from: "src/index.html",
				to: "index.html"
			},
			{
				from: "src/api",
				to: "api"
			},
			{
				from: "src/images",
				to: "images"
			},
			{
				from: "src/lib",
				to: "lib"
			}
		])
	]
};
