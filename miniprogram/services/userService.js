const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')

async function ensureUser() {
  try {
    const result = await cloudUtil.callCloudFunction({
      name: 'checkAuthStatus',
      data: {}
    })

    if (result && result.code === 0 && result.data) {
      return result.data
    }
  } catch (error) {
    console.warn('checkAuthStatus fallback to local mock', error)
  }

  const db = mockStore.getDb()
  return db.user
}

async function getUserInfo() {
  return ensureUser()
}

module.exports = {
  ensureUser,
  getUserInfo
}
