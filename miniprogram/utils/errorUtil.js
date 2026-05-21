function showError(message) {
  wx.showToast({
    title: message || '操作失败',
    icon: 'none'
  })
}

function showSuccess(message) {
  wx.showToast({
    title: message || '操作成功',
    icon: 'success'
  })
}

module.exports = {
  showError,
  showSuccess
}
