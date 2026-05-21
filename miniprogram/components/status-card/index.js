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
    desc: {
      type: String,
      value: ''
    },
    loading: {
      type: Boolean,
      value: false
    },
    compact: {
      type: Boolean,
      value: false
    },
    extraClass: {
      type: String,
      value: ''
    }
  }
})
