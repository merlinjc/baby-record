const app = getApp()
const babyService = require('../../services/babyService')
const errorUtil = require('../../utils/errorUtil')
const dateUtil = require('../../utils/dateUtil')

Page({
  data: {
    isSaving: false,
    name: '',
    birthday: dateUtil.formatDate(),
    genderOptions: ['男', '女', '暂不设置'],
    genderValue: 2,
    genderCode: 'unknown'
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value.trim() })
  },

  onBirthdayChange(event) {
    this.setData({ birthday: event.detail.value })
  },

  onGenderChange(event) {
    const genderValue = Number(event.detail.value)
    const genderCodeMap = ['male', 'female', 'unknown']
    this.setData({
      genderValue,
      genderCode: genderCodeMap[genderValue]
    })
  },

  async saveBaby() {
    if (!this.data.name) {
      errorUtil.showError('请输入宝宝姓名')
      return
    }

    if (this.data.isSaving) {
      return
    }

    this.setData({ isSaving: true })

    try {
      const baby = await babyService.createBabyProfile({
        name: this.data.name,
        birthday: this.data.birthday,
        gender: this.data.genderCode
      })

      app.setCurrentBaby(baby)
      errorUtil.showSuccess('档案已创建')

      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' })
      }, 300)
    } catch (error) {
      this.setData({ isSaving: false })
      errorUtil.showError('创建档案失败')
    }
  }
})
