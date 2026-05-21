const photoService = require('../../services/photoService')
const dateUtil = require('../../utils/dateUtil')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    isLoading: true,
    loadError: '',
    photo: null,
    dateLabel: '',
    saving: false,
    deleting: false
  },

  async onLoad(options) {
    this.photoId = options.id || ''
    await this.loadDetail()
  },

  async loadDetail() {
    this.setData({
      isLoading: true,
      loadError: ''
    })

    try {
      const photo = await photoService.getPhotoDetail(this.photoId)

      if (!photo) {
        this.setData({
          photo: null,
          dateLabel: '',
          isLoading: false,
          loadError: '没有找到这张照片。'
        })
        return
      }

      this.setData({
        photo,
        dateLabel: dateUtil.formatDateLabel(photo.photoDate),
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '照片详情加载失败，请返回后重试。'
      })
      errorUtil.showError('照片详情加载失败')
    }
  },

  previewPhoto() {
    if (!this.data.photo) {
      return
    }

    wx.previewImage({
      urls: [this.data.photo.filePath],
      current: this.data.photo.filePath
    })
  },

  async saveToAlbum() {
    if (!this.data.photo || this.data.saving) {
      return
    }

    try {
      const actionResult = await wx.showActionSheet({
        itemList: ['保存原图', '压缩后保存']
      })

      this.setData({ saving: true })

      const downloadResult = await wx.downloadFile({
        url: this.data.photo.filePath
      })

      if (!downloadResult || downloadResult.statusCode !== 200) {
        throw new Error('下载失败')
      }

      let targetFilePath = downloadResult.tempFilePath

      if (actionResult.tapIndex === 1) {
        const compressResult = await wx.compressImage({
          src: downloadResult.tempFilePath,
          quality: 70
        })

        targetFilePath = compressResult.tempFilePath || downloadResult.tempFilePath
      }

      await wx.saveImageToPhotosAlbum({
        filePath: targetFilePath
      })

      this.setData({ saving: false })
      errorUtil.showSuccess(actionResult.tapIndex === 1 ? '压缩图已保存到相册' : '原图已保存到相册')
    } catch (error) {
      this.setData({ saving: false })

      if (error && error.errMsg && error.errMsg.indexOf('cancel') >= 0) {
        return
      }

      errorUtil.showError('保存失败，请检查相册权限')
    }
  },

  async deletePhoto() {
    if (!this.data.photo || this.data.deleting) {
      return
    }

    this.setData({ deleting: true })

    try {
      await photoService.deletePhoto(this.data.photo._id)
      this.setData({ deleting: false })
      errorUtil.showSuccess('已移入回收站')
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 300)
    } catch (error) {
      this.setData({ deleting: false })
      errorUtil.showError(error.message || '删除失败')
    }
  },

  retryLoad() {
    this.loadDetail()
  }
})
