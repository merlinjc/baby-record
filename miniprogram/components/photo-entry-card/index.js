Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    photo: {
      type: Object,
      value: null
    }
  },

  methods: {
    handleTap() {
      const photo = this.data.photo || {}
      if (!photo._id) {
        return
      }

      this.triggerEvent('tap', { id: photo._id })
    }
  }
})
