function pad(value) {
  return value < 10 ? '0' + value : '' + value
}

function formatDate(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date()
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return year + '-' + month + '-' + day
}

function formatDateLabel(dateInput) {
  const date = new Date(dateInput)
  return date.getFullYear() + '年' + pad(date.getMonth() + 1) + '月' + pad(date.getDate()) + '日'
}

function formatMonthLabel(dateInput) {
  const date = new Date(dateInput)
  return date.getFullYear() + '年' + pad(date.getMonth() + 1) + '月'
}

function formatYearLabel(dateInput) {
  const date = new Date(dateInput)
  return date.getFullYear() + '年'
}

function getAgeLabel(birthday) {
  if (!birthday) {
    return '未填写生日'
  }

  const birth = new Date(birthday)
  const now = new Date()
  const diffMonth = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

  if (diffMonth < 1) {
    const days = Math.max(0, Math.floor((now - birth) / (24 * 60 * 60 * 1000)))
    return days + '天'
  }

  if (diffMonth < 24) {
    return diffMonth + '个月'
  }

  return Math.floor(diffMonth / 12) + '岁'
}

function sortByPhotoDateDesc(list) {
  return list.slice().sort((a, b) => new Date(b.photoDate) - new Date(a.photoDate) || new Date(b.createTime) - new Date(a.createTime))
}

function groupPhotosByMonth(photos) {
  const bucket = {}

  photos.forEach((photo) => {
    const label = formatMonthLabel(photo.photoDate)
    if (!bucket[label]) {
      bucket[label] = []
    }
    bucket[label].push(photo)
  })

  return Object.keys(bucket).map((label) => {
    const items = sortByPhotoDateDesc(bucket[label])
    return {
      label,
      count: items.length,
      cover: items[0] ? items[0].filePath : '',
      items
    }
  }).sort((a, b) => new Date(b.items[0].photoDate) - new Date(a.items[0].photoDate))
}

function groupPhotosByTime(photos, groupBy, filters = {}) {
  const sortedPhotos = sortByPhotoDateDesc(photos)
  const yearFilter = filters.year ? String(filters.year) : ''
  const monthFilter = filters.month ? pad(Number(filters.month)) : ''
  const bucket = {}

  sortedPhotos.forEach((photo) => {
    const dateKey = formatDate(photo.photoDate)
    const year = dateKey.slice(0, 4)
    const month = dateKey.slice(5, 7)
    const day = dateKey.slice(8, 10)

    if (yearFilter && year !== yearFilter) {
      return
    }

    if (monthFilter && month !== monthFilter) {
      return
    }

    let key = ''
    let label = ''

    if (groupBy === 'year') {
      key = year
      label = formatYearLabel(photo.photoDate)
    } else if (groupBy === 'month') {
      key = year + '-' + month
      label = formatMonthLabel(photo.photoDate)
    } else {
      key = year + '-' + month + '-' + day
      label = formatDateLabel(photo.photoDate)
    }

    if (!bucket[key]) {
      bucket[key] = {
        key,
        label,
        count: 0,
        cover: photo.filePath || '',
        photos: []
      }
    }

    bucket[key].photos.push(photo)
    bucket[key].count += 1
  })

  return Object.keys(bucket).map((key) => ({
    key,
    label: bucket[key].label,
    count: bucket[key].count,
    cover: bucket[key].cover,
    photos: bucket[key].photos
  })).sort((a, b) => new Date(b.photos[0].photoDate) - new Date(a.photos[0].photoDate))
}

module.exports = {
  formatDate,
  formatDateLabel,
  formatMonthLabel,
  formatYearLabel,
  getAgeLabel,
  groupPhotosByMonth,
  groupPhotosByTime,
  sortByPhotoDateDesc
}
