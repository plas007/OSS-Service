/**
 * 是否是安卓
 */
function isAndroid(userAgent) {
  return userAgent.indexOf("Android") > -1 || userAgent.indexOf("Adr") > -1; //android终端
}
/**
 * 是否是iOS
 */
function isiOS(userAgent) {
  return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
}
/**
 *  判断当前入口是PC端还是移动端APP端
 * @returns boolean
 */
function isApp(userAgent) {
  return userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  ) == null
    ? false
    : true;
}

/**
 *  判断是在微信浏览器内核打开 还是 在其它浏览器打开
 * @returns boolean
 */
function isWeixin(userAgent) {
  return userAgent.toLowerCase().indexOf("micromessenger") !== -1;
}

/**
 *  判断是不是企业微信打开
 * @returns boolean
 */
function isWecom(userAgent) {
  return isWeixin() && userAgent.toLowerCase().match(/wxwork/i) !== null;
}

/**
 * 判断是不是内置浏览器
 * @returns
 */
function openInWebview(userAgent) {
  let ua = userAgent.toLowerCase();
  // @ts-ignore
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    // 微信浏览器判断
    return false;
    // @ts-ignore
  } else if (ua.match(/QQ/i) == "qq") {
    // QQ浏览器判断
    return false;
    // @ts-ignore
  } else if (ua.match(/WeiBo/i) == "weibo") {
    return false;
  } else {
    if (ua.match(/Android/i) != null) {
      return ua.match(/browser/i) == null;
    } else if (ua.match(/iPhone/i) != null) {
      return ua.match(/safari/i) == null;
    } else {
      return ua.match(/macintosh/i) == null && ua.match(/windows/i) == null;
    }
  }
}

module.exports = {
  isAndroid,
  isiOS,
  isApp,
  isWeixin,
  isWecom,
  openInWebview,
};
