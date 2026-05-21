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
    return {
      wxContext: { OPENID, APPID, UNIONID },
      user: userResult.data[0]
    }
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

  const addResult = await db.collection('users').add({ data: newUser })

  return {
    wxContext: { OPENID, APPID, UNIONID },
    user: {
      _id: addResult._id,
      _openid: OPENID,
      ...newUser
    }
  }
}

exports.main = async () => {
  try {
    const { wxContext } = await ensureUser()
    const result = await db.collection('baby_profiles').where({
      members: db.command.elemMatch({
        userId: wxContext.OPENID
      })
    }).orderBy('createTime', 'desc').get()

    return {
      code: 0,
      message: '获取成功',
      data: result.data || []
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '获取宝宝档案失败'
    }
  }
}
