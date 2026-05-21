const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')
const dateUtil = require('../utils/dateUtil')

const COLLECTION_NAME = 'photos'
const CLOUD_PAGE_SIZE = 50
const DEFAULT_PAGE_SIZE = 20

function getLocalMemberRole(baby, openid) {
  if (!baby || !openid) {
    return ''
  }

  const member = (baby.members || []).find((item) => item.userId === openid)
  return member ? (member.role || 'member') : ''
}

function canManageLocalBaby(baby, openid) {
  const role = getLocalMemberRole(baby, openid)
  return role === 'creator' || role === 'admin'
}

function canUploadLocalPhoto(baby, openid) {
  const role = getLocalMemberRole(baby, openid)
  return role === 'creator' || role === 'admin' || role === 'member'
}

function canViewLocalPhoto(photo, baby, openid) {
  if (!photo || photo.deleted) {
    return false
  }

  const role = getLocalMemberRole(baby, openid)

  if (!role) {
    return false
  }

  if (canManageLocalBaby(baby, openid) || photo.uploaderOpenId === openid || photo._openid === openid) {
    return true
  }

  if (photo.permission === 'private') {
    return false
  }

  if (photo.permission === 'admin') {
    return role === 'creator' || role === 'admin'
  }

  return true
}

function canManageLocalPhoto(photo, baby, openid) {
  return !!photo && (canManageLocalBaby(baby, openid) || photo.uploaderOpenId === openid || photo._openid === openid)
}

function sortVisiblePhotos(list, baby, openid) {
  return list
    .filter((item) => canViewLocalPhoto(item, baby, openid))
    .sort((a, b) => new Date(b.photoDate) - new Date(a.photoDate) || new Date(b.createTime) - new Date(a.createTime))
}

function normalizeLocationName(locationName) {
  return (locationName || '').trim()
}

async function requestCloudPhotos(babyId, page, pageSize) {
  const result = await cloudUtil.callCloudFunction({
    name: 'getPhotos',
    data: {
      babyId,
      page,
      pageSize
    }
  })

  if (!result || result.code !== 0 || !result.data) {
    throw new Error(result && result.message ? result.message : '获取照片失败')
  }

  return {
    list: result.data.list || [],
    total: result.data.total || 0,
    page: result.data.page || page,
    pageSize: result.data.pageSize || pageSize
  }
}

async function listCloudPhotosByBaby(babyId) {
  let page = 1
  let total = 0
  let allPhotos = []

  do {
    const result = await requestCloudPhotos(babyId, page, CLOUD_PAGE_SIZE)
    total = result.total || result.list.length
    allPhotos = allPhotos.concat(result.list)
    page += 1
  } while (allPhotos.length < total)

  return allPhotos
}

async function listPhotosByBaby(babyId) {
  if (cloudUtil.isCloudReady()) {
    try {
      return await listCloudPhotosByBaby(babyId)
    } catch (error) {
      console.warn('getPhotos fallback to local query', error)
    }
  }

  const db = cloudUtil.getDatabase()

  if (db) {
    try {
      const result = await db.collection(COLLECTION_NAME).where({
        babyId,
        deleted: false
      }).orderBy('photoDate', 'desc').orderBy('createTime', 'desc').get()
      return result.data || []
    } catch (error) {
      console.warn('listPhotosByBaby fallback to local mock', error)
    }
  }

  const localDb = mockStore.getDb()
  const baby = localDb.babies.find((item) => item._id === babyId)
  return sortVisiblePhotos(localDb.photos.filter((item) => item.babyId === babyId), baby, localDb.user._openid)
}

async function listPhotosPageByBaby(babyId, options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.max(1, Number(options.pageSize) || DEFAULT_PAGE_SIZE)

  if (cloudUtil.isCloudReady()) {
    try {
      return await requestCloudPhotos(babyId, page, pageSize)
    } catch (error) {
      console.warn('getPhotos page fallback to local query', error)
    }
  }

  const photos = await listPhotosByBaby(babyId)
  const start = (page - 1) * pageSize
  const list = photos.slice(start, start + pageSize)

  return {
    list,
    total: photos.length,
    page,
    pageSize
  }
}

async function createPhotos(payload) {
  const photoDate = payload.photoDate || dateUtil.formatDate()
  const onProgress = typeof payload.onProgress === 'function' ? payload.onProgress : null

  if (cloudUtil.isCloudReady()) {
    const orphanedFileIds = []

    try {
      const uploads = []

      for (let index = 0; index < payload.files.length; index += 1) {
        const filePath = payload.files[index]
        const extension = (filePath.split('.').pop() || 'jpg').toLowerCase()
        const cloudPath = 'baby-photos/' + payload.babyId + '/' + Date.now() + '_' + index + '.' + extension
        const uploadTask = cloudUtil.uploadFile({
          cloudPath,
          filePath
        })

        if (onProgress && uploadTask && typeof uploadTask.onProgressUpdate === 'function') {
          uploadTask.onProgressUpdate((progressEvent) => {
            const totalProgress = ((index + (progressEvent.progress || 0) / 100) / payload.files.length) * 100
            onProgress({
              progress: Math.min(100, Math.max(0, Math.round(totalProgress))),
              currentIndex: index + 1,
              total: payload.files.length,
              currentProgress: progressEvent.progress || 0
            })
          })
        }

        const uploadResult = await uploadTask
        orphanedFileIds.push(uploadResult.fileID)

        const result = await cloudUtil.callCloudFunction({
          name: 'uploadPhoto',
          data: {
            babyId: payload.babyId,
            cloudFileID: uploadResult.fileID,
            filePath,
            description: payload.description,
            photoDate,
            permission: payload.permission,
            locationName: payload.locationName
          }
        })

        if (!result || result.code !== 0 || !result.data) {
          throw new Error(result && result.message ? result.message : '上传失败')
        }

        orphanedFileIds.pop()
        uploads.push(result.data)

        if (onProgress) {
          onProgress({
            progress: Math.round((uploads.length / payload.files.length) * 100),
            currentIndex: uploads.length,
            total: payload.files.length,
            currentProgress: 100
          })
        }
      }

      return uploads
    } catch (error) {
      if (orphanedFileIds.length) {
        try {
          await cloudUtil.deleteFile(orphanedFileIds)
        } catch (cleanupError) {
          console.warn('delete orphaned cloud files failed', cleanupError)
        }
      }

      throw error
    }
  }

  const localDb = mockStore.getDb()
  const currentBaby = localDb.babies.find((item) => item._id === payload.babyId)

  if (!currentBaby) {
    throw new Error('宝宝档案不存在')
  }

  if (!canUploadLocalPhoto(currentBaby, localDb.user._openid)) {
    throw new Error('当前角色没有上传权限')
  }

  const now = new Date().toISOString()
  const records = payload.files.map((filePath, index) => ({
    _id: mockStore.createId('photo'),
    babyId: payload.babyId,
    uploaderId: localDb.user._id,
    uploaderOpenId: localDb.user._openid,
    filePath,
    description: payload.description,
    photoDate,
    permission: payload.permission || 'family',
    locationName: payload.locationName || '',
    deleted: false,
    sortIndex: index,
    createTime: now,
    updateTime: now
  }))

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    photos: records.concat(currentDb.photos)
  }))

  if (onProgress) {
    onProgress({
      progress: 100,
      currentIndex: payload.files.length,
      total: payload.files.length,
      currentProgress: 100
    })
  }

  return records
}

async function getPhotoDetail(photoId) {
  if (cloudUtil.isCloudReady()) {
    try {
      const result = await cloudUtil.callCloudFunction({
        name: 'getPhotoDetail',
        data: { photoId }
      })

      if (result && result.code === 0) {
        return result.data || null
      }
    } catch (error) {
      console.warn('getPhotoDetail fallback to local query', error)
    }
  }

  const db = cloudUtil.getDatabase()

  if (db) {
    try {
      const result = await db.collection(COLLECTION_NAME).doc(photoId).get()
      return result.data && !result.data.deleted ? result.data : null
    } catch (error) {
      console.warn('getPhotoDetail fallback to local mock', error)
    }
  }

  const localDb = mockStore.getDb()
  const photo = localDb.photos.find((item) => item._id === photoId)

  if (!photo || photo.deleted) {
    return null
  }

  const baby = localDb.babies.find((item) => item._id === photo.babyId)

  if (!canViewLocalPhoto(photo, baby, localDb.user._openid)) {
    return null
  }

  return {
    ...photo,
    canManage: canManageLocalPhoto(photo, baby, localDb.user._openid),
    canManageBaby: canManageLocalBaby(baby, localDb.user._openid)
  }
}

async function deletePhoto(photoId) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'deletePhoto',
      data: { photoId }
    })

    if (result && result.code === 0) {
      return result
    }

    throw new Error(result && result.message ? result.message : '删除失败')
  }

  const localDb = mockStore.getDb()
  const photo = localDb.photos.find((item) => item._id === photoId)

  if (!photo || photo.deleted) {
    throw new Error('照片不存在')
  }

  const baby = localDb.babies.find((item) => item._id === photo.babyId)

  if (!canManageLocalPhoto(photo, baby, localDb.user._openid)) {
    throw new Error('无权删除该照片')
  }

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    photos: currentDb.photos.map((item) => item._id === photoId ? {
      ...item,
      deleted: true,
      deletedTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    } : item)
  }))
}

async function getDeletedPhotos(babyId) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'getDeletedPhotos',
      data: { babyId }
    })

    if (result && result.code === 0) {
      return result.data || []
    }

    throw new Error(result && result.message ? result.message : '获取回收站失败')
  }

  const localDb = mockStore.getDb()
  const baby = localDb.babies.find((item) => item._id === babyId)

  return localDb.photos
    .filter((item) => item.babyId === babyId && item.deleted)
    .map((item) => ({
      ...item,
      canRestore: canManageLocalPhoto(item, baby, localDb.user._openid)
    }))
    .sort((a, b) => new Date(b.deletedTime || b.updateTime) - new Date(a.deletedTime || a.updateTime))
}

async function restorePhoto(photoId) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'restorePhoto',
      data: { photoId }
    })

    if (result && result.code === 0) {
      return result
    }

    throw new Error(result && result.message ? result.message : '恢复失败')
  }

  const localDb = mockStore.getDb()
  const photo = localDb.photos.find((item) => item._id === photoId)

  if (!photo || !photo.deleted) {
    throw new Error('照片不存在或未删除')
  }

  const baby = localDb.babies.find((item) => item._id === photo.babyId)

  if (!canManageLocalPhoto(photo, baby, localDb.user._openid)) {
    throw new Error('无权恢复该照片')
  }

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    photos: currentDb.photos.map((item) => item._id === photoId ? {
      ...item,
      deleted: false,
      deletedTime: null,
      updateTime: new Date().toISOString()
    } : item)
  }))
}

async function getTimelineGroups(babyId) {
  const photos = await listPhotosByBaby(babyId)
  return dateUtil.groupPhotosByMonth(photos)
}

async function listLocationNames(babyId) {
  const photos = await listPhotosByBaby(babyId)
  const locationMap = {}

  photos.forEach((photo) => {
    const locationName = normalizeLocationName(photo.locationName)

    if (!locationName) {
      return
    }

    locationMap[locationName] = (locationMap[locationName] || 0) + 1
  })

  return Object.keys(locationMap)
    .sort((left, right) => locationMap[right] - locationMap[left] || left.localeCompare(right, 'zh-Hans-CN'))
    .map((name) => ({
      name,
      count: locationMap[name]
    }))
}

async function listPhotosByLocation(babyId, locationName) {
  const photos = await listPhotosByBaby(babyId)
  const normalizedLocationName = normalizeLocationName(locationName)

  if (!normalizedLocationName) {
    return photos
  }

  return photos.filter((photo) => normalizeLocationName(photo.locationName) === normalizedLocationName)
}

async function getPhotosByTime(params) {
  const photos = await listPhotosByBaby(params.babyId)
  return {
    groups: dateUtil.groupPhotosByTime(photos, params.groupBy, {
      year: params.year,
      month: params.month
    })
  }
}

module.exports = {
  listPhotosByBaby,
  listPhotosPageByBaby,
  createPhotos,
  getPhotoDetail,
  deletePhoto,
  getDeletedPhotos,
  restorePhoto,
  getTimelineGroups,
  listLocationNames,
  listPhotosByLocation,
  getPhotosByTime
}
