const app = getApp()
const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const dateUtil = require('../../utils/dateUtil')
const errorUtil = require('../../utils/errorUtil')

function getRoleLabel(role) {
  if (role === 'creator') {
    return '创建者'
  }

  if (role === 'admin') {
    return '管理员'
  }

  if (role === 'member') {
    return '普通成员'
  }

  if (role === 'viewer') {
    return '仅查看者'
  }

  return '未加入'
}

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
      const appUser = app.globalData.userInfo || null
      const rawBabies = await babyService.listBabyProfiles()
      const babies = []

      for (let index = 0; index < rawBabies.length; index += 1) {
        const item = rawBabies[index]
        const photos = await photoService.listPhotosByBaby(item._id)
        const currentMember = appUser ? (item.members || []).find((member) => member.userId === appUser._openid) : null
        const currentRole = currentMember ? (currentMember.role || 'member') : ''

        babies.push({
          ...item,
          ageLabel: dateUtil.getAgeLabel(item.birthday),
          isCurrent: currentBaby ? currentBaby._id === item._id : false,
          roleLabel: getRoleLabel(currentRole),
          memberCount: (item.members || []).length,
          photoCount: photos.length,
          lastPhotoDateLabel: photos[0] ? dateUtil.formatDateLabel(photos[0].photoDate) : '暂无照片',
          canUpload: currentRole === 'creator' || currentRole === 'admin' || currentRole === 'member'
        })
      }

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
