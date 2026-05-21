const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')

async function submitFeedback(payload) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'submitFeedback',
      data: payload
    })

    if (result && result.code === 0) {
      return result.data
    }

    throw new Error(result && result.message ? result.message : '提交反馈失败')
  }

  const feedback = {
    _id: mockStore.createId('feedback'),
    content: payload.content,
    contact: payload.contact || '',
    status: 'open',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    feedbacks: [feedback].concat(currentDb.feedbacks || [])
  }))

  return feedback
}

module.exports = {
  submitFeedback
}
