const { defineConfig } = require('@vue/cli-service')
const { name } = require('./package.json')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/vue/',
  productionSourceMap: false,
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: "umd",
      // jsonpFunction: `webpackJsonp_${name}`,
    }
  },
  devServer: {
    hot: true,
    port: 3013,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
})
