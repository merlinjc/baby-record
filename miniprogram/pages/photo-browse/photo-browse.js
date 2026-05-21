const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const errorUtil = require('../../utils/errorUtil')

const PAGE_SIZE = 20
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

async function loadDefaultPage(babyId, pageSize) {
  return photoService.listPhotosPageByBaby(babyId, {
    page: 1,
    pageSize
  })
}

Page({
  data: {
    isLoading: true,
    isLoadingMore: false,
    loadError: '',
    currentBaby: null,
    photos: [],
    waterfallColumns: [[], []],
    locationOptions: [],
    activeLocation: '',
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    hasMore: true
  },

  async onShow() {
    await this.loadInitialData()
  },

  async loadInitialData() {
    this.setData({
      isLoading: true,
      loadError: '',
      photos: [],
      waterfallColumns: [[], []],
      page: 1,
      total: 0,
      hasMore: true
    })

    try {
      const currentBaby = await babyService.getCurrentBaby()

      if (!currentBaby) {
        this.setData({
          currentBaby: null,
          locationOptions: [],
          activeLocation: '',
          isLoading: false,
          hasMore: false
        })
        return
      }

      const locationOptions = await photoService.listLocationNames(currentBaby._id)
      const result = await loadDefaultPage(currentBaby._id, this.data.pageSize)

      const list = result.list || []
      this.setData({
        currentBaby,
        locationOptions,
        photos: list,
        waterfallColumns: buildWaterfallColumns(list),
        total: result.total || list.length,
        page: 1,
        activeLocation: '',
        hasMore: list.length < (result.total || list.length),
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '照片流加载失败，请稍后重试。'
      })
      errorUtil.showError('照片流加载失败')
    }
  },

  async onReachBottom() {
    if (!this.data.currentBaby || this.data.activeLocation || !this.data.hasMore || this.data.isLoading || this.data.isLoadingMore) {
      return
    }

    this.setData({ isLoadingMore: true })

    try {
      const nextPage = this.data.page + 1
      const result = await photoService.listPhotosPageByBaby(this.data.currentBaby._id, {
        page: nextPage,
        pageSize: this.data.pageSize
      })
      const list = result.list || []
      const photos = this.data.photos.concat(list)
      const total = result.total || photos.length

      this.setData({
        photos,
        waterfallColumns: buildWaterfallColumns(photos),
        total,
        page: nextPage,
        hasMore: photos.length < total,
        isLoadingMore: false
      })
    } catch (error) {
      this.setData({ isLoadingMore: false })
      errorUtil.showError('加载更多失败')
    }
  },

  openPhotoDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: '/pages/photo-detail/photo-detail?id=' + id })
  },

  async changeLocation(event) {
    const { value } = event.currentTarget.dataset

    if (this.data.isLoading || !this.data.currentBaby || value === this.data.activeLocation) {
      return
    }

    this.setData({
      isLoading: true,
      loadError: '',
      activeLocation: value || ''
    })

    try {
      let photos = []
      let total = 0
      let hasMore = false

      if (value) {
        photos = await photoService.listPhotosByLocation(this.data.currentBaby._id, value)
        total = photos.length
      } else {
        const pageResult = await loadDefaultPage(this.data.currentBaby._id, this.data.pageSize)
        photos = pageResult.list || []
        total = pageResult.total || photos.length
        hasMore = photos.length < total
      }

      this.setData({
        photos,
        waterfallColumns: buildWaterfallColumns(photos),
        total,
        page: 1,
        hasMore,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '地点筛选失败，请稍后重试。'
      })
      errorUtil.showError('地点筛选失败')
    }
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/photo-upload/photo-upload' })
  },

  goCreateBaby() {
    wx.navigateTo({ url: '/pages/baby-edit/baby-edit' })
  },

  retryLoad() {
    this.loadInitialData()
  }
})
