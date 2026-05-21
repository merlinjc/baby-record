const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    isLoading: true,
    loadError: '',
    currentBaby: null,
    photos: []
  },

  async onShow() {
    await this.loadPage()
  },

  async loadPage() {
    this.setData({
      isLoading: true,
      loadError: ''
    })

    try {
      const currentBaby = await babyService.getCurrentBaby()
      const photos = currentBaby ? await photoService.getDeletedPhotos(currentBaby._id) : []

      this.setData({
        currentBaby,
        photos,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '回收站加载失败，请稍后重试。'
      })
      errorUtil.showError('回收站加载失败')
    }
  },

  async restorePhoto(event) {
    const { id } = event.currentTarget.dataset

    try {
      await photoService.restorePhoto(id)
      errorUtil.showSuccess('已恢复照片')
      await this.loadPage()
    } catch (error) {
      errorUtil.showError(error.message || '恢复失败')
    }
  },

  retryLoad() {
    this.loadPage()
  }
})
