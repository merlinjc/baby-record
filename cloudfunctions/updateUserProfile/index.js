const {
  ensureUser,
  normalizeUserNickName,
  normalizeUserAvatarUrl
} = require('../_shared/auth')
const { db } = require('../_shared/db')

exports.main = async (event) => {
  try {
    const { user } = await ensureUser()
    const nickName = normalizeUserNickName(event.nickName)
    const avatarUrl = normalizeUserAvatarUrl(event.avatarUrl)

    await db.collection('users').doc(user._id).update({
      data: {
        nickName,
        avatarUrl,
        updateTime: db.serverDate()
      }
    })

    return {
      code: 0,
      message: '更新成功',
      data: {
        ...user,
        nickName,
        avatarUrl
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '更新个人资料失败'
    }
  }
}
