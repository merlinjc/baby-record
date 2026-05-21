const familyService = require('../../services/familyService')
const errorUtil = require('../../utils/errorUtil')

function normalizeInviteCode(code) {
  return String(code || '').trim().toUpperCase()
}

Page({
  data: {
    inviteCode: '',
    accepting: false,
    accepted: false
  },

  onLoad(options) {
    this.setData({
      inviteCode: normalizeInviteCode(options.code || options.inviteCode)
    })
  },

  onCodeInput(event) {
    this.setData({
      inviteCode: normalizeInviteCode(event.detail.value)
    })
  },

  async acceptInvite() {
    if (!this.data.inviteCode || this.data.accepting) {
      return
    }

    this.setData({ accepting: true })

    try {
      const result = await familyService.acceptInvitation(this.data.inviteCode)
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
