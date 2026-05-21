const app = getApp()
const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const dateUtil = require('../../utils/dateUtil')
const errorUtil = require('../../utils/errorUtil')

const WATERFALL_HEIGHTS = [360, 280, 420, 300, 340, 260]

function buildWaterfallColumns(photos) {
  const columns = [[], []]
  const columnHeights = [0, 0]

  photos.forEach((photo, index) => {
    const imageHeight = WATERFALL_HEIGHTS[index % WATERFALL_HEIGHTS.length]
    const textRows = Math.min(3, Math.max(1, Math.ceil((photo.description || '').length / 18)))
    const estimatedHeight = imageHeight + 110 + textRows * 28
    const targetColumn = columnHeights[0] <= columnHeights[1] ? 0 : 1

    columns[targetColumn].push({
      ...photo,
      imageStyle: 'height: ' + imageHeight + 'rpx;'
    })
    columnHeights[targetColumn] += estimatedHeight
  })

  return columns
}

Page({
  data: {
    isLoading: true,
    loadError: '',
    hasBaby: false,
    currentBaby: null,
    ageLabel: '',
    photos: [],
    waterfallColumns: [[], []],
    photoCount: 0,
    latestDateLabel: '',
    monthCount: 0
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
      const pageResult = currentBaby
        ? await photoService.listPhotosPageByBaby(currentBaby._id, { page: 1, pageSize: 6 })
        : { list: [], total: 0 }
      const timelineGroups = currentBaby ? await photoService.getTimelineGroups(currentBaby._id) : []
      const photos = pageResult.list || []

      app.setCurrentBaby(currentBaby)

      this.setData({
        hasBaby: !!currentBaby,
        currentBaby,
        ageLabel: currentBaby ? dateUtil.getAgeLabel(currentBaby.birthday) : '',
        photos,
        waterfallColumns: buildWaterfallColumns(photos),
        photoCount: pageResult.total || photos.length,
        latestDateLabel: photos[0] ? dateUtil.formatDateLabel(photos[0].photoDate) : '',
        monthCount: timelineGroups.length,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '首页数据加载失败，请稍后重试。'
      })
      errorUtil.showError('首页数据加载失败')
    }
  },

  goCreateBaby() {
    wx.navigateTo({ url: '/pages/baby-edit/baby-edit' })
  },

  goBabyProfiles() {
    wx.navigateTo({ url: '/pages/baby-profile/baby-profile' })
  },

  goUpload() {
    if (!this.data.hasBaby) {
      this.goCreateBaby()
      return
    }

    wx.navigateTo({ url: '/pages/photo-upload/photo-upload' })
  },

  goTimeline() {
    if (!this.data.hasBaby) {
      this.goCreateBaby()
      return
    }

    wx.switchTab({ url: '/pages/photo-time/photo-time' })
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  goPhotoBrowse() {
    if (!this.data.hasBaby) {
      this.goCreateBaby()
      return
    }

    wx.navigateTo({ url: '/pages/photo-browse/photo-browse' })
  },

  openPhotoDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: '/pages/photo-detail/photo-detail?id=' + id })
  },

  retryLoad() {
    this.loadPage()
  }
})
