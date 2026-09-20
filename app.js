require('./common/runtime.js')
require('./common/vendor.js')
require('./common/main.js')

// 导入商品页面扩展功能
require('./pages/commodity/modification.js')

App({
  globalData: {
    authentication: "null",
    userInfo: null,
    selectedDishInfo: null
  },
  setAuthentication(authentication) {
    this.globalData.authentication = authentication
    // 同时保存到本地存储，确保数据持久化
    wx.setStorageSync('authentication', authentication)
  },
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
  },
  getAuthentication() {
    // 优先从全局获取，如果没有则尝试从本地存储获取
    if (this.globalData.authentication === "null" || this.globalData.authentication === null) {
      const storedAuth = wx.getStorageSync('authentication')
      if (storedAuth && storedAuth !== "null") {
        this.globalData.authentication = storedAuth
      }
    }
    return this.globalData.authentication
  },
  getUserInfo() {
    return this.globalData.userInfo
  },
  onLaunch() {
    console.log('App Launch')

    // 启动时恢复 authentication
    const storedAuth = wx.getStorageSync('authentication')
    if (storedAuth && storedAuth !== "null") {
      this.globalData.authentication = storedAuth
    }

    // 不在 onLaunch 强制跳转，避免打断登录确认流程导致渲染/接口时序问题
  },
  onShow() {
    console.log('App Show')

    // 回到前台时：仅当已存在有效 authentication 时，才兜底跳到 index
    // 避免“确认登录后第一次渲染/接口请求”时被过早跳转打断
    try {
      const auth = this.getAuthentication ? this.getAuthentication() : wx.getStorageSync('authentication')
      const authentication = auth && auth !== 'null' ? auth : null
      if (!authentication) return

      const pages = getCurrentPages && getCurrentPages()
      const currentRoute = pages && pages.length ? (pages[pages.length - 1].route || '') : ''
      const targetRoute = 'pages/index/index'

      if (currentRoute !== targetRoute) {
        wx.switchTab({ url: '/pages/index/index' })
      }
    } catch (e) {
      console.error('onShow redirect to index failed:', e)
    }
  },
  onHide() {
    console.log('App Hide')
  }
})

