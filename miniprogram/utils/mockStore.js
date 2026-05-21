const STORAGE_KEY = 'baby-photo-record-db'

function createDefaultDb() {
  return {
    user: {
      _id: 'local-user',
      _openid: 'local-openid',
      nickName: '成长记录者',
      avatarUrl: '',
      babyProfiles: [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    currentBabyId: '',
    babies: [],
    photos: [],
    invitations: [],
    feedbacks: []
  }
}

function getDb() {
  const db = wx.getStorageSync(STORAGE_KEY)

  if (db && db.user) {
    return {
      invitations: [],
      feedbacks: [],
      ...db
    }
  }

  const initialDb = createDefaultDb()
  wx.setStorageSync(STORAGE_KEY, initialDb)
  return initialDb
}

function setDb(nextDb) {
  wx.setStorageSync(STORAGE_KEY, nextDb)
  return nextDb
}

function updateDb(updater) {
  const currentDb = getDb()
  const nextDb = updater(currentDb)
  return setDb(nextDb)
}

function createId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
}

module.exports = {
  getDb,
  setDb,
  updateDb,
  createId
}
