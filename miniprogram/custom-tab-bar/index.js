Component({
  data: {
    selected: 0,
    color: '#8D6E63',
    selectedColor: '#8B4513',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页'
      },
      {
        pagePath: '/pages/photo-time/photo-time',
        text: '时间轴'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的'
      }
    ]
  },

  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset

      if (!path) {
        return
      }

      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  },

  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentPath = '/' + currentPage.route
      const selected = this.data.list.findIndex((item) => item.pagePath === currentPath)

      this.setData({ selected: selected >= 0 ? selected : 0 })
    }
  }
})
