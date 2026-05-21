function isCloudReady() {
  return !!(wx.cloud && typeof wx.cloud.callFunction === 'function')
}

function normalizeCloudResult(response) {
  if (response && response.result !== undefined) {
    return response.result
  }
  return response
}

function callCloudFunction(options) {
  if (!isCloudReady()) {
    return Promise.reject(new Error('当前环境不支持云开发'))
  }

  return wx.cloud.callFunction(options).then(normalizeCloudResult)
}

function getDatabase() {
  if (!isCloudReady() || typeof wx.cloud.database !== 'function') {
    return null
  }

  return wx.cloud.database()
}

function uploadFile(options) {
  if (!isCloudReady() || typeof wx.cloud.uploadFile !== 'function') {
    return Promise.reject(new Error('当前环境不支持云存储'))
  }

  return wx.cloud.uploadFile(options)
}

function deleteFile(fileList) {
  if (!isCloudReady() || typeof wx.cloud.deleteFile !== 'function') {
    return Promise.reject(new Error('当前环境不支持云存储删除'))
  }

  return wx.cloud.deleteFile({ fileList })
}

module.exports = {
  isCloudReady,
  normalizeCloudResult,
  callCloudFunction,
  getDatabase,
  uploadFile,
  deleteFile
}
