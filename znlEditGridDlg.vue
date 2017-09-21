<template>
  <div>
    <div class="znl-edit"
        v-loading="!isSettingDialogShow&&p_loading"
        element-loading-text="数据加载中,请稍后...">
      <div class="znl-header">
        <strong class="znl-header-text">
          <slot v-if="$slots.header"
                name="header"></slot>
          <span v-else>{{header}}</span>
        </strong>
        <div class="pull-right"
            v-if="!isReload">
          <slot name="action-icons"></slot>
          <a href="#"
            class="znl-icons"
            title="刷新"
            v-if="!!onRefresh"
            @click.stop.prevent="refresh">
            <icon name="refresh"></icon>
          </a>
          <a href="#"
            class="znl-icons"
            title="设置"
            v-if="onSaveSetting"
            @click.stop.prevent="isSettingDialogShow=true">
            <icon name="gear"></icon>
          </a>
        </div>
        <div class="znl-action" v-if="isActionFrom">
          <el-row class="znl-actions">
            <el-col :span="fieldTags.length?16:24"
                    class="znl-form">
              <slot name="action-search"></slot>
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
          <el-col slot="action-btns"></el-col>
          <el-col>
              <el-button type="default"
                         size="mini"
                         v-if="(type==='edit' || type==='action')&&showAddRowButton"
                         @click="addRow()">
                <i class="iconfont icon-add_btn_ic"></i>
                <span class="ver"> 新增一行</span>
              </el-button>
              <el-button type="default"
                         size="mini"
                         v-if="(type==='edit' || type==='action')&&!isMultiRowsCheck && showDeleteRowButton"
                         @click="deleteRows()">
                <i class="iconfont icon-delete_btn_ic"></i>
                <span class="ver"> 删除选中行</span>
              </el-button>
              <el-button type="default"
                         size="mini"
                         v-if="(type==='edit' || type==='action')&&isMultiRowsCheck && showDeleteRowButton"
                         @click="deleteRows()">
                <i class="iconfont icon-delete_btn_ic"></i>
                <span class="ver"> 删除选择行</span>
              </el-button>
              <el-button type="default"
                         size="mini"
                         v-if="(type==='edit' || type==='action')&&showStocklistCheck"
                         @click="selectStocklist()">
                <i class="iconfont icon-alarm-wh_btn_ic"></i>
                <span class="ver">选择库存</span>
              </el-button>
              <el-button type="default"
                         size="mini"
                         v-if="(type==='edit' || type==='action')&&IsExcelCheck"
                         @click="ExcelPasted()">
                <icon name="minus"></icon> 从Excel粘贴
              </el-button>
          </el-col>
          <!-- <el-col>
            <span v-if="IsAlterVer"
                  class="alterVer">数量为负数表示退货！</span>
          </el-col> -->
          <el-col :span="16"
                  class="text-right">
             <slot name="edit-buttons"></slot>
            <el-button type="primary"
                       v-if="!!onPageSave"
                       size="mini"
                       @click="pageSave()">保存
            </el-button>
            <el-button type="default"
                       v-if="!!onPageSubmit"
                       size="mini"
                       @click="pageSubmit()"> 提交
            </el-button>
            <el-button type="default"
                       v-if="!!onPageCancel"
                       size="mini"
                       @click="pageCancel()"> 撤单
            </el-button>
            <el-button type="default"
                       v-if="!!onPageAudit"
                       size="mini"
                       @click="pageAudit()"> 审核
            </el-button>
          </el-col>
        </el-row>
      </div>
      </div>
      <div class="znl-content">
        <p class="znl-reload"
          v-if="isReload">
          加载失败
          <a href="#"
            @click.stop.prevent="init"> 重新加载</a>
        </p>
        <template v-else>
          <slot v-if="$slots.default"></slot>
          <template v-else>
            <div v-if="isFieldsSearch" class="isFieldsSearch">
              <label class="znl-searchHeader">
                <span class="icon">
                  <!-- <icon name="search"></icon> -->
                </span>
                <span class="searchText">搜索栏</span>
              </label>
            <span class="txt">（在下方搜索栏输入相应的内容后，按Enter键即可搜索/筛选当前列）</span>
          </div>
            <base-element-grid v-if="type==='base'"
                            ref="baseFlexGrid"
                            :resource-list="resourceList"
                            :height="gridHeight"
                            :max-height="gridMaxHeight"
                            :min-height="gridMinHeight"
                            :columns="columns"
                            :item-source="itemSource"
                            :column-colors="columnColors"
                            :row-colors="rowColors"
                            :summary-columns="summaryColumns"
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
                            @selection-changed="d=>{$emit('selection-changed',d)}">
            </base-element-grid>
            <edit-flex-grid v-else-if="type==='edit'"
                            ref="editFlexGrid"
                            :resource-list="resourceList"
                            :height="gridHeight"
                            :max-height="gridMaxHeight"
                            :min-height="gridMinHeight"
                            :columns="columns"
                            :item-source="itemSource"
                            :column-colors="columnColors"
                            :row-colors="rowColors"
                            :summary-columns="summaryColumns"
                            :is-fields-search="isFieldsSearch"
                            :is-multi-rows-check="isMultiRowsCheck"
                            :is-excel-pasted-check="IsExcelCheck"
                            :is-alter-ver="IsAlterVer"
                            :search-fields="searchFields"
                            :page-size="pageSize"
                            :page-index="pageIndex"
                            :total-count="totalCount"
                            :right-menus="gridRightMenus"
                            :show-add-row-right-menu="showAddRowRightMenu"
                            :show-delete-row-right-menu="showDeleteRowRightMenu"
                            :on-before-add-row="onBeforeAddRow"
                            :on-save-row="onSaveRow"
                            :on-delete-row="onDeleteRow"
                            :on-delete-checked-row="onDeleteRows"
                            :on-deleted-row="onDeletedRow"
                            :on-deleted-checked-row="onDeletedCheckedRows"
                            :show-save-row-right-menu="showSaveRowRightMenu"
                            :on-search="onSearch&&search"
                            :on-refresh="onRefresh&&refresh"
                            :on-page-changed="onPageChanged&&pageChanged"
                            :on-excel-pasted="ExcelPasted"
                            isCanCheckColumns="true"
                            :isShowPagination="isShowPagination"
                            @stk-guids-check-list="d=>{endCheckStklist(d)}"
                            @selection-changed="d=>{$emit('selection-changed',d)}"
                            @edit:beginning="(value,colName,grid,rowIndex,colIndex)=>{$emit('edit:beginning',value,colName,grid,rowIndex,colIndex)}"
                            @edit:cell-ended="(value,oldValue,colName,grid,rowIndex,colIndex)=>{$emit('edit:cell-ended',value,oldValue,colName,grid,rowIndex,colIndex)}"
                            @edit:row-ended="(value,oldValue,grid,rowIndex,colIndex)=>{$emit('edit:row-ended',value,oldValue,grid,rowIndex,colIndex)}">
            </edit-flex-grid>

            <action-element-grid v-else-if="type==='action'"
                            ref="actionFlexGrid"
                            :resource-list="resourceList"
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
                            :show-save-row-right-menu="showSaveRowRightMenu"
                            :show-save-row-right-menu-disabled="showSaveRowRightMenuDisabled"
                            :show-add-row-right-menu="showAddRowRightMenu"
                            :show-delete-row-right-menu="showDeleteRowRightMenu"
                            :on-before-add-row="onBeforeAddRow"
                            :on-save-row="onSaveRow"
                            :on-save-rows="onSaveRows"
                            :on-delete-row="onDeleteRow"
                            :on-delete-rows="onDeleteRows"
                            :on-delete-checked-row="onDeleteRows"
                            :on-deleted-checked-row="onDeleteRows"
                            :on-search="onSearch&&search"
                            :on-refresh="onRefresh&&refresh"
                            :on-page-changed="onPageChanged&&pageChanged"
                            :isShowPagination="isShowPagination"
                            @selection-changed="d=>{$emit('selection-changed',d)}"
                            @edit:beginning="(value,colName,grid,rowIndex,colIndex)=>{$emit('edit:beginning',value,colName,grid,rowIndex,colIndex)}"
                            @edit:cell-ended="(value,oldValue,colName,grid,rowIndex,colIndex)=>{$emit('edit:cell-ended',value,oldValue,colName,grid,rowIndex,colIndex)}"
                            @edit:row-ended="(value,oldValue,grid,rowIndex,colIndex)=>{$emit('edit:row-ended',value,oldValue,grid,rowIndex,colIndex)}">
          </action-element-grid>
          </template>

          <grid-configuration v-if="onSaveSetting"
                              :loading="isSettingDialogShow&&p_loading"
                              :open="isSettingDialogShow"
                              :columns="columns"
                              :page-size="pageSize"
                              :role="role"
                              @update:open="val=>{this.isSettingDialogShow = value}"
                              @confirm="saveSetting"
                              @reset="resetSetting"></grid-configuration>
          <!--库存选择列表-->
          <znl-dialog title="库存选择"
               :visible="showStocklist"
               @update:visible="(val)=>{showStocklist=val}"
                    v-move-to.body>
            <!-- <StockListCheck :isRefresh='refreshChecklist'
                            height="60%"
                            :isMulitCheck='true'
                            @checkEnd="endCheckStklist"></StockListCheck> -->
          </znl-dialog>
        </template>
      </div>
    </div>
  </div>
</template>


<script>
import { mapState } from 'vuex'
import { mixin as propSyncMixin } from './assets/scripts/mixins/propSync'
import BaseElementGrid from './baseElementGrid'
import EditFlexGrid from './editFlexGrid'
import ActionElementGrid from './actionElementGrid'
import GridConfiguration from './gridConfiguration'
import { elResize } from './assets/scripts/utils/dom'
import { mixin as moveToMixin } from './assets/scripts/directives/moveTo'
import znlDialog from './znlDialog'
// import clipboardy from 'clipboardy'
export default {
  name: 'znlEditGridDlg',
  mixins: [propSyncMixin, moveToMixin],
  components: {
    BaseElementGrid,
    EditFlexGrid,
    ActionElementGrid,
    GridConfiguration,
    znlDialog
    // StockListCheck
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
        return _.contains(['base', 'edit', 'action'], value)
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
    summaryColumns: Array,
    pageSize: Number,
    pageIndex: Number,
    totalCount: Number,
    rightMenus: Array,
    isShowPagination: Boolean,
    showSaveRowRightMenu: {
      type: Boolean,
      default: false
    },
    showAddRowRightMenu: {
      type: Boolean,
      default: true
    },
    showDeleteRowRightMenu: {
      type: Boolean,
      default: true
    },
    showSaveRowRightMenuDisabled: {
      type: Boolean, default: false
    },
    showAddRowButton: {// 显示添加行按钮
      type: Boolean,
      default: true
    },
    showDeleteRowButton: {// 显示删除行按钮
      type: Boolean,
      default: true
    },
    showStocklistCheck: {// 显示选择库存列表
      type: Boolean,
      default: false
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
    onDeletedRow: Function,
    onDeletedCheckedRows: Function,
    onPageChanged: Function,
    onSaveSetting: Function,
    onResetSetting: Function,
    onPageSave: Function,
    onPageSubmit: Function,
    onPageAudit: Function,
    onPageCancel: Function,
    // 06-20 许明浩，Excel粘贴按钮事件
    IsExcelCheck: Boolean,
    IsAlterVer: Boolean,
    title: String,
    isActionFrom: {
      type: Boolean,
      default: true
    },
    isBtn: {
      type: Boolean,
      default: true
    }
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
      gridMinHeight: 150,
      showStocklist: false, // 是否显示选择库存页面
      refreshChecklist: false// 是否刷新库存选择页面
    }
  },
  computed: {
    gridRightMenus () {
      let customGridSetting = [
        {
          iconName: 'columns',
          text: '自定义表格',
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
      // console.log(this.columns)
    },
    searchFields: {
      handler: 'search',
      deep: true
    }
  },
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
          }, 200)
        }, e => {
          this.p_loading = false
        })
      }
    },
    pageChanged (pageIndex) {
      let pageChanged = this.onPageChanged && this.onPageChanged(pageIndex)
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
    getItemSource () {
      // console.log(this)
      if (this.type === 'edit') {
        return this.$refs.editFlexGrid.$refs.actionFlexGrid.$refs.baseFlexGrid.gridItemSourceData()
      } else if (this.type === 'base') {
        return this.$refs.baseFlexGrid.gridItemSourceData()
      } else {
        return []
      }
    },
    getSelectedRows () {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.getSelectedRows()
      } else {
        return this.$refs.editFlexGrid.getSelectedRows()
      }
    },
    addRow () {
      this.$refs.editFlexGrid.addRow()
    },
    deleteRow (deleteItem) {
      this.$refs.editFlexGrid.deleteRow(deleteItem)
    },
    deleteSelectedRow () {
      this.$refs.editFlexGrid.deleteSelectedRow()
    },
    deleteRows () {
      if (this.type === 'action') {
        this.$refs.actionFlexGrid.deleteRows()
      } else if (this.type === 'edit') {
        this.$refs.editFlexGrid.deleteRows()
      }
    },
    selectStocklist () { // 选择库存列表
      this.showStocklist = true
      this.refreshChecklist = !this.refreshChecklist
    },
    endCheckStklist (items) { // 结束选择库存列表
      this.showStocklist = false
      this.$emit('stk-guids-check-list', items)
    },
    saveSetting (columns, pageSize) {
      let saveSetting = this.onSaveSetting && this.onSaveSetting(columns, pageSize)
      if (_.isBoolean(saveSetting) && saveSetting) {
        this.isSettingDialogShow = false
        this.init()
      } else if (!_.isUndefined(saveSetting) && saveSetting.then) {
        this.p_loading = true
        saveSetting.then(response => {
          this.p_loading = false
          this.isSettingDialogShow = false
          this.init()
        }, e => {
          this.p_loading = false
        })
      }
    },
    resetSetting () {
      let resetSetting = this.onResetSetting && this.onResetSetting()
      if (_.isBoolean(resetSetting) && resetSetting) {
        this.isSettingDialogShow = false
        this.init()
      } else if (!_.isUndefined(resetSetting) && resetSetting.then) {
        this.p_loading = true
        resetSetting.then(response => {
          this.p_loading = false
          this.isSettingDialogShow = false
          this.init()
        }, e => {
          this.p_loading = false
        })
      }
    },
    clearSelection () {
      if (this.type === 'base') {
        return this.$refs.baseFlexGrid.clearSelection()
      } else if (this.type === 'action') {
        return this.$refs.actionFlexGrid.clearSelection()
      } else {
        return this.$refs.editFlexGrid.clearSelection()
      }
    },
    // onPageSave: Function,
    // onPageSubmit: Function,
    // onPageAudit: Function
    pageSave () {
      this.$confirm('保存确认, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let pageSaveResult = this.onPageSave && this.onPageSave()
        if (_.isBoolean(pageSaveResult) && pageSaveResult) {
        } else if (!_.isUndefined(pageSaveResult) && pageSaveResult.then) {
          pageSaveResult.then(d => {
            if (_.isBoolean(d) && d) {
            }
          })
        }
      })
    },
    pageSubmit () {
      this.$confirm('提交确认, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let pageSubmitResult = this.onPageSubmit && this.onPageSubmit()
        if (_.isBoolean(pageSubmitResult) && pageSubmitResult) {
        } else if (!_.isUndefined(pageSubmitResult) && pageSubmitResult.then) {
          pageSubmitResult.then(d => {
            if (_.isBoolean(d) && d) {
            }
          })
        }
      })
    },
    pageAudit () {
      this.$confirm('审核确认, 是否审核通过?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let pageAuditResult = this.onPageAudit && this.onPageAudit()
        if (_.isBoolean(pageAuditResult) && pageAuditResult) {
        } else if (!_.isUndefined(pageAuditResult) && pageAuditResult.then) {
          pageAuditResult.then(d => {
            if (_.isBoolean(d) && d) {
            }
          })
        }
      })
    },
    pageCancel () {
      this.$confirm('撤单确认, 是否撤销单据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let pageCancelResult = this.onPageCancel && this.onPageCancel()
        if (_.isBoolean(pageCancelResult) && pageCancelResult) {
        } else if (!_.isUndefined(pageCancelResult) && pageCancelResult.then) {
          pageCancelResult.then(d => {
            if (_.isBoolean(d) && d) {
            }
          })
        }
      })
    },
    ExcelPasted () {
      let nullPK = {}
      nullPK['RowGuid'] = null

      // 这里更换VALUE替换成剪贴板数据
      let defaultva = {
        'Model': 'Model',
        'Packaging': 'Packaging',
        'MakeYear': 'MakeYear',
        'MaxViewQty': 'MaxViewQty',
        'DeliveryDate': 'DeliveryDate',
        'Quality': 'Quality',
        'Price': 'Price',
        'WareHouse': 'WareHouse',
        'Explain': 'Explain',
        'Brand': 'Brand'
      }
      let a = _.extend({}, defaultva, nullPK)
      // console.log(a)

      this.$refs.editFlexGrid.excelAddRow(a)

      // console.log(br)
      // this.$refs.editFlexGrid.addRow(a)
      // console.log('进入Excel粘贴事件')
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
      const headerOffsetHeight = this.$el.querySelector('.znl-header').offsetHeight
      // const actionOffsetHeight = this.$el.querySelector('.znl-actions').offsetHeight
      // height = height - headerOffsetHeight - actionOffsetHeight
      height = height - headerOffsetHeight
      if (height > 0) {
        this.gridHeight = height
      }
    },
    setMaxHeight () {
      if (!this.maxHeight) return
      if (this.maxHeight.substr(-1) === '%') {
        var maxHeight = parseFloat(this.maxHeight.substr(0, this.maxHeight.length - 1)) / 100 * (this.domRect.contentHeightWithoutTab - 20)
      } else if (this.maxHeight.substr(-2) === 'px') {
        maxHeight = parseFloat(this.maxHeight.substr(0, this.maxHeight.length - 2))
      } else {
        maxHeight = parseFloat(this.maxHeight)
      }
      if (_.isNaN(maxHeight)) return
      const headerOffsetHeight = this.$el.querySelector('.znl-header').offsetHeight
      // const actionOffsetHeight = this.$el.querySelector('.znl-actions').offsetHeight
      // maxHeight = maxHeight - headerOffsetHeight - actionOffsetHeight
      maxHeight = maxHeight - headerOffsetHeight
      if (maxHeight > 0) {
        this.gridMaxHeight = maxHeight
      }
    },
    setMinHeight () {
      if (!this.minHeight) return
      if (this.minHeight.substr(-1) === '%') {
        var minHeight = parseFloat(this.minHeight.substr(0, this.minHeight.length - 1)) / 100 * (this.domRect.contentHeightWithoutTab - 20)
      } else if (this.minHeight.substr(-2) === 'px') {
        minHeight = parseFloat(this.minHeight.substr(0, this.minHeight.length - 2))
      } else {
        minHeight = parseFloat(this.minHeight)
      }
      if (_.isNaN(minHeight)) return
      if (minHeight > 0) {
        this.gridMinHeight = minHeight
      }
    }
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
  }
}
</script>

<style  scoped>
.znl-header .iconfont{
  font-size: 14px;
}
.znl-header .znl-btn .el-button:hover{
    color: #000;
    border-color: #C4C4C4;
    background-color: #E6E6E6;
}
/* @import 'app/assets/styles/_form'; */
/* .el-button {
    margin-top: 5px;
    margin-bottom: 5px;
    &:first-of-type {
      margin-right: 0 !important;
    }
    &.el-button--default {
      color: #666666;
      background-color: #ffffff;
      border: 1px solid #E6EAEE!important;
      border-radius: 4px;
      padding:2px 5px;
      margin-right:10px;

      &:hover {
        background-color: #E6E6E6;
        border-color: #E6E6E6;
        color: lighten(#000, 33.5%);
        transition: background-color .8s;
      }
    }
}

.znl-header-text{
  font-size: 18px;
  position: absolute;
  color: rgb(61, 48, 31);
  top: -33px;
}
 .isFieldsSearch{
     border-bottom: 1px solid #ED9E00;
  } */
</style>
