Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },

  properties: {
    extraClass: {
      type: String,
      value: ''
    },
    chip: {
      type: String,
      value: ''
    },
    accent: {
      type: String,
      value: ''
    },
    kicker: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    subtitle: {
      type: String,
      value: ''
    },
    showOrbs: {
      type: Boolean,
      value: true
    }
  }
})
