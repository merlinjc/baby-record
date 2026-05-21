const { ensureUser, verifyBabyAccess, canManagePhoto } = require('../_shared/auth')
const { cloud, db } = require('../_shared/db')

async function attachTempFileUrls(photos) {
  const fileList = photos.map((photo) => photo.fileID).filter(Boolean)

  if (!fileList.length) {
    return photos
  }

  const tempResult = await cloud.getTempFileURL({ fileList })
  const tempUrlMap = {}

  ;(tempResult.fileList || []).forEach((item) => {
    tempUrlMap[item.fileID] = item.tempFileURL || item.download_url || ''
  })

  return photos.map((photo) => ({
    ...photo,
    filePath: tempUrlMap[photo.fileID] || photo.filePath || ''
  }))
}

exports.main = async (event) => {
  try {
    const { wxContext } = await ensureUser()
    const { babyId } = event

    if (!babyId) {
      return {
        code: -1,
        message: 'babyId 不能为空'
      }
    }

    const baby = await verifyBabyAccess(babyId, wxContext.OPENID)
    const result = await db.collection('photos').where({
      babyId,
      deleted: true
    }).orderBy('deletedTime', 'desc').get()

    const manageablePhotos = (result.data || []).filter((photo) => {
      return canManagePhoto(photo, baby, wxContext.OPENID)
    })

    const photos = await attachTempFileUrls(manageablePhotos)

    return {
      code: 0,
      message: '获取成功',
      data: photos.map((photo) => ({
        ...photo,
        canRestore: true
      }))
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '获取回收站失败'
    }
  }
}
