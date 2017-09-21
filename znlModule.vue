<template>
  <div class="znl-grid znl-module"
        ref="gridModule"
       v-loading="!isSettingDialogShow&&p_loading"
       element-loading-text="数据加载中,请稍后...">
    <div class="znl-header">
      <slot v-if="$slots.header"
            name="header"
            class="znl-header-text"></slot>
      <span v-else-if="header"
            class="znl-header-text">{{header}}</span>
      <!--<div class="znl-btns"
                         v-if="!isReload">
                      <slot name="action-buttons"></slot>
                    </div>-->
      <div class="pull-right"
           v-if="!isReload">
        <slot name="action-icons"></slot>
        <a href="#"
           class="znl-icons refresh"
           title="刷新"
           v-if="!!onRefresh"
           @click.stop.prevent="refresh">
          <!--<icon name="refresh"></icon>-->
          <i class="iconfont icon-table_refresh_btn_n bigIcon"></i>
        </a>
        <a href="#"
           class="znl-icons set"
           title="设置"
           v-if="onSaveSetting"
           @click.stop.prevent="isSettingDialogShow=true">
          <!--<icon name="gear"></icon>-->
          <i class="iconfont icon-table_set_btn_n bigIcon"></i>
        </a>

      </div>
      <div class="znl-action" v-if="isActionFrom">
        <el-row class="znl-actions">
          <!-- <el-col :span="fieldTags.length?16:24"
                  class="znl-form" v-if="innerEmpty" :inner-empty="innerEmpty"> -->
          <el-col :span="fieldTags.length?16:24"
                  class="znl-form">
            <slot name="action-form"></slot>
          </el-col>
          <el-col :span="fieldTags.length?8:0"
                  class="znl-tag">
            <ul class="pull-right">
              <template v-for="field in fieldTags">
                <li v-for="tag in field.tags"
                    :key="tag"
                    :class="{'active':selectedTag.field===field.name&&selectedTag.tagName===tag.name}">
                  <a href="#"
                     :style="{color:tag.color}"
                     @click.stop.prevent="searchTag(field.name,tag.name)">{{tag.name}}
                  </a>
                  <span :style="{backgroundColor:tag.color}"></span>
                </li>
              </template>
            </ul>
          </el-col>
        </el-row>
      </div>
      <div class="znl-btn" v-if="isBtn">
        <el-row class="znl-btns">
          <el-col :span="24">
            <slot name="action-buttons"></slot>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="znl-content">
      <p class="znl-reload"
         v-if="isReload">
        加载失败
        <a href="#"
           @click.stop.prevent="init">重新加载</a>
      </p>
      <template v-else>
        <slot v-if="$slots.default"></slot>
         <template v-else>
          <div v-if="isFieldsSearch" class="isFieldsSearch">
            <label class="znl-searchHeader">
              <span class="icon">
                <!-- <icon name="search"></icon> -->
                <i class="iconfont icon-search_ic"></i>
              </span>
              <span class="searchText">搜索栏</span>
            </label>
            <span class="txt" :class="{'txtWidth':isFieldswidth<420}">（在下方搜索栏输入相应的内容后，按Enter键即可搜索/筛选当前列）</span>
          </div>
          <div v-else class="NotSearch">
            <!-- <label class="znl-searchHeader">
              <span class="icon"><icon name="search"></icon></span>
              <span class="searchText">搜索栏</span>
            </label>
            <span class="txt" :class="{'txtWidth':isFieldswidth<420}">（在下方搜索栏输入相应的内容后，按Enter键即可搜索/筛选当前列）</span> -->
          </div>
          <base-element-grid v-if="type==='base'"
                          ref="baseFlexGrid"
                          :resource-list="resourceList"
                          :is-btn="isBtn"
                          :height="gridHeight"
                          :max-height="gridMaxHeight"
                          :min-height="gridMinHeight"
                          :columns="columns"
                          :item-source="itemSource"
                          :column-colors="columnColors"
                          :row-colors="rowColors"
                          :is-fields-search="isFieldsSearch"
                          :is-multi-rows-check="isMultiRowsCheck"
                          :search-fields="searchFields"
                          :page-size="pageSize"
                          :page-index="pageIndex"
                          :total-count="totalCount"
                          :right-menus="gridRightMenus"
                          :on-search="onSearch&&search"
                          :on-refresh="onRefresh&&refresh"
                          :on-page-changed="onPageChanged&&pageChanged"
                          :isShowPagination="isShowPagination"
                          @select-check-rows="(val,check)=>{$emit('select-check-rows',val,check)}"
                          @selection-changed="d=>{this.CurrentItem=d,$emit('selection-changed',d)}"
                          @ondblclick="d=>{$emit('ondblclick',d)}"
                          :checkboxBindingKey="checkboxBindingKey">
          </base-element-grid>
          <action-element-grid v-else-if="type==='action'"
                            ref="actionFlexGrid"
                            :resource-list="resourceList"
                            :height="gridHeight"
                            :is-btn="isBtn"
                            :max-height="gridMaxHeight"
                            :min-height="gridMinHeight"
                            :columns="columns"
                            :item-source="itemSource"
                            :column-colors="columnColors"
                            :row-colors="rowColors"
                            :is-fields-search="isFieldsSearch"
                            :is-multi-rows-check="isMultiRowsCheck"
                            :search-fields="searchFields"
                            :page-size="pageSize"
                            :page-index="pageIndex"
                            :total-count="totalCount"
                            :right-menus="gridRightMenus"
                            :show-save-row-right-menu="showSaveRowRightMenu"
                            :show-save-row-right-menu-disabled="showSaveRowRightMenuDisabled"
                            :show-add-row-right-menu="showAddRowRightMenu"
                            :show-delete-row-right-menu="showDeleteRowRightMenu"
                            :on-before-add-row="onBeforeAddRow"
                            :on-save-row="onSaveRow"
                            :on-save-rows="onSaveRows"
                            :on-delete-row="onDeleteRow"
                            :on-delete-rows="onDeleteRows"
                            :on-search="onSearch&&search"
                            :on-refresh="onRefresh&&refresh"
                            :on-page-changed="onPageChanged&&pageChanged"
                            :isShowPagination="isShowPagination"
                            @selection-changed="d=>{$emit('selection-changed',d)}"
                            @select-check-rows="(val,check)=>{$emit('select-check-rows',val,check)}"
                            @edit:beginning="(value,colName,grid,rowIndex,colIndex)=>{$emit('edit:beginning',value,colName,grid,rowIndex,colIndex)}"
                            @edit:cell-ended="(value,oldValue,colName,grid,rowIndex,colIndex)=>{$emit('edit:cell-ended',value,oldValue,colName,grid,rowIndex,colIndex)}"
                            @edit:row-ended="(value,oldValue,grid,rowIndex,colIndex)=>{$emit('edit:row-ended',value,oldValue,grid,rowIndex,colIndex)}"
                            :checkboxBindingKey="checkboxBindingKey">
          </action-element-grid>
        </template>

         <grid-configuration v-if="onSaveSetting"
                            :loading="isSettingDialogShow&&p_loading"
                            :open="isSettingDialogShow"
                            :columns="columns"
                            :page-size="pageSize"
                            :role="role"
                            @update:open="val=>{isSettingDialogShow = val}"
                            @confirm="saveSetting"
                            @reset="resetSetting"></grid-configuration>

      </template>
    </div>
  </div>
</template>


<script>
import _ from 'underscore'
import { mapState } from 'vuex'
import { mixin as propSyncMixin } from './assets/scripts/mixins/propSync'
// import BaseElementGrid from './baseFlexGrid'
import BaseElementGrid from './baseElementGrid'
// import ActionElementGrid from './actionFlexGrid'
import ActionElementGrid from './actionElementGrid'
import GridConfiguration from './gridConfiguration'
import { elResize } from './assets/scripts/utils/dom'
// import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'ZnlModule',
  mixins: [propSyncMixin],
  components: {
    // BaseFlexGrid,
    BaseElementGrid,
    ActionElementGrid,
    // ActionFlexGrid,
    GridConfiguration,
    // Icon
  },
  props: {
    isInit: Boolean,
    loading: {
      type: Boolean,
      default: false,
      propsync: true
    },
    type: {
      type: String,
      default: 'base',
      validator (value) {
        return _.contains(['base', 'action'], value)
      }
    },
    header: String,
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
    pageSize: Number,
    pageIndex: Number,
    totalCount: Number,
    rightMenus: Array,
    showAddRowRightMenu: {
      type: Boolean,
      default: true
    },
    showSaveRowRightMenu: {
      type: Boolean,
      default: false
    },
    showSaveRowRightMenuDisabled: {
      type: Boolean,
      default: true
    },
    showDeleteRowRightMenu: {
      type: Boolean,
      default: true
    },
    role: [Number, String],
    onInit: Function,
    onRefresh: Function,
    onSearch: Function,
    onBeforeAddRow: Function,
    onSaveRow: Function,
    onSaveRows: Function,
    onDeleteRow: Function,
    onDeleteRows: Function,
    onPageChanged: Function,
    onSaveSetting: Function,
    onResetSetting: Function,
    isActionFrom: {
      type: Boolean,
      default: true
    },
    isBtn: {
      type: Boolean,
      default: true
    },
    checkboxBindingKey: {
      type: String,
      default: ''
    },
    isShowPagination: Boolean
  },
  data () {
    return {
      fieldTags: [],
      selectedTag: {},
      searchModel: {},
      isSettingDialogShow: false,
      isReload: false,
      gridHeight: 0,
      gridMaxHeight: 0,
      gridMinHeight: 0,
      innerEmpty: true,
      isFieldswidth: 500
    }
  },
  computed: {
    // isEmpty () {
    //   const innerContent = document.querySelector('.znl-header .znl-action')[0].innerText.replace(/\s*/g, '')
    //   if (innerContent === '') {
    //     this.innerEmpty = false
    //   }
    // },
    gridRightMenus () {
      let customGridSetting = [
        {
          iconName: 'columns',
          text: '自定义表格',
          disabled: false,
          display: true,
          click: (s, e) => {
            this.isSettingDialogShow = true
          }
        }
      ]
      if (this.onSaveSetting) {
        return (this.rightMenus || []).concat(customGridSetting)
      } else {
        return this.rightMenus
      }
    },
    ...mapState([
      'domRect'
    ])
  },
  watch: {
    columns (val) {
      this.fieldTags = _.chain(val)
        .filter(column => column.isTag)
        .map(column => { return { name: column.name, tags: column.extraConfig.tags } })
        .value()
    },
    searchFields: {
      handler: 'search',
      deep: true
    }
  },
  methods: {
    selectionChanged (e) {
      // console.log(e)
    },
    transformSubmitValue (requestData) {
      let items = requestData
      let cols = this.$refs.baseFlexGrid ? this.$refs.baseFlexGrid.checkColumns : this._data.columnsConfig
      _.each(cols, (col) => {
        if (col.dataMap && col.dataMap.length > 0) {
          // 对有datamap的列的行的值进行替换
          _.each(items, (item, i) => {
            // if (item[col.name]) {
            _.each(col.dataMap, (data) => {
              try {
                if (data.value === (item[col.name]) || (_.isFinite(data.value) ? Number(data.value) : data.value) === Number(item[col.name])) {
                  item[col.name] = _.isFinite(data.key) ? Number(data.key) : data.key
                } else if (data.value === item) {
                  items[i] = data.key
                }
              } catch (err) {
              }
            })
            // }
          })
        }
      })
      return items
    },
    init (refresh) {
      this.isReload = false
      let init = this.onInit && this.onInit(null, refresh)
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
    searchTag (field, tagName) {
      let searchTag = {}
      if (_.has(this.searchModle, field) && this.searchModle[field] && this.searchModle[field] === tagName) {
        this.selectedTag = { field: '', tagName: '' }
        searchTag[field] = ''
      } else {
        this.selectedTag = { field: field, tagName: tagName }
        searchTag[field] = tagName
      }

      this.search(_.extend({}, this.searchModle, searchTag))
    },
    refresh () {
      let refresh = this.onRefresh && this.onRefresh()
      if (!_.isUndefined(refresh) && refresh.then) {
        this.p_loading = true
        refresh.then(response => {
          _.delay(() => {
            this.p_loading = false
            this.clearSelection()
          }, 200)
        }, e => {
          this.p_loading = false
        })
      }
    },
    pageChanged (pageIndex) { // 翻页
      let pageChanged = this.onPageChanged && this.onPageChanged(pageIndex)
      // console.log('翻页', this.getSelectedRows())
      if (!_.isUndefined(pageChanged) && pageChanged.then) {
        this.p_loading = true
        pageChanged.then(response => {
          _.delay(() => {
            this.p_loading = false
            _.each(this.getSelectedRows(), row => {
              if (this.type === 'base') {
                _.each(this.gridItemSourceData(), item => {
                  if (_.isEqual(row, item)) {
                    this.$refs.baseFlexGrid.$refs.baseElementGrid.toggleRowSelection(item, true)
                  }
                })
              } else {
                _.each(this.gridItemSourceData(), item => {
                  if (_.isEqual(row, item)) {
                    this.$refs.actionFlexGrid.$refs.baseFlexGrid.$refs.baseElementGrid.toggleRowSelection(item, true)
                  }
                })
              }
            })
          }, 200)
        }, e => {
          this.p_loading = false
        })
      }
    },
    gridItemSourceData () {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.gridItemSourceData()
      } else {
        return this.$refs.actionFlexGrid.gridItemSourceData()
      }
    },
    getSelectedRows () {
      if (this.type === 'base') {
        // if (this.$refs.baseFlexGrid.getSelectedRows().length === 0) {
        //   return [this.CurrentItem]
        // } else {
        return this.$refs.baseFlexGrid.getSelectedRows()
        // }
      } else {
        // if (this.$refs.actionFlexGrid.getSelectedRows().length === 0) {
        //   return [this.CurrentItem]
        // } else {
        return this.$refs.actionFlexGrid.getSelectedRows()
        // }
      }
    },
    getSelectedRow () {
      if (this.type === 'base') {
        return this.CurrentItem || this.$refs.baseFlexGrid.getSelectedRows()
      } else {
        return this.CurrentItem || this.$refs.actionFlexGrid.getSelectedRows()
      }
    },
    getCurrentSelection () {
      if (this.type === 'base') {
        return this.CurrentItem || this.$refs.baseFlexGrid.getCurrentSelection()
      } else {
        return this.CurrentItem || this.$refs.actionFlexGrid.getCurrentSelection()
      }
    },
    clearSelection () {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.clearSelection()
      } else {
        return this.$refs.actionFlexGrid.clearSelection()
      }
    },
    addRow () {
      this.$refs.actionFlexGrid.addRow()
    },
    deleteRow (deleteItem) {
      this.$refs.actionFlexGrid.deleteRow(deleteItem)
    },
    deleteRows () {
      this.$refs.actionFlexGrid.deleteRows()
    },
    saveSetting (columns, pageSize) {
      let saveSetting = this.onSaveSetting && this.onSaveSetting(columns, pageSize)
      if (_.isBoolean(saveSetting) && saveSetting) {
        this.isSettingDialogShow = false
        this.init(true)
      } else if (!_.isUndefined(saveSetting) && saveSetting.then) {
        this.p_loading = true
        saveSetting.then(response => {
          this.p_loading = false
          this.isSettingDialogShow = false
          this.init(true)
        }, e => {
          this.p_loading = false
        })
      }
    },
    resetSetting () {
      let resetSetting = this.onResetSetting && this.onResetSetting()
      if (_.isBoolean(resetSetting) && resetSetting) {
        this.isSettingDialogShow = false
        this.init(true)
      } else if (!_.isUndefined(resetSetting) && resetSetting.then) {
        this.p_loading = true
        resetSetting.then(response => {
          this.p_loading = false
          this.isSettingDialogShow = false
          this.init(true)
        }, e => {
          this.p_loading = false
        })
      }
    },
    setHeight () {
      if (!this.height) return
      // if (this.height.substr(-1) === '%') {
      //   var height = parseFloat(this.height.substr(0, this.height.length - 1)) / 100 * (this.domRect.contentHeightWithoutTab - 66)
      //   // console.log('height:' + height)
      //   // console.log('contheiwitab:' + this.domRect.contentHeightWithoutTab)
      // } else
      if (this.height.substr(-2) === 'px') {
        var height = parseFloat(this.height.substr(0, this.height.length - 2))
      } else {
        height = parseFloat(this.height)
      }
      if (_.isNaN(height)) return
      const headerOffsetHeight = this.$el.querySelector('.znl-header').offsetHeight
      // const actionOffsetHeight = this.$el.querySelector('.znl-actions').offsetHeight
      // const btnsOffsetHeight = this.$el.querySelector('.znl-btns').offsetHeight
      // height = height - headerOffsetHeight - actionOffsetHeight - btnsOffsetHeight
      height = height - headerOffsetHeight
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
        maxHeight = parseFloat(this.maxHeight.substr(0, this.maxHeight.length - 2))
      } else {
        maxHeight = parseFloat(this.maxHeight)
      }
      if (_.isNaN(maxHeight)) return
      const headerOffsetHeight = this.$el.querySelector('.znl-header').offsetHeight
      // const actionOffsetHeight = this.$el.querySelector('.znl-actions').offsetHeight
      // const btnsOffsetHeight = this.$el.querySelector('.znl-btns').offsetHeight
      // maxHeight = maxHeight - headerOffsetHeight - actionOffsetHeight - btnsOffsetHeight
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
        minHeight = parseFloat(this.minHeight.substr(0, this.minHeight.length - 2))
      } else {
        minHeight = parseFloat(this.minHeight)
      }
      if (_.isNaN(minHeight)) return
      if (minHeight > 0) {
        this.gridMinHeight = minHeight
      }
    },
    getCheckedRows () {
      // console.log(this.$refs)
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.getCheckedRows()
      } else {
        return this.$refs.actionFlexGrid.getCheckedRows()
      }
    },
    getCheckedKeys () {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.getCheckedKeys()
      } else {
        return this.$refs.actionFlexGrid.getCheckedKeys()
      }
    },
    cancelAllChecked () {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.cancelAllChecked()
      } else {
        return this.$refs.actionFlexGrid.cancelAllChecked()
      }
    },
    refreshCheckedCount (delKeys) {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.refreshCheckedCount(delKeys)
      } else {
        return this.$refs.actionFlexGrid.refreshCheckedCount(delKeys)
      }
    }
  },
  mounted () {
    this.isInit && this.init()

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
    //   this.setMinHeight()
    //   this.setMaxHeight()
    // })
    // this.$watch('domRect.contentWidth', () => {
    //   this.setHeight()
    //   this.setMaxHeight()
    //   this.setMaxWidth()
    // })
  },
  created () {
    this.$nextTick(function () { // 处理表头搜索提示文字长度超出，超出宽度隐藏
      let clientWidth = this.$el.querySelector('.isFieldsSearch')
      if (clientWidth) {
        this.isFieldswidth = clientWidth.clientWidth
      }
    })

    this.$nextTick(function () { // 处理分页器长度超出，超出宽度隐藏
      let znlgridWidth = this.$refs.gridModule
      if (znlgridWidth) {
        // console.log('宽度=' + znlgridWidth.offsetWidth)
        // this.$store.state.gridModule = znlgridWidth.offsetWidth
      }
    })
  }
}
</script>

<style lang="scss">
/* @import 'app/assets/styles/variables';
@import 'app/assets/styles/mixins'; */

 .znl-grid {
  margin-bottom: 10px!important;
  background-color:#fff;
  border-radius: 4px;
  border: 1px solid #DFE2E5;
  .znl-header {
    padding:0 15px;
    .pull-right{
      position: relative;
      top:10px;
      z-index: 99;
      .znl-icons{
         float: right;
         text-decoration: none;
         margin: 0 1px;
      }
    }
    .znl-header-text {
      float: left;
      font-size:26px;
      line-height:48px;
      margin-right: 15px;
      color: #4D4D4D;
      font-weight:Bold;
      font-family: Tahoma, Arial ,"Microsoft YaHei";
    }

    .znl-icons {
      padding: 1px;
      width:24px;
      height:24px;
      line-height:24px;
      text-align:center;
      color: rgba(0,0,0,0.5);
      display: inline-block;
      border-radius: 2px;

      &:hover {
        color: #fff;
        height: 24px!important;
        width:24px!important;

      }
      .bigIcon.iconfont{
        font-size: 24px!important;
      }
      &.refresh:hover{
        background-color:#1BB934;
      }
      &.set:hover{
        background-color: #F7BA2A;
      }
    }
    .znl-action {
      .znl-form {
        .el-row {
          div input{
            padding: 0 5px;
          }
          &>div:first-of-type {
            margin-left: 0;
          }
        }
        .el-input {
          width: 150px;
        }
        .el-col>* {
          width: 150px;
          max-width: 100%;
        }
      }
      .znl-tag {
        li {
          padding: 5px 10px;
          display: inline-block;
          position: relative;

          a {
            font-weight: 600;
            display: block;
            text-decoration: none;
          }
          span {
            display: none;
            position: absolute;
            height: 3px;
            left: 0;
            right: 0;
            bottom: 0;
          }

          &.active {
            span {
              display: inline-block;
            }
          }
        }
      }
    }
    .znl-btns {
      margin-top: 10px;
      &.el-row,
      .el-row {
          line-height:24px;
      }
    }
  }
  // .el-button+.el-button {
  //   margin-left: 0px !important;
  // }
  // .el-button {
  //   margin-bottom: 5px;

  //   &.el-button--default {
  //     color: #666666;
  //     background-color: #ffffff;
  //     border: 1px solid #E6EAEE!important;
  //     border-radius: 4px;
  //     padding:2px 5px;
  //     margin-right:10px;

  //     &:hover {
  //       background-color: #E6E6E6;
  //       border-color: #E6E6E6;
  //       color: rgba(0,0,0,0.335);
  //       transition: background-color .8s;
  //     }
  //   }
  // }
}
.znl-content {
  padding-top: 5px;
  padding-bottom: 1px;
}
.znl-content .znl-reload {
  color: #FF4949;
  text-align: center;
}
.znl-content .znl-reload a {
  color: #777;
}
.znl-content .znl-reload a:hover {
  color: #333;
}
.znl-content .znl-reload a.fa-icon {
  height: 24px;
}
.znl-module .el-checkbox__label{
  position: relative;
  bottom: -4px;
}
.znl-module .el-checkbox,.znl-module .el-checkbox__input{
  /* bottom:-4px; */
}
.infoSelection .el-button{
    padding: 7px 16px;
    border-color: #DFE2E5;
    color: #999999;
}
.infoSelection .el-button:hover{
  color: #999999;
  border-color: #C4C4C4;
  background-color: #E6E6E6;
}
.znl-header .iconfont{
  position: relative;
  font-size: 20px;
}
.znl-searchHeader{
  display: inline-block;
  background-image: url('./assets/images/search-bar_header.png');
  color:#ED9E00;
  background-position: right;
  height: 21px;
  width:88px;
  line-height: 20px;
  margin-bottom: -2px;
  padding-bottom: 2px;
}
.znl-searchHeader .icon{
  margin-left:10px;
}
.znl-searchHeader .icon .fa-icon{
  margin-top:3px;
}
.znl-searchHeader .searchText{
  position: absolute;
  margin-top: 2px;
  margin-left:10px;
}
.txt{
  color:#ED9E00;
  position: relative;
  bottom: 2px;
}
.txtWidth{
  display: inline-block;
  width: 170px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color:#ED9E00;
  position: relative;
  bottom: 2px;
}
/* 顶部搜索 */
.isFieldsSearch{
    border-bottom: 1px solid #ED9E00;
    display: flex;
    align-items: center;
}
.isFieldsSearch .znl-searchHeader{
  float: left;
}
.isFieldsSearch .znl-searchHeader .searchText{
  margin-left: 0px;
  font-size: 14px;
  left: 30px;
}
.isFieldsSearch .txt{
  font-size: 12px;
  margin-bottom: -5px;
}
.NotSearch{
  border-bottom:1px solid #DFE2E5;
}
.el-select .el-input--mini .el-input__inner {
  padding-left: 5px;
}
</style>
