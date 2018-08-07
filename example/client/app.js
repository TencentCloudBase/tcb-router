const { env } = require("./config/index");
// app.js
App({
  onLaunch: function() {
    wx.cloud.init({
      env,
      traceUser: true
    });
  },
  globalData: {
    userInfo: null
  }
});
