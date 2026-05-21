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

exports.main = async (event) => {
  try {
    const { user, wxContext } = await ensureUser()
    const { name, birthday, gender, avatar = '' } = event

    if (!name || !birthday || !gender) {
      return {
        code: -1,
        message: '姓名、生日、性别不能为空'
      }
    }

    const now = db.serverDate()
    const babyProfile = {
      name,
      birthday,
      gender,
      avatar,
      creatorId: user._id,
      members: [
        {
          userId: wxContext.OPENID,
          role: 'creator',
          relationship: '',
          joinTime: now
        }
      ],
      createTime: now,
      updateTime: now
    }

    const addResult = await db.collection('baby_profiles').add({
      data: babyProfile
    })

    await db.collection('users').doc(user._id).update({
      data: {
        babyProfiles: db.command.push(addResult._id),
        updateTime: now
      }
    })

    return {
      code: 0,
      message: '创建成功',
      data: {
        _id: addResult._id,
        ...babyProfile
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '创建宝宝档案失败'
    }
  }
}
