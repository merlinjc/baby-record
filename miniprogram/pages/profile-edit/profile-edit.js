const app = getApp()
const userService = require('../../services/userService')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    isLoading: true,
    loadError: '',
    saving: false,
    nickName: '',
    avatarUrl: '',
    avatarChoices: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
      'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=240&q=80'
    ]
  },

  async onLoad() {
    await this.loadPage()
  },

  async loadPage() {
    this.setData({
      isLoading: true,
      loadError: ''
    })

    try {
      const userInfo = await userService.getUserInfo()
      this.setData({
        nickName: userInfo && userInfo.nickName ? userInfo.nickName : '',
        avatarUrl: userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : '',
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '个人资料加载失败，请稍后重试。'
      })
      errorUtil.showError('个人资料加载失败')
    }
  },

  onNickNameInput(event) {
    this.setData({
      nickName: String(event.detail.value || '').trim()
    })
  },

  onAvatarUrlInput(event) {
    this.setData({
      avatarUrl: String(event.detail.value || '').trim()
    })
  },

  chooseAvatar(event) {
    const { url } = event.currentTarget.dataset
    this.setData({ avatarUrl: url || '' })
  },

  async saveProfile() {
    if (this.data.saving) {
      return
    }

    this.setData({ saving: true })

    try {
      const userInfo = await userService.updateUserProfile({
        nickName: this.data.nickName,
        avatarUrl: this.data.avatarUrl
      })

      if (app && typeof app.setUserInfo === 'function') {
        app.setUserInfo(userInfo)
      }

      this.setData({ saving: false })
      errorUtil.showSuccess('个人资料已更新')

      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 300)
    } catch (error) {
      this.setData({ saving: false })
      errorUtil.showError(error.message || '保存失败')
    }
  },

  retryLoad() {
    this.loadPage()
  }
})
