const regeneratorRuntime = require("../../lib/runtime");
Page({
    data: {
        route: "index", // or main
        avatarUrl: "",
        nickName: "",
        gender: 0
    },

    onLoad() {
        let that = this;
        wx.checkSession({
            async success() {
                // 当前仍然有效的话直接去云函数获取用户信息
                const { result } = await wx.cloud.callFunction({
                    // 要调用的云函数名称
                    name: "loginRegister",
                    // 传递给云函数的参数
                    data: {
                        session: wx.getStorageSync("session"),
                        $url: "verifyIdentity"
                    }
                });

                if (result.code === 0) {
                    const { avatarUrl, gender, nickName } = result.data;
                    wx.setNavigationBarTitle({
                        title: "主页"
                    });
                    that.setData({
                        avatarUrl,
                        nickName,
                        gender,
                        route: "main"
                    });
                }
            },
            fail() {
                wx.showToast({
                    title: "会话过期....",
                    icon: "none",
                    duration: 1500,
                    complete() {
                        wx.removeStorageSync("session");
                        wx.setNavigationBarTitle({
                            title: "登录页"
                        });
                        that.setData({ route: "index" });
                    }
                });
            }
        });
    },
    onLoginSuccess(e) {
        // 登录成功的回调
        const { avatarUrl, nickName, gender } = e.detail;
        wx.setNavigationBarTitle({
            title: "主页"
        });
        this.setData({ route: "main", avatarUrl, nickName, gender });
    },
    async bindLogout() {
        const that = this;
        const { result } = await wx.cloud.callFunction({
            // 要调用的云函数名称
            name: "loginRegister",
            // 传递给云函数的参数
            data: {
                session: wx.getStorageSync("session"),
                $url: "logout"
            }
        });
        if (result.code === 0) {
            wx.showToast({
                title: result.message,
                icon: "none",
                duration: 1500,
                complete() {
                    wx.removeStorageSync("session");
                    that.setData({ route: "index" });
                    wx.setNavigationBarTitle({
                        title: "登录页"
                    });
                }
            });
        }
    },
    async bindTap() {
        let that = this;
        wx.showLoading({
            title: "请求调用云函数中..."
        });
        const { result } = await wx.cloud.callFunction({
            // 要调用的云函数名称
            name: "loginRegister",
            // 传递给云函数的参数
            data: {
                session: wx.getStorageSync("session"),
                url: "verifyIdentity"
            }
        });
        wx.hideLoading();
        const { message } = result;
        if (result.code === 0) {
            wx.showToast({
                title: message,
                icon: "none",
                duration: 2000
            });
        } else {
            wx.showToast({
                title: message,
                icon: "none",
                duration: 2000,
                complete() {
                    wx.removeStorageSync("session");
                    that.setData({ route: "index" });
                    wx.setNavigationBarTitle({
                        title: "登录页"
                    });
                }
            });
        }
    }
});
