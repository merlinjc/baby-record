const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')

const CURRENT_BABY_KEY = 'baby-photo-record-current-baby-id'
const COLLECTION_NAME = 'baby_profiles'

function getCurrentBabyIdFromStorage() {
  return wx.getStorageSync(CURRENT_BABY_KEY) || ''
}

function setCurrentBabyIdToStorage(babyId) {
  wx.setStorageSync(CURRENT_BABY_KEY, babyId || '')
}

async function listBabyProfiles() {
  if (cloudUtil.isCloudReady()) {
    try {
      const result = await cloudUtil.callCloudFunction({
        name: 'getBabyProfiles',
        data: {}
      })

      if (result && result.code === 0) {
        return result.data || []
      }
    } catch (error) {
      console.warn('getBabyProfiles fallback to local query', error)
    }
  }

  const db = cloudUtil.getDatabase()

  if (db) {
    try {
      const result = await db.collection(COLLECTION_NAME).orderBy('createTime', 'desc').get()
      return result.data || []
    } catch (error) {
      console.warn('listBabyProfiles fallback to local mock', error)
    }
  }

  const localDb = mockStore.getDb()
  return localDb.babies.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
}

async function createBabyProfile(payload) {
  const localDb = mockStore.getDb()

  if (cloudUtil.isCloudReady()) {
    try {
      const result = await cloudUtil.callCloudFunction({
        name: 'createBabyProfile',
        data: payload
      })

      if (result && result.code === 0 && result.data) {
        setCurrentBabyIdToStorage(result.data._id)
        return result.data
      }
    } catch (error) {
      console.warn('createBabyProfile fallback to local db', error)
    }
  }

  const db = cloudUtil.getDatabase()
  const now = new Date()

  if (db) {
    try {
      const creatorMember = {
        userId: localDb.user._openid,
        role: 'creator',
        relationship: '',
        joinTime: now
      }

      const result = await db.collection(COLLECTION_NAME).add({
        data: {
          name: payload.name,
          birthday: payload.birthday,
          gender: payload.gender,
          avatar: '',
          members: [creatorMember],
          createTime: now,
          updateTime: now
        }
      })

      const baby = {
        _id: result._id,
        name: payload.name,
        birthday: payload.birthday,
        gender: payload.gender,
        avatar: '',
        members: [creatorMember],
        createTime: now,
        updateTime: now
      }

      setCurrentBabyIdToStorage(baby._id)
      return baby
    } catch (error) {
      console.warn('createBabyProfile fallback to local mock', error)
    }
  }

  const baby = {
    _id: mockStore.createId('baby'),
    name: payload.name,
    birthday: payload.birthday,
    gender: payload.gender,
    avatar: '',
    members: [{
      userId: localDb.user._openid,
      role: 'creator',
      relationship: '',
      joinTime: now.toISOString()
    }],
    createTime: now.toISOString(),
    updateTime: now.toISOString()
  }

  const nextDb = mockStore.updateDb((currentDb) => {
    return {
      user: {
        ...currentDb.user,
        babyProfiles: currentDb.user.babyProfiles.concat(baby._id),
        updateTime: now.toISOString()
      },
      currentBabyId: baby._id,
      babies: currentDb.babies.concat(baby),
      photos: currentDb.photos
    }
  })

  setCurrentBabyIdToStorage(baby._id)
  return nextDb.babies.find((item) => item._id === baby._id)
}

async function setCurrentBaby(babyId) {
  setCurrentBabyIdToStorage(babyId)
  const babies = await listBabyProfiles()
  return babies.find((item) => item._id === babyId) || null
}

async function getCurrentBaby() {
  const babies = await listBabyProfiles()
  const currentBabyId = getCurrentBabyIdFromStorage()
  const currentBaby = babies.find((item) => item._id === currentBabyId) || babies[0] || null

  if (currentBaby && currentBaby._id !== currentBabyId) {
    setCurrentBabyIdToStorage(currentBaby._id)
  }

  return currentBaby
}

module.exports = {
  listBabyProfiles,
  createBabyProfile,
  setCurrentBaby,
  getCurrentBaby
}
