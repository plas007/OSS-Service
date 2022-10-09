const path = require('path');
const fs = require('fs');
const publicPath = path.join(__dirname, '../public');

/**
 * 获取指定目录下的目录状态
 * @param {*} fileRelativePath
 * @returns
 */
function getFileList(fileRelativePath = '') {
  if (fileRelativePath === null || fileRelativePath === undefined || typeof fileRelativePath != 'string') {
    return [];
  }
  const tmpPath = path.join(publicPath, ...fileRelativePath.split('\\'));
  const dirs = fs.readdirSync(tmpPath);
  const resultList = []; // 结果
  for (let i = 0; i < dirs.length; i++) {
    const tmpDir = dirs[i];
    const fsPath = path.join(tmpPath, tmpDir);
    const isFile = fs.statSync(fsPath).isFile();
    const relativePath = getRelativePath(fsPath);
    resultList.push({
      isFile,
      relativePath,
      name: tmpDir
    });
  }
  return resultList;
}

/**
 * 传入绝对路径返回相对路径
 * @param {*} absolutePath
 * @returns
 */
function getRelativePath(absolutePath) {
  let relativePath = '';
  if (!absolutePath || typeof absolutePath != 'string') {
    return relativePath;
  }
  let keyWord = '';
  let status = 0;
  for (let i = 0; i < absolutePath.length; i++) {
    let ch = absolutePath[i].toLowerCase();
    if (status === 0) {
      // 正常识别态
      if (ch === 'p') {
        status = 1;
        keyWord = ch;
        continue;
      }
    } else {
      let tag = false;
      // 识别public态
      switch (keyWord.length) {
        case 1:
          if (ch === 'u') {
            keyWord += ch;
          } else {
            status = 0;
            keyWord = '';
          }
          break;
        case 2:
          if (ch === 'b') {
            keyWord += ch;
          } else {
            status = 0;
            keyWord = '';
          }
          break;
        case 3:
          if (ch === 'l') {
            keyWord += ch;
          } else {
            status = 0;
            keyWord = '';
          }
          break;
        case 4:
          if (ch === 'i') {
            keyWord += ch;
          } else {
            status = 0;
            keyWord = '';
          }
          break;
        case 5:
          if (ch === 'c') {
            keyWord += ch;
          } else {
            status = 0;
            keyWord = '';
          }
          break;
        case 6:
          if (ch === '\\') {
            tag = true;
            relativePath = absolutePath.substring(i);
          } else {
            status = 0;
            keyWord = '';
          }
          break;
        default:
          status = 0;
          keyWord = '';
      }
      if (tag) break;
    }
  }
  return relativePath;
}

module.exports = {
  getFileList
};
