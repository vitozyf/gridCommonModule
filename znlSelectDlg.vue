<template>
  <div class="znl-dialog showStocklist" >

     <!-- <znl-dialog
      :title="title"
      :visible="p_visible"
      @open="refreshGrid"
      @update:visible="(val)=>{p_visible=val}"> -->
        <div class="_dialog_height_10">&nbsp;</div>
        <div v-if="isFieldsSearch" class="isFieldsSearch">
            <label class="znl-searchHeader">
              <span class="icon">
                <!-- <icon name="search"></icon> -->
              </span>
              <span class="searchText">搜索栏</span>
            </label>
            <span class="txt">（在下方搜索栏输入相应的内容后，按Enter键即可搜索/筛选当前列）</span>
        </div>
        <base-element-grid  ref="baseFlexGrid"
                        :resource-list="resourceList"
                        :height="gridHeight"
                        :max-height="gridMaxHeight"
                        :min-height="gridMinHeight"
                        :columns="columns"
                        :isCanCheckColumns="isCanCheckColumns"
                        :item-source="itemSource"
                        :is-fields-search="isFieldsSearch"
                        :is-multi-rows-check="isMultiRowsCheck"
                        :search-fields="searchFields"
                        :page-size="pageSize"
                        :page-index="pageIndex"
                        :total-count="totalCount"
                        :on-search="onSearch&&search"
                        :on-page-changed="onPageChanged"
                        @ondblclick="onComfirm"
                        @selection-changed="d=>{$emit('selection-changed',d)}">
        </base-element-grid>

      <span slot="footer"   class="dialog-footer">
        <el-button  @click="onCancel">取消</el-button>
        <el-button  type="primary" @click="onComfirm">确定</el-button>
      </span>
    <!-- </znl-dialog> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
// import baseFlexGrid from './baseFlexGrid'
import baseElementGrid from './baseElementGrid'
import {mixin as propSyncMixin} from './assets/scripts/mixins/propSync'
import znlDialog from './znlDialog'
import { elResize } from './assets/scripts/utils/dom'

export default {
  name: 'znlSelectDialog',
  mixins: [propSyncMixin],
  data () {
    return {
      gridHeight: 0,
      gridMaxHeight: 0,
      gridMinHeight: 200,
      isCanCheckColumns: true
    }
  },
  components: {
    // baseFlexGrid,
    baseElementGrid,
    znlDialog
  },
  props: {
    title: String,
    columns: Array,
    height: String,
    maxHeight: String,
    minHeight: String,
    frozenColumns: Number,
    itemSource: Array,
    resourceList: Array,
    isMultiRowsCheck: Boolean,
    isFieldsSearch: Boolean,
    searchFields: Object,
    columnColors: Array,
    rowColors: Array,
    summaryColumns: Array,
    pageSize: Number,
    pageIndex: Number,
    totalCount: Number,
    rightMenus: Array,
    onSearch: Function,
    onPageChanged: Function,
    // 06-20 许明浩，Excel粘贴按钮事件
    IsExcelCheck: Boolean,
    IsAlterVer: Boolean,
    visible: {
      type: Boolean,
      default: false,
      propsync: true
    }
  },
  computed: mapState([
    'domRect'
  ]),
  methods: {
    init () {
      this.isReload = false
      let init = this.onInit && this.onInit()
      if (_.isBoolean(init)) {
        !init && (this.isReload = true)
      } else if (!_.isUndefined(init) && init.then) {
        this.p_loading = true
        init.then(response => {
          _.delay(() => {
            this.p_loading = false
          }, 200)
        }, e => {
          this.p_loading = false
          this.isReload = true
        })
      }
    },
    search (params) {
      this.searchModle = params
      let serach = this.onSearch && this.onSearch(params)
      if (!_.isUndefined(serach) && serach.then) {
        this.p_loading = true
        serach.then(response => {
          _.delay(() => {
            this.p_loading = false
          }, 200)
        }, e => {
          this.p_loading = false
        })
      }
    },
    pageChanged (pageIndex) {
      let pageChanged = this.onPageChanged && this.onPageChanged(pageIndex)
      console.log(_.isUndefined(pageChanged))
      if (_.isUndefined(pageChanged) && pageChanged.then) {
        this.p_loading = true
        pageChanged.then(response => {
          _.delay(() => {
            this.p_loading = false
          }, 200)
        }, e => {
          this.p_loading = false
        })
      }
    },
    getSelectedRows () {
      return this.$refs.baseFlexGrid.getSelectedRows()
    },
    refreshGrid () {
      if (this.$refs.baseFlexGrid && this.$refs.baseFlexGrid.grid && this.$refs.baseFlexGrid.grid.invalidate) {
        this.$refs.baseFlexGrid.grid.invalidate()
      }
    },
    onCancel () {
      this.p_visible = false
      this.$emit('cancel')
    },
    onComfirm () {
      let selectedRow = this.$refs.baseFlexGrid.getSelectedRows()
      this.p_visible = false
      if (this.isMultiRowsCheck) {
        this.$emit('confirm', selectedRow)
      } else {
        this.$emit('confirm', selectedRow[0])
      }
      this.$refs.baseFlexGrid.cancelAllChecked()
    },
    setHeight () {
      if (!this.height) return

      // if (this.height.substr(-1) === '%') {
      //   var height = parseFloat(this.height.substr(0, this.height.length - 1)) / 100 * (this.domRect.contentHeightWithoutTab - 25)
      // } else
      if (this.height.substr(-2) === 'px') {
        var height = parseFloat(this.height.substr(0, this.height.length - 2))
      } else {
        height = parseFloat(this.height)
      }
      if (_.isNaN(height)) return
      console.log(this)
      if(this.$el.querySelector('.znl-header')){
        const headerOffsetHeight = this.$el.querySelector('.znl-header').offsetHeight
        height = height - headerOffsetHeight
      }
      if (height > 0) {
        this.gridHeight = height
      }
    },
    setMaxHeight () {
      if (!this.maxHeight) return
      // if (this.maxHeight.substr(-1) === '%') {
      //   var maxHeight = parseFloat(this.maxHeight.substr(0, this.maxHeight.length - 1)) / 100 * (this.domRect.contentHeightWithoutTab - 20)
      // } else
      if (this.maxHeight.substr(-2) === 'px') {
        var maxHeight = parseFloat(this.maxHeight.substr(0, this.maxHeight.length - 2))
      } else {
        maxHeight = parseFloat(this.maxHeight)
      }
      if (_.isNaN(maxHeight)) return
      const headerOffsetHeight = this.$el.querySelector('.znl-header').offsetHeight
      maxHeight = maxHeight - headerOffsetHeight
      if (maxHeight > 0) {
        this.gridMaxHeight = maxHeight
      }
    },
    setMinHeight () {
      if (!this.minHeight) return
      // if (this.minHeight.substr(-1) === '%') {
      //   var minHeight = parseFloat(this.minHeight.substr(0, this.minHeight.length - 1)) / 100 * (this.domRect.contentHeightWithoutTab - 20)
      // } else
      if (this.minHeight.substr(-2) === 'px') {
        var minHeight = parseFloat(this.minHeight.substr(0, this.minHeight.length - 2))
      } else {
        minHeight = parseFloat(this.minHeight)
      }
      if (_.isNaN(minHeight)) return
      if (minHeight > 0) {
        this.gridMinHeight = minHeight
      }
    }
  },
  created () {
    // console.log(this)
  },
  mounted () {
    // TODO 从页面加载
    // this.isInit &&
    this.init()

    _.delay(() => {
      this.setHeight()
      this.setMaxHeight()
      this.setMinHeight()
    }, 100)

    elResize.on(this.$el, () => {
      this.setHeight()
      this.setMaxHeight()
      this.setMinHeight()
    })

    // this.$watch('domRect.contentHeightWithoutTab', () => {
    //   this.setHeight()
    //   this.setMaxHeight()
    // })
    // console.log(this)
  }
}
</script>

<style lang="scss" >
</style>

