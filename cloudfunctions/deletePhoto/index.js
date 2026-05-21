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

    if (!photo || photo.deleted) {
      return {
        code: -1,
        message: '照片不存在'
      }
    }

    const baby = await verifyBabyAccess(photo.babyId, wxContext.OPENID)

    if (!canManagePhoto(photo, baby, wxContext.OPENID)) {
      return {
        code: -1,
        message: '无权删除该照片'
      }
    }

    await db.collection('photos').doc(photoId).update({
      data: {
        deleted: true,
        deletedTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      code: 0,
      message: '已移入回收站'
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '删除照片失败'
    }
  }
}
