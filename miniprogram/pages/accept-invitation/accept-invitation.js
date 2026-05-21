const familyService = require('../../services/familyService')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    token: '',
    accepting: false,
    accepted: false
  },

  onLoad(options) {
    this.setData({
      token: options.token || ''
    })
  },

  async acceptInvite() {
    if (!this.data.token || this.data.accepting) {
      return
    }

    this.setData({ accepting: true })

    try {
      const result = await familyService.acceptInvitation(this.data.token)
      this.setData({
        accepting: false,
        accepted: true,
        result
      })
      errorUtil.showSuccess('已加入家庭')
    } catch (error) {
      this.setData({ accepting: false })
      errorUtil.showError(error.message || '加入失败')
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
