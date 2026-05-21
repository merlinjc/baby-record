const userService = require('../../services/userService')
const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const errorUtil = require('../../utils/errorUtil')
const dateUtil = require('../../utils/dateUtil')

function getCurrentRole(currentBaby, userInfo) {
  if (!currentBaby || !userInfo) {
    return ''
  }

  const currentMember = (currentBaby.members || []).find((item) => item.userId === userInfo._openid)
  return currentMember ? (currentMember.role || 'member') : ''
}

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

function canUploadByRole(role) {
  return role === 'creator' || role === 'admin' || role === 'member'
}

function canManageByRole(role) {
  return role === 'creator' || role === 'admin'
}

function getCollabHint(context) {
  if (!context.role) {
    return '先创建或加入一个家庭档案，个人页会自动切换为协作工作台。'
  }

  if (context.canManage) {
    return '你当前可管理成员、照片权限和回收站内容。'
  }

  if (context.canUpload) {
    return '你当前可上传和查看照片，但不能调整成员权限。'
  }

  return '你当前仅可查看内容，上传和管理动作需要联系创建者。'
}

function buildProfileReminder(userInfo) {
  if (!userInfo || userInfo.profileCompleted) {
    return ''
  }

  return '当前账号还没有完成昵称资料，邀请家人前请先补全，避免分享页出现默认身份。'
}

Page({
  data: {
    isLoading: true,
    loadError: '',
    userInfo: null,
    currentBaby: null,
    profileReminder: '',
    profileContext: {
      role: '',
      roleLabel: '',
      canUpload: false,
      canManage: false,
      memberCount: 0,
      lastPhotoDateLabel: '',
      recycleCount: 0,
      collabHint: ''
    },
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
      const deletedPhotos = currentBaby ? await photoService.getDeletedPhotos(currentBaby._id) : []
      const currentRole = getCurrentRole(currentBaby, userInfo)
      const memberCount = currentBaby ? (currentBaby.members || []).length : 0
      const lastPhotoDateLabel = photos[0] ? dateUtil.formatDateLabel(photos[0].photoDate) : ''
      const profileContext = {
        role: currentRole,
        roleLabel: getRoleLabel(currentRole),
        canUpload: canUploadByRole(currentRole),
        canManage: canManageByRole(currentRole),
        memberCount,
        lastPhotoDateLabel,
        recycleCount: deletedPhotos.length,
        collabHint: ''
      }

      profileContext.collabHint = getCollabHint(profileContext)

      this.setData({
        userInfo,
        currentBaby,
        profileReminder: buildProfileReminder(userInfo),
        profileContext,
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

  goProfileEdit() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
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

  goCurrentBaby() {
    if (!this.data.currentBaby) {
      this.goBabyProfiles()
      return
    }

    wx.navigateTo({ url: '/pages/baby-profile/baby-profile' })
  },

  retryLoad() {
    this.onShow()
  }
})
