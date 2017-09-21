<template>
   <el-dialog :title="title"
   :visible.sync="p_visible"
   @open="$emit('open')"
   @close="$emit('close')" :size="size" v-move-to.body>
      <slot></slot>
      <slot name="footer"></slot>
  </el-dialog>
</template>

<script>
import {mixin as propSyncMixin} from './assets/scripts/mixins/propSync'
import {mixin as moveToMixin} from './assets/scripts/directives/moveTo'

export default {
  name: 'znlDialog',
  mixins: [propSyncMixin, moveToMixin],
  data () {
    return {
    }
  },
  props: {
    title: String,
    visible: { // 是否弹出
      type: Boolean,
      default: false,
      propsync: true
    },
    size: {
      type: String,
      default: 'small'
    }
  },
  methods: {
    closed () {
      console.log('关闭')
    }
  }
}
</script>
<style>
.el-dialog{
  padding-bottom: 10px;
}
.el-dialog__header {
  padding: 15px 16.7px 0 20px;
  height: 24px;
  color: #4D4D4D;
}
 .el-dialog__header .el-dialog__title {
  font-size: 18px;
}
.el-dialog__body {
  padding: 0 10px !important;
}
.el-dialog__body .base-flex-grid {
  border: 1px solid #DFE2E5 !important;
}
.dialog-footer {
  padding: 30px 0 10px 0 !important;
  display: flex;
  justify-content: flex-end;
  margin: 0 !important;
}
.dialog-footer .el-button--primary-rev:hover{
  background-color: #F5F5F5;
}
.dialog-footer .el-button--mini {
    height: 30px !important;
    width: 80px;
    color: #999;
    border-color: #DFE2E5;
    margin-left: 20px;
  }
.dialog-footer .el-button--mini:first-of-type {
  margin-right: 18px;
}
.dialog-footer .el-button--mini:last-of-type {
  color: #fff;
}
.dialog-footer .el-button--mini:only-of-type {
  margin-right: 15px;
}

.el-dialog .el-row:last-of-type {
  margin-bottom: 0 !important;
}
._dialog_height_20 {
  height: 10px;
}

.el-dialog--small{
  min-width: 650px;
}
.el-dialog--tiny{
  min-width: 650px;
}
.el-row .el-input__inner{
  padding: 0 5px;
}
</style>
