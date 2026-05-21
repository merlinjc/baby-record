const { ensureUser, verifyBabyAccess, canViewPhoto } = require('../_shared/auth')
const { cloud, db } = require('../_shared/db')

async function attachTempFileUrls(photos) {
  const fileList = photos
    .map((photo) => photo.fileID)
    .filter(Boolean)

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
    const { babyId, page = 1, pageSize = 20 } = event

    if (!babyId) {
      return {
        code: -1,
        message: 'babyId 不能为空'
      }
    }

    const baby = await verifyBabyAccess(babyId, wxContext.OPENID)

    const safePage = Math.max(1, Number(page) || 1)
    const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20))

    const collection = db.collection('photos').where({
      babyId,
      deleted: false
    })

    const listResult = await collection
      .orderBy('photoDate', 'desc')
      .orderBy('createTime', 'desc')
      .get()

    const hydratedPhotos = await attachTempFileUrls(listResult.data || [])
    const visiblePhotos = hydratedPhotos.filter((photo) => canViewPhoto(photo, baby, wxContext.OPENID))
    const start = (safePage - 1) * safePageSize
    const pageList = visiblePhotos.slice(start, start + safePageSize)

    return {
      code: 0,
      message: '获取成功',
      data: {
        list: pageList,
        total: visiblePhotos.length,
        page: safePage,
        pageSize: safePageSize
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '获取照片列表失败'
    }
  }
}
