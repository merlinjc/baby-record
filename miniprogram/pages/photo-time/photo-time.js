const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const errorUtil = require('../../utils/errorUtil')

const FILTER_OPTIONS = [
  { value: 'year', label: '按年' },
  { value: 'month', label: '按月' },
  { value: 'day', label: '按日' }
]

Page({
  data: {
    isLoading: true,
    loadError: '',
    currentBaby: null,
    hasBaby: false,
    groups: [],
    totalPhotos: 0,
    monthCount: 0,
    filterOptions: FILTER_OPTIONS,
    activeGroupBy: 'month'
  },

  async onShow() {
    await this.loadTimeline(this.data.activeGroupBy)
  },

  async loadTimeline(groupBy) {
    this.setData({
      isLoading: true,
      loadError: '',
      activeGroupBy: groupBy
    })

    try {
      const currentBaby = await babyService.getCurrentBaby()
      const timelineResult = currentBaby
        ? await photoService.getPhotosByTime({
          babyId: currentBaby._id,
          groupBy
        })
        : { groups: [] }
      const groups = timelineResult.groups || []
      const totalPhotos = groups.reduce((sum, group) => sum + group.count, 0)

      this.setData({
        currentBaby,
        hasBaby: !!currentBaby,
        groups,
        totalPhotos,
        monthCount: groups.length,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '时间轴数据加载失败，请稍后再试。'
      })
      errorUtil.showError('时间轴加载失败')
    }
  },

  changeGroupBy(event) {
    const { value } = event.currentTarget.dataset

    if (!value || value === this.data.activeGroupBy || this.data.isLoading) {
      return
    }

    this.loadTimeline(value)
  },

  openPhotoDetail(event) {
    const id = event.detail && event.detail.id ? event.detail.id : event.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/photo-detail/photo-detail?id=' + id })
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/photo-upload/photo-upload' })
  },

  goCreateBaby() {
    wx.navigateTo({ url: '/pages/baby-edit/baby-edit' })
  },

  retryLoad() {
    this.loadTimeline(this.data.activeGroupBy)
  }
})
