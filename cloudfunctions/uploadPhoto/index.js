const { ensureUser, verifyBabyAccess } = require('../_shared/auth')
const { cloud, db } = require('../_shared/db')

exports.main = async (event) => {
  try {
    const { user, wxContext } = await ensureUser()
    const {
      babyId,
      cloudFileID,
      description = '',
      photoDate,
      filePath = '',
      permission = 'family',
      locationName = ''
    } = event

    if (!babyId || !cloudFileID || !photoDate) {
      return {
        code: -1,
        message: 'babyId、cloudFileID、photoDate 不能为空'
      }
    }

    await verifyBabyAccess(babyId, wxContext.OPENID)

    const now = db.serverDate()
    const fileUrlResult = await cloud.getTempFileURL({
      fileList: [cloudFileID]
    })

    const tempFile = (fileUrlResult.fileList && fileUrlResult.fileList[0]) || {}
    const photo = {
      babyId,
      uploaderId: user._id,
      uploaderOpenId: wxContext.OPENID,
      fileID: cloudFileID,
      filePath: cloudFileID,
      description,
      permission,
      locationName,
      deleted: false,
      deletedTime: null,
      tags: [],
      isFavorite: false,
      photoDate,
      createTime: now,
      updateTime: now
    }

    const addResult = await db.collection('photos').add({
      data: photo
    })

    return {
      code: 0,
      message: '上传成功',
      data: {
        _id: addResult._id,
        ...photo,
        filePath: tempFile.tempFileURL || cloudFileID,
        originalFilePath: filePath
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '上传照片失败'
    }
  }
}
