Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },

  properties: {
    title: {
      type: String,
      value: ''
    },
    caption: {
      type: String,
      value: ''
    },
    chip: {
      type: String,
      value: ''
    }
  }
})
