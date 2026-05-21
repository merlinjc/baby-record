Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    resolvedIcon: ''
  },

  properties: {
    item: {
      type: Object,
      value: null
    },
    active: {
      type: Boolean,
      value: false
    },
    index: {
      type: Number,
      value: 0
    }
  },

  observers: {
    'item, active': function observeItem(item, active) {
      this.setData({
        resolvedIcon: this.resolveIcon(item, active)
      })
    }
  },

  methods: {
    resolveIcon(item, active) {
      const currentItem = item || {}

      if (active && currentItem.activeIcon) {
        return currentItem.activeIcon
      }

      if (!active && currentItem.icon) {
        return currentItem.icon
      }

      if (!currentItem.iconName) {
        return ''
      }

      const variant = active
        ? currentItem.activeVariant || 'active'
        : currentItem.iconVariant || 'inactive'

      return '/assets/icons/lucide/' + currentItem.iconName + '-' + variant + '.png'
    },

    handleTap() {
      const item = this.data.item || {}
      if (!item.pagePath) {
        return
      }

      this.triggerEvent('tap', {
        path: item.pagePath,
        index: this.data.index
      })
    }
  }
})
