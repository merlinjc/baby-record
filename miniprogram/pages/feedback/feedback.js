const feedbackService = require('../../services/feedbackService')
const errorUtil = require('../../utils/errorUtil')

Page({
  data: {
    content: '',
    contact: '',
    submitting: false
  },

  onContentInput(event) {
    this.setData({ content: event.detail.value })
  },

  onContactInput(event) {
    this.setData({ contact: event.detail.value })
  },

  async submitFeedback() {
    if (!this.data.content.trim()) {
      errorUtil.showError('请填写反馈内容')
      return
    }

    if (this.data.submitting) {
      return
    }

    this.setData({ submitting: true })

    try {
      await feedbackService.submitFeedback({
        content: this.data.content,
        contact: this.data.contact
      })
      this.setData({
        submitting: false,
        content: '',
        contact: ''
      })
      errorUtil.showSuccess('反馈已提交')
    } catch (error) {
      this.setData({ submitting: false })
      errorUtil.showError(error.message || '提交失败')
    }
  }
})
