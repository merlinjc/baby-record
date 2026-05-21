Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    icon: {
      type: String,
      value: ''
    },
    iconName: {
      type: String,
      value: ''
    },
    iconVariant: {
      type: String,
      value: 'active'
    },
    label: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    },
    meta: {
      type: String,
      value: ''
    },
    extraClass: {
      type: String,
      value: ''
    }
  },

  observers: {
    'icon, iconName, iconVariant': function observeIcon(icon, iconName, iconVariant) {
      this.setData({
        resolvedIcon: this.resolveIcon(icon, iconName, iconVariant)
      })
    }
  },

  data: {
    resolvedIcon: ''
  },

  methods: {
    resolveIcon(icon, iconName, iconVariant) {
      if (icon) {
        return icon
      }

      if (!iconName) {
        return ''
      }

      const variant = iconVariant || 'active'
      return '/assets/icons/lucide/' + iconName + '-' + variant + '.png'
    }
  }
})
