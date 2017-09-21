<script>
  export default{
    name: 'znlButton',
    props: {
      size: '',
      type: '',
      disabled: {
        type: Boolean,
        default: false
      },
      isShow: {
        type: Boolean,
        default: false
      }
    },

    render (createElement) {
      if (this.isShow) {
        return createElement(
        'el-button',
          {
            props: {
              type: this.type,
              size: this.size,
              disabled: this.disabled
            },
            on: {
              click: this.click
            }
          },
        this.$slots.default
      )
      }
    },
    methods: {
      click () {
        this.$emit('click')
      }
    }
  }
</script>

