const { cloud, db } = require('./db')

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

  const addResult = await db.collection('users').add({
    data: newUser
  })

  return {
    wxContext: { OPENID, APPID, UNIONID },
    user: {
      _id: addResult._id,
      _openid: OPENID,
      ...newUser
    }
  }
}

function getMemberRole(baby, openid) {
  if (!baby || !openid) {
    return ''
  }

  if (baby._openid === openid) {
    return 'creator'
  }

  const member = (baby.members || []).find((item) => item.userId === openid)
  return member ? member.role || 'member' : ''
}

function canManageBaby(baby, openid) {
  const role = getMemberRole(baby, openid)
  return role === 'creator' || role === 'admin'
}

async function verifyBabyAccess(babyId, openid) {
  const result = await db.collection('baby_profiles').doc(babyId).get()
  const baby = result.data

  if (!baby) {
    throw new Error('宝宝档案不存在')
  }

  const role = getMemberRole(baby, openid)

  if (!role) {
    throw new Error('无权访问该宝宝档案')
  }

  return baby
}

function canViewPhoto(photo, baby, openid) {
  if (!photo || photo.deleted) {
    return false
  }

  const role = getMemberRole(baby, openid)

  if (!role) {
    return false
  }

  if (canManageBaby(baby, openid) || photo.uploaderOpenId === openid || photo._openid === openid) {
    return true
  }

  const permission = photo.permission || 'family'

  if (permission === 'private') {
    return false
  }

  if (permission === 'admin') {
    return role === 'creator' || role === 'admin'
  }

  return true
}

function canManagePhoto(photo, baby, openid) {
  return !!photo && (canManageBaby(baby, openid) || photo.uploaderOpenId === openid || photo._openid === openid)
}

module.exports = {
  ensureUser,
  getMemberRole,
  canManageBaby,
  verifyBabyAccess,
  canViewPhoto,
  canManagePhoto
}
