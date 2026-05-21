const { ensureUser, verifyBabyAccess, canManagePhoto } = require('../_shared/auth')
const { db } = require('../_shared/db')

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

    const photoResult = await db.collection('photos').doc(photoId).get()
    const photo = photoResult.data

    if (!photo || !photo.deleted) {
      return {
        code: -1,
        message: '照片不存在或未删除'
      }
    }

    const baby = await verifyBabyAccess(photo.babyId, wxContext.OPENID)

    if (!canManagePhoto(photo, baby, wxContext.OPENID)) {
      return {
        code: -1,
        message: '无权恢复该照片'
      }
    }

    await db.collection('photos').doc(photoId).update({
      data: {
        deleted: false,
        deletedTime: null,
        updateTime: db.serverDate()
      }
    })

    return {
      code: 0,
      message: '已恢复照片'
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '恢复照片失败'
    }
  }
}
