const userService = require('../../services/userService')
const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    isLoading: true,
    loadError: '',
    userInfo: null,
    currentBaby: null,
    stats: {
      babies: 0,
      photos: 0,
      timelineMonths: 0
    }
  },

  async onShow() {
    this.setData({
      isLoading: true,
      loadError: ''
    })

    try {
      const userInfo = await userService.getUserInfo()
      const babies = await babyService.listBabyProfiles()
      const currentBaby = await babyService.getCurrentBaby()
      const timelineGroups = currentBaby ? await photoService.getTimelineGroups(currentBaby._id) : []
      const photos = currentBaby ? await photoService.listPhotosByBaby(currentBaby._id) : []

      this.setData({
        userInfo,
        currentBaby,
        stats: {
          babies: babies.length,
          photos: photos.length,
          timelineMonths: timelineGroups.length
        },
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '个人页数据加载失败，请稍后重试。'
      })
      errorUtil.showError('个人页加载失败')
    }
  },

  goBabyProfiles() {
    wx.navigateTo({ url: '/pages/baby-profile/baby-profile' })
  },

  goTimeline() {
    wx.switchTab({ url: '/pages/photo-time/photo-time' })
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/photo-upload/photo-upload' })
  },

  goFamilyMembers() {
    wx.navigateTo({ url: '/pages/family-members/family-members' })
  },

  goRecycleBin() {
    wx.navigateTo({ url: '/pages/recycle-bin/recycle-bin' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  },

  retryLoad() {
    this.onShow()
  }
})
