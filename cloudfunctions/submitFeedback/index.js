const { ensureUser } = require('../_shared/auth')
const { db } = require('../_shared/db')

exports.main = async (event) => {
  try {
    const { user, wxContext } = await ensureUser()
    const { content = '', contact = '' } = event

    if (!content.trim()) {
      return {
        code: -1,
        message: '反馈内容不能为空'
      }
    }

    const feedback = {
      content: content.trim(),
      contact: contact.trim(),
      userId: user._id,
      openid: wxContext.OPENID,
      status: 'open',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addResult = await db.collection('feedbacks').add({
      data: feedback
    })

    return {
      code: 0,
      message: '反馈已提交',
      data: {
        _id: addResult._id,
        ...feedback
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '提交反馈失败'
    }
  }
}
