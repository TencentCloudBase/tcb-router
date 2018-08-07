const code2openid = require("./lib/code2openid");
const { time } = require("./config/index");
const db = require("./lib/db");
const createSession = require("./lib/createSession");
exports.login = async (req, res) => {
  const { code, rawData } = req.event;
  const { openid, session_key } = await code2openid(code);
  if (openid) {
    const { avatarUrl, gender, nickName } = JSON.parse(rawData);

    const userCollection = db.collection("users");
    const statusCollection = db.collection("status");

    const session = createSession(openid, session_key);
    const userRes = userCollection.where({ openid }).get();
    const statusRes = statusCollection.where({ openid }).get();
    const [status, user] = await Promise.all([statusRes, userRes]);

    const statusDoc = status.data[0];
    if (statusDoc) {
      await statusCollection
        .doc(statusDoc._id)
        .update({ timeout: Date.now() + time, session, openid });
    } else {
      await statusCollection.add({
        openid,
        timeout: Date.now() + time,
        session
      });
    }

    const userDoc = user.data[0];
    if (userDoc) {
      await userCollection
        .doc(userDoc._id)
        .update({ avatarUrl, gender, nickName, openid });
    } else {
      await userCollection.add({ avatarUrl, gender, nickName, openid });
    }
    res.callback(null, { session });
  } else {
    res.callback("登录/注册失败");
  }
};

exports.logout = async (req, res) => {
  // controller 处理
  // 处理注销 清除相应的session
  const statusCollection = db.collection("status");
  const { session } = req.event;
  const status = await statusCollection.where({ session }).get();
  if (status.data[0]) {
    await statusCollection.doc(status.data[0]._id).remove();
  }
  res.callback(null);
};

exports.verifyIdentity = async (req, res) => {
  const { session } = req.event;
  // status集合中保存用户当前的登录状态信息
  const statusCollection = db.collection("status");

  // user集合存放用户的头像性别信息等
  const userCollection = db.collection("users");

  // session对应的登录状态
  const status = await statusCollection.where({ session }).get(); //
  if (status && status.data && status.data[0]) {
    if (Date.now() <= status.data[0].timeout) {
      // 登录状态有效，返回用户对应的信息
      const user = await userCollection
        .where({ openid: status.data[0].openid })
        .get();
      const { avatarUrl, gender, nickName } = user.data[0];
      res.callback(null, { avatarUrl, gender, nickName });
    } else {
      // 过期清除当前session
      await statusCollection.doc(status.data[0]._id).remove();
      res.callback("调用失败...");
    }
  } else {
    // 当前session不存在
    res.callback("调用失败");
  }
};
