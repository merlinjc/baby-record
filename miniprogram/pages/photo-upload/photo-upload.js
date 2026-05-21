const babyService = require('../../services/babyService')
const photoService = require('../../services/photoService')
const userService = require('../../services/userService')
const errorUtil = require('../../utils/errorUtil')
const dateUtil = require('../../utils/dateUtil')

const PERMISSION_OPTIONS = [
  { value: 'family', label: '家庭成员可见' },
  { value: 'private', label: '仅上传者可见' },
  { value: 'admin', label: '仅创建者/管理员可见' }
]

Page({
  data: {
    isLoading: true,
    loadError: '',
    currentBaby: null,
    currentRole: '',
    canUpload: true,
    description: '',
    photoDate: dateUtil.formatDate(),
    selectedFiles: [],
    uploading: false,
    uploadProgress: 0,
    uploadProgressText: '',
    permissionOptions: PERMISSION_OPTIONS,
    permissionValue: 0,
    locationName: ''
  },

  async onLoad() {
    await this.loadPage()
  },

  async loadPage() {
    this.setData({
      isLoading: true,
      loadError: ''
    })

    try {
      const currentBaby = await babyService.getCurrentBaby()
      const userInfo = await userService.getUserInfo()
      const currentMember = currentBaby
        ? (currentBaby.members || []).find((item) => item.userId === userInfo._openid)
        : null
      const currentRole = currentMember ? (currentMember.role || 'member') : ''
      const canUpload = !currentBaby || currentRole === 'creator' || currentRole === 'admin' || currentRole === 'member'

      this.setData({
        currentBaby,
        currentRole,
        canUpload,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '上传页初始化失败，请重新进入页面。'
      })
      errorUtil.showError('上传页初始化失败')
    }
  },

  onDescInput(event) {
    this.setData({ description: event.detail.value })
  },

  onDateChange(event) {
    this.setData({ photoDate: event.detail.value })
  },

  onPermissionChange(event) {
    this.setData({ permissionValue: Number(event.detail.value) || 0 })
  },

  onLocationInput(event) {
    this.setData({ locationName: event.detail.value })
  },

  chooseImages() {
    if (!this.data.currentBaby) {
      errorUtil.showError('请先创建宝宝档案')
      return
    }

    if (!this.data.canUpload) {
      errorUtil.showError('当前角色没有上传权限')
      return
    }

    const remainCount = 9 - this.data.selectedFiles.length

    if (remainCount <= 0) {
      errorUtil.showError('最多选择 9 张照片')
      return
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const nextFiles = res.tempFiles.map((item) => item.tempFilePath)
        this.setData({
          selectedFiles: this.data.selectedFiles.concat(nextFiles)
        })
      }
    })
  },

  removeImage(event) {
    const { index } = event.currentTarget.dataset
    const selectedFiles = this.data.selectedFiles.filter((_, fileIndex) => fileIndex !== index)
    this.setData({ selectedFiles })
  },

  async submitUpload() {
    if (!this.data.currentBaby) {
      errorUtil.showError('请先创建宝宝档案')
      return
    }

    if (!this.data.canUpload) {
      errorUtil.showError('当前角色没有上传权限')
      return
    }

    if (!this.data.selectedFiles.length) {
      errorUtil.showError('请先选择照片')
      return
    }

    if (this.data.uploading) {
      return
    }

    this.setData({
      uploading: true,
      uploadProgress: 0,
      uploadProgressText: '正在准备上传...'
    })

    try {
      await photoService.createPhotos({
        babyId: this.data.currentBaby._id,
        files: this.data.selectedFiles,
        description: this.data.description,
        photoDate: this.data.photoDate,
        permission: this.data.permissionOptions[this.data.permissionValue].value,
        locationName: this.data.locationName,
        onProgress: (progressInfo) => {
          this.setData({
            uploadProgress: progressInfo.progress,
            uploadProgressText: '正在上传第 ' + progressInfo.currentIndex + ' / ' + progressInfo.total + ' 张'
          })
        }
      })

      this.setData({
        uploading: false,
        uploadProgress: 100,
        uploadProgressText: '上传完成'
      })
      errorUtil.showSuccess('上传完成')

      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 300)
    } catch (error) {
      this.setData({
        uploading: false,
        uploadProgress: 0,
        uploadProgressText: ''
      })
      errorUtil.showError('上传失败')
    }
  },

  goCreateBaby() {
    wx.navigateTo({ url: '/pages/baby-edit/baby-edit' })
  },

  retryLoad() {
    this.loadPage()
  }
})
