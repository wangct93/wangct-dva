const {getListByMap} = require("../utils/utils");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const {resolve,toAry} = require("wangct-server-util");
const config = require("./config");
const {babelOptions} = require("../utils/options");
const {isDevEnv} = require("../utils/utils");

module.exports = getRules();

function getRules(){
  return [
    getJsRule(),
    getAntdCssRule(),
    getCssRule(),
    getLessRule(),
    getFileRule(),
    ...toAry(config.extraRules),
  ]
}

function getJsRule(options = config){
  const subOptions = babelOptions;
  return {
    test: /\.(ts|js)x?$/i,
    use: [{
      loader: 'babel-loader',
      options: {
        presets: [...subOptions.presets,...toAry(options.extraBabelPresets)],
        plugins:[
          ...subOptions.plugins,
          ...getBabelPlugins(options),
          ...toAry(options.extraBabelPlugins),
        ],
      },
    }],
    exclude:/node_modules/,
  }
}

/**
 * 获取babel额外配置插件
 * @param options
 * @returns {*[]}
 */
function getBabelPlugins(options){
  const mapData = {
    typescript:['@babel/plugin-transform-typescript', {
      isTSX: true,
      allExtensions: true
    }],
    antdImport:['import', {
      libraryName: 'antd',
      libraryDirectory:'es',
      style: true,
    },'ant'],
  };
  return getListByMap(mapData,options);
}

/**
 * 获取文件规则
 * @param options
 * @returns {{test: RegExp, loader: string, options: {outputPath: string, limit: *, name: *, publicPath: string}}}
 */
function getFileRule(options = config){
  const paths = require('./paths');
  return {
    test: /\.(png|jpg|jpng|eot|ttf|temp)$/i,
    loader: 'url-loader',
    options:{
      limit:options.urlLoaderLimit,
      name:options.urlLoaderName,
      publicPath:paths.urlLoaderPublicPath,
      outputPath:paths.urlLoaderOutputPath,  //todo:不能输入系统盘开头地址
    },
  };
}

/**
 * antd样式加载
 * @returns {{include: *, test: RegExp, use: *}}
 */
function getAntdCssRule(options = config){
  const {modifyVars,antdModifyVars = modifyVars} = options;
  const cssLoaderUse = [
    'css-loader',
    {
      loader: 'less-loader',
      options: {
        javascriptEnabled: true,
        modifyVars:antdModifyVars,
      },
    },
  ];
  return {
    test: /\.(less|css)$/i,
    use: getCssUse(cssLoaderUse),
    include: resolve('node_modules/antd'),
  };
}

function getCssUse(cssUse){
  return isDevEnv() || !config.extractCss ? ['style-loader',...cssUse] : ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: cssUse
  });
}

/**
 * css样式（排除antd）
 * @returns {{test: RegExp, use: *, exclude: *}}
 */
function getCssRule(){
  return {
    test: /\.css$/i,
    use: getCssUse(['css-loader']),
    exclude: resolve('node_modules/antd'),
  };
}

/**
 * less样式
 * @returns {{test: RegExp, use: *, exclude: *}}
 */
function getLessRule(options = config){
  return {
    test: /\.less$/i,
    use: getCssUse([
      {
        loader: 'css-loader',
        options: {
          modules: true,
        }
      },
      {
        loader: 'less-loader',
        options: {
          javascriptEnabled: true,
          modifyVars:options.modifyVars,
        }
      },
    ]),
    exclude: resolve('node_modules/antd'),
  };
}