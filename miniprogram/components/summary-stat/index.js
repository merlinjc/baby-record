Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    value: {
      type: String,
      value: ''
    },
    label: {
      type: String,
      value: ''
    },
    extraClass: {
      type: String,
      value: ''
    }
  }
})
