//index.js
const app = getApp();

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  callRouterUser() {

    wx.cloud.callFunction({
      name: 'router',
      data: {
        $url: 'user'
      }
    }).then((res) => {
      console.log(res);
    }).catch((e) => {
      console.log(e);
    });
  },

  callRouterTimer() {

    wx.cloud.callFunction({
      name: 'router',
      data: {
        $url: 'timer'
      }
    }).then((res) => {
      console.log(res);
    }).catch((e) => {
      console.log(e);
    });
  }

})
