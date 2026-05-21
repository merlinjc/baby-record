const babyService = require('../../services/babyService')
const familyService = require('../../services/familyService')
const errorUtil = require('../../utils/errorUtil')

const ROLE_OPTIONS = [
  { value: 'member', label: '普通成员' },
  { value: 'admin', label: '管理员' },
  { value: 'viewer', label: '仅查看者' }
]

Page({
  data: {
    isLoading: true,
    loadError: '',
    currentBaby: null,
    members: [],
    canManage: false,
    roleOptions: ROLE_OPTIONS,
    roleValue: 0,
    relationship: '',
    latestInvite: null
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
      const familyInfo = currentBaby ? await familyService.getFamilyMembers(currentBaby._id) : null

      this.setData({
        currentBaby,
        members: familyInfo ? familyInfo.members : [],
        canManage: familyInfo ? familyInfo.canManage : false,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        loadError: '家庭成员加载失败，请稍后重试。'
      })
      errorUtil.showError('家庭成员加载失败')
    }
  },

  onRoleChange(event) {
    this.setData({ roleValue: Number(event.detail.value) || 0 })
  },

  onRelationshipInput(event) {
    this.setData({ relationship: event.detail.value })
  },

  async createInvite() {
    if (!this.data.currentBaby) {
      errorUtil.showError('请先创建宝宝档案')
      return
    }

    try {
      const invite = await familyService.inviteMember({
        babyId: this.data.currentBaby._id,
        role: this.data.roleOptions[this.data.roleValue].value,
        relationship: this.data.relationship
      })

      this.setData({ latestInvite: invite })
      wx.setClipboardData({
        data: invite.sharePath
      })
      errorUtil.showSuccess('邀请链接已复制')
    } catch (error) {
      errorUtil.showError(error.message || '创建邀请失败')
    }
  },

  async removeMember(event) {
    const { userId } = event.currentTarget.dataset

    try {
      await familyService.removeMember({
        babyId: this.data.currentBaby._id,
        userId
      })
      errorUtil.showSuccess('成员已移除')
      await this.loadPage()
    } catch (error) {
      errorUtil.showError(error.message || '移除失败')
    }
  },

  retryLoad() {
    this.loadPage()
  },

  onShareAppMessage() {
    if (!this.data.latestInvite) {
      return {
        title: '邀请你加入宝宝成长记录',
        path: '/pages/profile/profile'
      }
    }

    return {
      title: '邀请你加入 ' + this.data.currentBaby.name + ' 的成长记录',
      path: this.data.latestInvite.sharePath
    }
  }
})
