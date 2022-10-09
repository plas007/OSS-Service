const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const { getFileList } = require('./service/getAllFiles.js');
const { MakeDirsSync } = require('./service/makeFolderPath.js');
const { isiOS, isAndroid } = require('./service/browser.js');
const { getTextDirList, getTextDetail } = require('./service/getText.js');

const options = {
  hostname: 'localhost',
  port: 9000
};
const uploadUrl = `http://${options.hostname}:${options.port}/upload`;

app.use(
  koaBody({
    multipart: true, // 支持文件上传
    strict: false,
    // encoding: "gzip",
    formidable: {
      // uploadDir: path.join(__dirname, "public/video"), // 设置文件上传目录,会直接保存
      keepExtensions: true, // 保持文件的后缀
      maxFieldsSize: 50 * 1024 * 1024 // 文件上传大小
    }
  })
);

app.use(koaStatic(path.join(__dirname, 'public')));

/**
 * 上传文件
 */
router.post('/ossApi/uploadFile.json', async (ctx) => {
  const file = ctx.request.files.file;
  const reader = fs.createReadStream(file.path);
  const time = new Date();
  const date = time.toLocaleDateString('chinese').replace(/\//g, '-');
  const filePath = path.join(__dirname, 'public/upload', date);
  const fileResource = filePath + `/${time.getTime()}-${file.name}`;
  if (!fs.existsSync(filePath)) {
    //判断staic/upload文件夹是否存在，如果不存在就新建一个
    try {
      fs.mkdirSync(filePath);
      let upstream = fs.createWriteStream(fileResource);
      reader.pipe(upstream);
      ctx.response.body = {
        url: uploadUrl + `/${date}/${time.getTime()}-${file.name}`,
        download: `http://${options.hostname}:${options.port}/download/video/${date}/${time.getTime()}-${file.name}`
      };
    } catch (error) {
      ctx.response.body = {
        data: JSON.stringify(error),
        errorCode: '2003',
        success: false,
        errorMsg: '',
        error_msg: ''
      };
    }
  } else {
    let upstream = fs.createWriteStream(fileResource);
    reader.pipe(upstream);
    ctx.response.body = {
      url: uploadUrl + `/${date}/${time.getTime()}-${file.name}`, //返给前端一个url地址
      download: `http://${options.hostname}:${options.port}/download/video/${date}/${time.getTime()}-${file.name}`
    };
  }
});

/**
 * 获取指定目录下的文件内容
 */
router.get('/uploadList.json', (ctx) => {
  let _path = ctx.query.path ? encodeURI(ctx.query.path) : '/upload';
  const tempPath = path.join('public', _path);
  _path = path.join(__dirname, tempPath);
  let list = fs.readdirSync(_path);
  let result = list.map((item) => {
    const isFile = fs.lstatSync(path.join(_path, item)).isFile();
    return {
      isFile,
      path: path.join(tempPath, item),
      name: item,
      viewSrc: ''
    };
  });
  ctx.body = {
    data: result,
    errorCode: '0',
    success: true,
    errorMsg: '',
    error_msg: ''
  };
});

/**
 * 获取指定目录下所有文件内容
 */
router.get('/ossApi/getAllFiles.json', (ctx) => {
  const route = ctx.query.path ? decodeURI(ctx.query.path) : '';
  ctx.body = {
    data: getFileList(route),
    errorCode: '0',
    success: true,
    errorMsg: '',
    error_msg: ''
  };
});

/**
 * 提交共享文本
 */
router.post('/ossApi/shareText.json', (ctx) => {
  const time = new Date();
  const date = time.toLocaleDateString('chinese').replace(/\//g, '-');
  const { text: value } = ctx.request.body;
  let { userName, app } = ctx.request.header;
  userName = userName || app;
  const userAgent = ctx.request.header['user-agent'];
  const platform = isiOS(userAgent) ? 'iOS' : isAndroid(userAgent) ? 'android' : 'unknow';
  let data = [];
  const dirPath = path.join(__dirname, `public/text`);
  try {
    if (!fs.existsSync(dirPath)) MakeDirsSync(dirPath);
  } catch (error) {
    console.log(error);
    ctx.body = {
      data: {},
      errorCode: '0',
      success: false,
      errorMsg: '写入文件错误',
      error_msg: ''
    };
  }
  const filePath = path.join(dirPath, `${date}.json`);
  try {
    data = JSON.parse(
      fs.readFileSync(filePath, {
        encoding: 'utf-8'
      })
    );
    data.unshift({
      createTime: new Date().getTime(),
      value: value,
      userName: userName,
      userAgent: userAgent,
      platform: platform
    });
  } catch (error) {
    console.log(error);
    data = [
      {
        createTime: new Date().getTime(),
        value: value,
        userName: userName,
        userAgent: userAgent,
        platform: platform
      }
    ];
  }
  fs.writeFileSync(filePath, JSON.stringify(data));
  ctx.body = {
    data: {},
    errorCode: '0',
    success: true,
    errorMsg: '',
    error_msg: ''
  };
});

/**
 * 读取文本文件夹
 */
router.get('/ossApi/getShareText.json', (ctx) => {
  ctx.body = {
    data: getTextDirList(),
    errorCode: '0',
    success: true,
    errorMsg: '',
    error_msg: ''
  };
});

/**
 * 读取文本内容
 */
router.get('/ossApi/getShareDetail.json', (ctx) => {
  const route = ctx.query.path ? decodeURI(ctx.query.path) : '';
  ctx.body = {
    data: getTextDetail(route),
    errorCode: '0',
    success: true,
    errorMsg: '',
    error_msg: ''
  };
});

app.use(router.allowedMethods());
app.use(router.routes());
app.listen(9000, () => {
  console.log('启动成功');
  console.log(`http://localhost:9000`);
});
