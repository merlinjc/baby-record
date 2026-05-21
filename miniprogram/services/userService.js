const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')

function getAppInstance() {
  return typeof getApp === 'function' ? getApp() : null
}

function buildProfileCompleted(userInfo) {
  return !!(userInfo && String(userInfo.nickName || '').trim())
}

function normalizeUserInfo(userInfo) {
  if (!userInfo) {
    return null
  }

  return {
    ...userInfo,
    nickName: String(userInfo.nickName || '').trim(),
    avatarUrl: String(userInfo.avatarUrl || '').trim(),
    profileCompleted: userInfo.profileCompleted !== undefined
      ? !!userInfo.profileCompleted
      : buildProfileCompleted(userInfo)
  }
}

function syncAppUserInfo(userInfo) {
  const safeUserInfo = normalizeUserInfo(userInfo)
  const app = getAppInstance()

  if (!safeUserInfo) {
    return null
  }

  if (app && typeof app.setUserInfo === 'function') {
    app.setUserInfo(safeUserInfo)
  } else if (app && app.globalData) {
    app.globalData.userInfo = safeUserInfo
  }

  return safeUserInfo
}

async function ensureUser() {
  try {
    const result = await cloudUtil.callCloudFunction({
      name: 'checkAuthStatus',
      data: {}
    })

    if (result && result.code === 0 && result.data) {
      return syncAppUserInfo(result.data)
    }
  } catch (error) {
    console.warn('checkAuthStatus fallback to local mock', error)
  }

  const db = mockStore.getDb()
  return syncAppUserInfo({
    ...db.user,
    profileCompleted: buildProfileCompleted(db.user)
  })
}

async function getUserInfo() {
  const app = getAppInstance()
  const cachedUserInfo = app && app.globalData ? app.globalData.userInfo : null

  if (cachedUserInfo) {
    return normalizeUserInfo(cachedUserInfo)
  }

  return ensureUser()
}

async function updateUserProfile(payload) {
  const nickName = String(payload && payload.nickName || '').trim()
  const avatarUrl = String(payload && payload.avatarUrl || '').trim()

  if (!nickName) {
    throw new Error('昵称不能为空')
  }

  if (nickName.length > 20) {
    throw new Error('昵称不能超过 20 个字符')
  }

  if (avatarUrl && avatarUrl.length > 2048) {
    throw new Error('头像地址过长')
  }

  if (avatarUrl && !/^https:\/\//.test(avatarUrl)) {
    throw new Error('头像地址不合法')
  }

  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'updateUserProfile',
      data: {
        nickName,
        avatarUrl
      }
    })

    if (result && result.code === 0 && result.data) {
      return syncAppUserInfo(result.data)
    }

    throw new Error(result && result.message ? result.message : '更新个人资料失败')
  }

  const nextDb = mockStore.updateDb((currentDb) => ({
    ...currentDb,
    user: {
      ...currentDb.user,
      nickName,
      avatarUrl,
      updateTime: new Date().toISOString()
    }
  }))

  return syncAppUserInfo({
    ...nextDb.user,
    profileCompleted: true
  })
}

module.exports = {
  ensureUser,
  getUserInfo,
  updateUserProfile
}
