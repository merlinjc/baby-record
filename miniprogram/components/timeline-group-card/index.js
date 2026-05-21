Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    group: {
      type: Object,
      value: null
    }
  },

  methods: {
    handlePhotoTap(event) {
      const id = event.currentTarget.dataset.id

      if (!id) {
        return
      }

      this.triggerEvent('phototap', { id })
    }
  }
})
