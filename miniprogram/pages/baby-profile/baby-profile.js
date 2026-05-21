const app = getApp()
const babyService = require('../../services/babyService')
const dateUtil = require('../../utils/dateUtil')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    isLoading: true,
    loadError: '',
    babies: []
  },

  async onShow() {
    await this.loadBabies()
  },

  async loadBabies() {
    this.setData({
      isLoading: true,
      loadError: ''
    })

    try {
      const currentBaby = await babyService.getCurrentBaby()
      const babies = (await babyService.listBabyProfiles()).map((item) => ({
        ...item,
        ageLabel: dateUtil.getAgeLabel(item.birthday),
        isCurrent: currentBaby ? currentBaby._id === item._id : false
      }))

      this.setData({
        babies,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '宝宝档案加载失败，请稍后再试。'
      })
      errorUtil.showError('档案加载失败')
    }
  },

  createBaby() {
    wx.navigateTo({ url: '/pages/baby-edit/baby-edit' })
  },

  async selectBaby(event) {
    const { id, current } = event.currentTarget.dataset

    if (current) {
      return
    }

    try {
      const baby = await babyService.setCurrentBaby(id)
      app.setCurrentBaby(baby)
      errorUtil.showSuccess('已切换当前宝宝')
      await this.loadBabies()
    } catch (error) {
      errorUtil.showError('切换档案失败')
    }
  },

  retryLoad() {
    this.loadBabies()
  }
})
