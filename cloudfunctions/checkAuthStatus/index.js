const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

async function ensureUser() {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext()

  if (!OPENID) {
    throw new Error('获取用户身份失败')
  }

  const userResult = await db.collection('users').where({
    _openid: OPENID
  }).get()

  if (userResult.data && userResult.data.length) {
    return userResult.data[0]
  }

  const now = db.serverDate()
  const newUser = {
    appId: APPID,
    unionId: UNIONID || '',
    nickName: '',
    avatarUrl: '',
    babyProfiles: [],
    createTime: now,
    updateTime: now
  }

  const addResult = await db.collection('users').add({
    data: newUser
  })

  return {
    _id: addResult._id,
    _openid: OPENID,
    ...newUser
  }
}

exports.main = async () => {
  try {
    const user = await ensureUser()

    return {
      code: 0,
      message: '获取用户信息成功',
      data: user
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '检查认证状态失败'
    }
  }
}
