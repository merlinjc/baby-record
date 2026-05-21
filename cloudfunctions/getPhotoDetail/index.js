const { ensureUser, verifyBabyAccess, canViewPhoto, canManagePhoto, canManageBaby } = require('../_shared/auth')
const { cloud, db } = require('../_shared/db')

async function attachTempFileUrl(photo) {
  const fileID = photo.fileID || photo.filePath

  if (!fileID) {
    return photo
  }

  const tempResult = await cloud.getTempFileURL({
    fileList: [fileID]
  })
  const tempFile = (tempResult.fileList || [])[0] || {}

  return {
    ...photo,
    filePath: tempFile.tempFileURL || tempFile.download_url || photo.filePath || ''
  }
}

exports.main = async (event) => {
  try {
    const { wxContext } = await ensureUser()
    const { photoId } = event

    if (!photoId) {
      return {
        code: -1,
        message: 'photoId 不能为空'
      }
    }

    const result = await db.collection('photos').doc(photoId).get()
    const photo = result.data

    if (!photo || photo.deleted) {
      return {
        code: -1,
        message: '照片不存在'
      }
    }

    const baby = await verifyBabyAccess(photo.babyId, wxContext.OPENID)

    if (!canViewPhoto(photo, baby, wxContext.OPENID)) {
      return {
        code: -1,
        message: '无权查看该照片'
      }
    }

    const hydratedPhoto = await attachTempFileUrl(photo)

    return {
      code: 0,
      message: '获取成功',
      data: {
        ...hydratedPhoto,
        canManage: canManagePhoto(photo, baby, wxContext.OPENID),
        canManageBaby: canManageBaby(baby, wxContext.OPENID)
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '获取照片详情失败'
    }
  }
}
