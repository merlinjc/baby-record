Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    items: {
      type: Array,
      value: []
    },
    extraClass: {
      type: String,
      value: ''
    }
  }
})
