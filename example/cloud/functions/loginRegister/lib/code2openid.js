const fetch = require("node-fetch");
const { wxid, secret } = require("../config/index");
/**
 *
 * @param {string} code wx.login传入的code
 * @return {promise(string)} openid 生成的openid
 */
function code2openid(code) {
  return fetch(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${wxid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
  ).then(res => res.json());
}
module.exports = code2openid;
