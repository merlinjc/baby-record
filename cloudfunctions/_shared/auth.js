const { cloud, db } = require('./db')

const VALID_MEMBER_ROLES = ['creator', 'admin', 'member', 'viewer']
const INVITABLE_MEMBER_ROLES = ['admin', 'member', 'viewer']
const VALID_PHOTO_PERMISSIONS = ['family', 'private', 'admin']

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

function normalizeUserNickName(nickName) {
  const safeNickName = String(nickName || '').trim()

  if (!safeNickName) {
    throw new Error('昵称不能为空')
  }

  if (safeNickName.length > 20) {
    throw new Error('昵称不能超过 20 个字符')
  }

  return safeNickName
}

function normalizeUserAvatarUrl(avatarUrl) {
  const safeAvatarUrl = String(avatarUrl || '').trim()

  if (!safeAvatarUrl) {
    return ''
  }

  if (safeAvatarUrl.length > 2048) {
    throw new Error('头像地址过长')
  }

  if (!/^https:\/\//.test(safeAvatarUrl)) {
    throw new Error('头像地址不合法')
  }

  return safeAvatarUrl
}

function hasCompletedUserProfile(user) {
  return !!(user && String(user.nickName || '').trim())
}

function ensureCompletedUserProfile(user) {
  if (!hasCompletedUserProfile(user)) {
    throw new Error('请先完善个人资料后再进行分享')
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

function canUploadPhoto(baby, openid) {
  const role = getMemberRole(baby, openid)
  return role === 'creator' || role === 'admin' || role === 'member'
}

function normalizeMemberRole(role, options = {}) {
  const allowCreator = !!options.allowCreator
  const defaultRole = options.defaultRole || 'member'
  const allowedRoles = allowCreator ? VALID_MEMBER_ROLES : INVITABLE_MEMBER_ROLES

  if (!role) {
    return defaultRole
  }

  if (!allowedRoles.includes(role)) {
    throw new Error('成员角色不合法')
  }

  return role
}

function normalizePhotoPermission(permission) {
  if (!permission) {
    return 'family'
  }

  if (!VALID_PHOTO_PERMISSIONS.includes(permission)) {
    throw new Error('照片权限不合法')
  }

  return permission
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
  normalizeUserNickName,
  normalizeUserAvatarUrl,
  hasCompletedUserProfile,
  ensureCompletedUserProfile,
  getMemberRole,
  canManageBaby,
  canUploadPhoto,
  verifyBabyAccess,
  canViewPhoto,
  canManagePhoto,
  normalizeMemberRole,
  normalizePhotoPermission
}
