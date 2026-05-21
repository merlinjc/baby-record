const userService = require('./services/userService')
const babyService = require('./services/babyService')

App({
  async onLaunch() {
    this.initCloud()
    await this.bootstrap()
  },

  initCloud() {
    if (!wx.cloud) {
      return
    }

    try {
      wx.cloud.init({
        env: 'neo3-7gtg0bdtc9fcc672',
        traceUser: true
      })
    } catch (error) {
      console.warn('cloud init failed', error)
    }
  },

  async bootstrap() {
    const userInfo = await userService.ensureUser()
    const currentBaby = await babyService.getCurrentBaby()

    this.globalData.userInfo = userInfo
    this.globalData.currentBaby = currentBaby
  },

  setCurrentBaby(baby) {
    this.globalData.currentBaby = baby
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
  },

  globalData: {
    userInfo: null,
    currentBaby: null
  }
})
