const fs = require('fs');
const path = require('path');
const { MakeDirsSync } = require('./makeFolderPath');
const getTextDirList = () => {
  const dirPath = path.join(__dirname, '../public/text');
  if (!fs.existsSync(dirPath)) MakeDirsSync(dirPath);
  let dirs = fs.readdirSync(dirPath);
  return dirs
    .map((item) => {
      return {
        name: item.replace('.json', ''),
        relativePath: path.join('/public/text', item),
        isFile: fs.statSync(path.join(dirPath, item)).isFile()
      };
    })
    .filter((item) => item.isFile)
    .reverse();
};

/**
 * 传入相对路径或者文件日期
 * @param {*} name
 */
const getTextDetail = (name = '') => {
  const tmpPath = path.join(__dirname, '../', name);
  // console.log(tmpPath);
  if (fs.existsSync(tmpPath)) {
    // 如果相对路径内容存在，则返回相对路径内容
    let data = [];
    try {
      data = JSON.parse(fs.readFileSync(tmpPath));
    } catch (error) {
      console.log(error);
      data = [];
    }
    return data;
  }
  const filePath = path.join(__dirname, '../public/text', name + '.json');
  if (fs.existsSync(filePath)) {
    let data = [];
    try {
      data = JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
      console.log(error);
      data = [];
    }
    return data;
  }
  return [];
};

module.exports = {
  getTextDirList,
  getTextDetail
};
