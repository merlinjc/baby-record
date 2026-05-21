function resolveSelectedIndex(list) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]

  if (!currentPage) {
    return 0
  }

  const currentPath = '/' + currentPage.route
  const selected = list.findIndex((item) => item.pagePath === currentPath)
  return selected >= 0 ? selected : 0
}

Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconName: 'house'
      },
      {
        pagePath: '/pages/photo-time/photo-time',
        text: '时间轴',
        iconName: 'calendar-range'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        iconName: 'circle-user-round'
      }
    ]
  },

  methods: {
    syncSelected() {
      this.setData({
        selected: resolveSelectedIndex(this.data.list)
      })
    },

    switchTab(event) {
      const detail = event.detail || {}
      const path = detail.path
      const index = detail.index

      if (!path) {
        return
      }

      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  },

  lifetimes: {
    attached() {
      this.syncSelected()
    },

    ready() {
      this.syncSelected()
    }
  },

  pageLifetimes: {
    show() {
      this.syncSelected()
    }
  }
})
