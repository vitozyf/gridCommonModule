<template>
  <div class='base-flex-grid'
       @click="ContextMenuShow"
       >
       <template>
          <el-date-picker
              v-for="(column,index) in columns"
              :key="index"
              v-if="column.dataType===4"
              v-model="dataValue[index]"
              type="daterange"
              size="dateSize"
              style="display: none"
              :clearable="clearable"
              @change="selectedChange"
              >
          </el-date-picker>
          <template>
              <el-select
                placeholder="请选择"
                v-for="(column,i) in columns"
                v-model="IsPaidValue[column.name]"
                :key='column.sort'
                v-if="column.showDropDown"
                :clearable="clearable"
                :popper-class	="column.name"
                :name	="column.name"
                style="display: none"
                value-key="key"
                @change="selectedChange"
                @clear = "clearSelected(column.name)"
              >
                <el-option
                  v-for="item in column.dataMap "
                  :key="item.key"
                  :label="item.value"
                  :value="{dataMap:item,columnName:column.name,key:item.key}"
                  >
                </el-option>
              </el-select>
          </template>
          <el-table
              :data="itemSource"
              ref="baseElementGrid"
              :max-height="maxHeightData"
              :border="border"
              style="width: 100%"
              :empty-text="emptyText"
              :fit = "isFit"
              :highlight-current-row = "highlightCurrentRow"
              :height="height"
              :default-sort = "defaultSort"
              @row-contextmenu="rowContextmenu"
              @row-click = "rowClick"
              @cell-dblclick = "cellDblclick"
              @select = "select"
              @select-all="selectAll"
              @header-click="headerClick"
              >
                <el-table-column
                      v-for="column in (checkColumns.length ? checkColumns : columns)"
                      :type= "column.name === '_Checked' ? 'selection' : '' "
                      :name="column.name"
                      :key='column.name'
                      :binding="column.binding"
                      :label="column.header"
                      :width="column.width"
                      :isReadOnly="column.isReadOnly"
                      :fixed="isFixed"
                      :sortable="column.allowSorting"
                      :is-required="column.isRequired"
                      :column-key="column.binding"
                      :prop="column.binding"
                      :resizable="isResizable"
                      :align="align"
                      :header-align="headerAlign"
                      :show-overflow-tooltip="showOverflowTooltip"
                      :data-type="column.dataType"
                      v-if="column.name === '_Checked' "
                      >
                </el-table-column>
                <el-table-column
                      v-for="column in (checkColumns.length ? checkColumns : columns)"
                      :type= "column.name === '_Checked' ? 'selection' : '' "
                      :name="column.name"
                      :key='column.name'
                      :binding="column.binding"
                      :label="column.header"
                      :width="column.width"
                      :isReadOnly="column.isReadOnly"
                      :fixed="isFixed"
                      :class-name="type==='action'&&column.isReadOnly&&column.binding!=='operate'?'isReadOnlyColumn':''"
                      :sortable="column.allowSorting"
                      :is-required="column.isRequired"
                      :column-key="column.binding"
                      :prop="column.binding"
                      :resizable="isResizable"
                      :align="align"
                      :header-align="headerAlign"
                      :show-overflow-tooltip="showOverflowTooltip"
                      :data-type="column.dataType"
                      v-if="column.visible && column.name !== '_Checked'"
                      >
                        <template
                          scope="scope">
                          <div
                            v-if="column.dataType===5"
                            class="elementGridBtn">
                            <el-button
                              v-for="(button,index) in column.buttons"
                              :key="index"
                                size="mini"
                                :class="[column.name==='IsextensionResult'?'IsextensionResultGridBtn':'','eleBtnStyle']"
                                v-if="typeof button.when === 'undefined' ? true: (typeof button.when=== 'function' ? button.when(scope.row):button.when)"
                                v-html="typeof button.content === 'function' ? button.content(scope.row):button.content"
                                @click="button.click(scope.row)"
                                ></el-button>
                          </div>
                        <div
                            v-else-if="column.name === '_Checked' ? false : true  ">{{scope.row[column.name]}}
                        </div>

                        </template>
                </el-table-column>
          </el-table>
       </template>
       <div
        id="dblClickSelected"
        v-show="this.type==='action'&&isDblClickSelectedShow"
        >
          <el-select
            v-model="cellPaidValueL"
            key='dblselected'
            popper-class="editSelected"
            :clearable="!clearable"
            @change="dblClickSelectedChange"
          >
            <el-option
              v-for="(item,index) in  dblClickSelectedData"
              :key="index"
              :label="item.value"
              :value="item.key"
              >
            </el-option>
          </el-select>
        </div>
        <!-- 右击菜单 -->
        <div class="wj-right-menu"
            ref="contextMenu"
            v-show="rightMenuConfig.show"
            @blur="onContextMenuHide"
            @keyup.esc="onContextMenuHide"
            :style="{left:rightMenuConfig.left + 'px',top:rightMenuConfig.top + 'px'}"
          >
          <ul>
            <template
                    v-for="menu in gridRightMenus"
                    v-if="contextMenuDisplay(menu.display)">
              <li v-if="menu.type==='separator'"
                  class="divider"></li>
              <li v-else-if="contextMenuDisabled(menu.disabled)">
                <span>
                  <span>
                     <!-- <icon :name="menu.iconName"></icon> -->
                     {{menu.text}}
                  </span>
                </span>
              </li>
              <li v-else>
                <a href="#"
                  @click.stop.prevent="(e)=>{contextMenuClick(e,menu.click)}">
                  <icon :name="menu.iconName"></icon>{{menu.text}}</a>
              </li>
            </template>
          </ul>
        </div>
         <!-- 分页器 -->
      <el-row class="footer">
      <div style="float:left">
        <el-pagination small

                      v-if="onPageChanged&&totalCount>=0&&pageIndex>0"
                      layout="prev, pager, next, total"
                      :page-size="pageSize"
                      :total="totalCount"
                      :current-page.prop="pageIndex"
                      @current-change="onPageChanged"></el-pagination>
      </div>
      <div class="infoSelection"  v-if="checkboxBindingKey!==''">
          当前您选择了 <b>{{checkedRowsCount}}</b> 行
          <znl-button type="default"
                      size="small"
                      :isShow='true'
                      @click="clearSelection">
            <span>取消选中</span>
          </znl-button>
       </div>
       <div class="btnSaveAndCancel"  v-if="checkboxBindingKey!==''">
          <slot name="btach-save"></slot>
       </div>
    </el-row>
  </div>
</template>
<script>
import _ from 'underscore'
import copy from 'clipboard-copy'
// import Icon from 'vue-awesome/components/Icon'
import znlButton from './znlButton'
export default {
  components: {
    // Icon,
    znlButton
  },
  data () {
    return {
      rightMenuConfig: {
        show: false,
        left: 0,
        top: 0
      },
      checkColumns: [],
      fieldsFilter: {},
      emptyText: ' ',
      isFit: false, // 列的宽度是否自撑开
      isFixed: false, // 列是否固定在左侧或者右侧
      defaultSort: {
        prop: 'Model', // 默认排序的列
        order: 'ascending'
      }, // 默认排序的prop和顺序
      isResizable: true, // 是否可以拖动
      align: 'left', // 对齐方式left/center/right
      headerAlign: 'center', // 表头对齐方式
      showOverflowTooltip: true, // 当内容过长被隐藏时显示 tooltip
      clickCellData: {},
      propDomData: {},
      highlightCurrentRow: true,
      columnHeight: 30,
      isShowSort: 0,
      headerCell: {},
      propColor: '',
      dataValue: [], // 日期值
      dateSize: '',
      IsPaidValue: [], // 选择框数据
      cellPaidValueL: '', // 下拉选择框
      dblClickDataPickerValue: '', // 编辑日期数据
      clearable: true, // 日期、下拉框可删除
      isChecked: [], //
      allColors: [],
      cellContent: '',
      checkedRows: [], // 复选框选中的所有项(k,v)
      checkedRowsCount: 0,
      count: 0,
      filterMethodDataMap: [],
      tableData: [],
      canCommitFlag: false,
      currentSelection: [],
      dblClickSelectedData: [] // 双击单元格时的datamap
    }
  },
  props: {
    itemSource: {
      type: Array,
      default: []
    },
    maxHeightData: '',
    height: '', // 高度
    columns: {
      type: Array
    },
    type: '', // 类型 action base
    onSearch: {
      type: Function
    },
    isDblClickSelectedShow: {
      type: Boolean,
      default: false
    },
    optionsSelected: Object, // 双击选择框数据对象
    onPageChanged: Function,
    checkboxBindingKey: {
      type: String,
      default: ''
    },
    totalCount: {
      type: Number,
      default: 0
    },
    pageIndex: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 0
    },
    border: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    gridRightMenus () {
      const defaultMenus = [{
        iconName: 'copy',
        text: '复制',
        disabled: false,
        display: true,
        index: -4,
        click: (data) => {
          copy(data.cell)
        }
      }, {
        iconName: 'copy',
        text: '复制行',
        disabled: false,
        display: true,
        index: -3,
        click: (data) => {
          copy(data.rowText)
        }
      }, {
        iconName: 'refresh',
        text: '刷新',
        disabled: false,
        display: !!this.onRefresh,
        index: -2,
        click: (rowData, grid) => {
          this.onRefresh()
        }
      }]
      _.reject(this.rightMenus, menu => !this.contextMenuDisplay(menu.display)).length &&
        this.rightMenus[0].type !== 'separator' &&
        this.rightMenus.unshift({
          type: 'separator',
          index: -1
        })
      return _.sortBy(_.union(defaultMenus, this.rightMenus), 'index')
    }
  },
  methods: {
    ContextMenuShow () {
      this.rightMenuConfig.show = false
    },
    selectedChange (value) { // 头部搜索选项变化时
      // 设置搜索条件
      if (value.dataMap && !_.isUndefined(value.dataMap.key)) {
        this.fieldsFilter[value.columnName] = value.dataMap.key
      }
      let e = {}
      e.keyCode = 13
      _.delay(this.search, 200, e)
    },
    clearSelected (columnName) { // 头部搜索下拉框取消选择
      // 清空搜索条件
      this.fieldsFilter[columnName] = ''
    },
    rowContextmenu (row, e) { // 右键
      // 阻止右键默认行为
      e.returnValue = false
      let pathName = []
      _.each(e.path, item => {
        pathName.push(item.className)
      })
      if (_.contains(pathName, 'storageList')) {
        this.rightMenuConfig.left = e.screenX - 625
        this.rightMenuConfig.top = e.screenY - 190
      } else if (_.contains(pathName, 'el-dialog__wrapper')) {
        this.rightMenuConfig.left = e.screenX - 470
        this.rightMenuConfig.top = e.screenY - 200
      } else {
        this.rightMenuConfig.left = e.screenX + 10
        this.rightMenuConfig.top = e.screenY - 50
      }
      this.rightMenuConfig.show = true
      let rowText = ''
      if (e.path[2].localName === 'tr') {
        rowText = e.path[2].innerText
      } else if (e.path[3].localName === 'tr') {
        rowText = e.path[3].innerText
      }
      this.clickCellData = {
        cell: e.target.innerText,
        rowText: rowText,
        row: row
      }
    },
    clearSelection () { // 清空选择
      this.checkedRows = []
      this.checkedRowsCount = 0
      this.CurrentItem = null
      // 全部选择颜色取消
      let trs = this.$el.querySelectorAll('.el-table .el-table__body-wrapper tbody tr')
      let cells = this.$el.querySelectorAll('.el-table .el-table__body-wrapper tbody td .cell')
      let celldivs = this.$el.querySelectorAll('.el-table .el-table__body-wrapper tbody td .cell div')
      _.each(trs, item => {
        item.classList.remove('current-row')
      })
      _.each(cells, item => {
        if (item.style.backgroundColor) {
          item.style.backgroundColor = 'transparent'
        }
      })
      _.each(celldivs, item => {
        if (item.style.backgroundColor) {
          item.style.backgroundColor = 'transparent'
        }
      })
      return this.$refs.baseElementGrid.clearSelection()
    },
    cancelAllChecked () {
      return this.clearSelection()
    },
    search (event) { // 搜索
      if (event.keyCode === 13) {
        this.getGridValue()
        _.isFunction(this.onSearch) && this.onSearch(this.fieldsFilter)
        this.clearSelection()
      }
      if (event.ctrlKey && event.keyCode === 67) {
        copy(this.cellContent)
      }
    },
    getGridValue () { // 搜索取值
      let targetElement = this.$el
      let inps = targetElement.querySelector('.el-table').querySelectorAll('.el-table__header-wrapper thead tr:nth-child(1) input')
      for (let i = 0; i < inps.length; i++) {
        if (inps[i]) {
          if (inps[i].getAttribute('data-name')) {
            this.fieldsFilter[inps[i].getAttribute('data-name')] = inps[i].value
          }
          // else if (inps[i].getAttribute('name') && !this.fieldsFilter[inps[i].getAttribute('name')]) {
          //   this.fieldsFilter[inps[i].getAttribute('name')] = inps[i].value
          // }
          if (inps[i]) {
            inps[i].style.backgroundColor = '#fff'
            inps[i].style.borderRadius = '0px'
          }
          if (inps[i] && inps[i].value !== '') {
            inps[i].style.backgroundColor = '#FFAD66'
          }
        }
      }
      // console.log('最终', this.fieldsFilter)
    },
    setDatePlug (par) { // 日期控件
      let headerDateCellQuotedTime = this.$el.querySelector('.el-table__header-wrapper .el-table__header .el-input [data-name="' + par + '"]')
      if (headerDateCellQuotedTime) {
        let headerDate = headerDateCellQuotedTime.parentElement
        let date = this.$el.querySelector('.base-flex-grid .el-date-editor ')
        if (date && headerDate) {
          date.querySelector('.el-input__inner').setAttribute('data-name', par)
          date.style.display = 'block'
        }
        // if (!(headerDate === date)) {
        headerDate.replaceChild(date, headerDateCellQuotedTime)
        // }
      }
    },
    setSelectedPlug (obj, par, visible) { // 选择框
      let headerDateCellQuotedTime = obj.$el.querySelector('.el-table__header-wrapper .el-table__header .el-input [data-name="' + par + '"]')
      if (headerDateCellQuotedTime) {
        let headerDate = headerDateCellQuotedTime.parentElement
        let date = obj.$el.querySelector('.base-flex-grid .el-select')
        if (date && headerDate && visible) {
          date.style.display = 'block'
        } else {
          date.style.display = 'none'
        }
        if (!(headerDate === date)) {
          headerDate.replaceChild(date, headerDateCellQuotedTime)
        }
      }
    },
    rowClick (row, event, column) { // 单击行
      // 点击非编辑单元格时隐藏编辑单元格
      if (this.optionsSelected && this.optionsSelected.row && column && this.optionsSelected.row[this.optionsSelected.colname] !== row[column.columnKey]) {
        this.$emit('is-dblClick-selectedShow', {
          isShow: false
        })
        // 隐藏单元格后清空选择框的value
        // _.delay(() => {
        this.cellPaidValueL = ''
        // }, 200)
      }
      // 编辑选择框值改变时修改底色
      let editEndDiv = this.$el.querySelectorAll('.editEndDiv')
      _.each(editEndDiv, (item) => {
        if (item.getAttribute('editflag') === 'true') {
          item.style.backgroundColor = '#cdefff'
        } else {
          item.style.backgroundColor = 'transparent'
        }
      })
      if (column.columnKey !== '_Checked') {
        this.CurrentItem = row // 该行为单选中状态
        this.$emit('selection-changed', row)
        this.$emit('select-check-rows', row, !!row)
      }
      if (event) {
        // let dblClickInputs = this.$el.querySelectorAll('.dblClickInputStyle')
        // _.each(dblClickInputs, (item, index) => {
        //   item.style.backgroundColor = 'transparent'
        // })
        let dblClickInputStyleAll = this.$el.querySelectorAll('.dblClickInputStyleAll')
        _.each(dblClickInputStyleAll, (item, index) => {
          item.style.backgroundColor = 'transparent'
        })
        let trs = event.path[3].querySelectorAll('tr')
        for (let i = 0; i < trs.length; i++) {
          if (trs[i].classList) {
            trs[i].classList.remove('current-row')
          }
          trs[i].style.backgroundColor = '#fff'
        }
        this.rightMenuConfig.show = false // 隐藏右击菜单
        if (typeof this.propDomData.nodeName === 'string') {
          this.propDomData.style.backgroundColor = this.propColor
          this.propColor = event.target.style.backgroundColor
          let inps = event.path[2].querySelectorAll('input')
          _.each(inps, item => {
            item.style.backgroundColor = '#D4D4D4'
          })
          if (event.path[2].classList) {
            event.path[2].classList.add('current-row')
          }
        }
        this.propDomData = event.target
        event.target.style.backgroundColor = '#EDC600'
        // 按钮
        let elementBtns = this.$el.querySelectorAll('.elementGridBtn .el-button')
        _.each(elementBtns, (item) => {
          if (item.classList) {
            item.classList.remove('active')
          }
          let btns = []
          if (event.path[2].localName === 'tr') {
            btns = event.path[2].querySelectorAll('.elementGridBtn .el-button')
          } else if (event.path[3].localName === 'tr') {
            btns = event.path[3].querySelectorAll('.elementGridBtn .el-button')
          }
          _.each(btns, (itemDom) => {
            if (itemDom.classList) {
              itemDom.classList.add('active')
            }
          })
        })
      }
    },
    dblClickSelectedChange (value) { // 双击选择框变化时
      // 编辑选择框值发生改变时，将状态码改为false
      // console.log(this.cellPaidValueL, this.$el.querySelector('#dblClickSelected').style.display, this.cellPaidValueL === '' && this.$el.querySelector('#dblClickSelected').style.display !== 'none')
      if (this.optionsSelected.oldValue !== value && this.cellPaidValueL !== '') {
        this.optionsSelected.cell.querySelector('.cell').setAttribute('editflag', true)
        this.CurrentItem.isEdit = true
      } else if (this.cellPaidValueL === '' && this.$el.querySelector('#dblClickSelected').style.display === 'none') {
        this.optionsSelected.cell.querySelector('.cell').setAttribute('editflag', true)
      } else {
        this.optionsSelected.cell.querySelector('.cell').setAttribute('editflag', false)
      }
      if (this.optionsSelected.cell.querySelector('.cell') && this.optionsSelected.cell.querySelector('.cell').classList) {
        this.optionsSelected.cell.querySelector('.cell').classList.add('editEndDiv')
      }
      // 将itemSource中的值替换成编辑的值 弹出框处理：将显示值改变（实际值已经改变）
      if (_.isBoolean(value) || value) {
        // _.isArray(this.itemSource) ? this.itemSource[this.optionsSelected.rowIndex][this.optionsSelected.colname] = value : this.itemSource.items[this.optionsSelected.rowIndex][this.optionsSelected.colname] = value
        let innetValue = ''
        if (this.optionsSelected.column.dataMap) {
          _.each(this.optionsSelected.column.dataMap, map => {
            if (map.key === value) {
              innetValue = map.value
            }
          })
        }
        this.itemSource[this.optionsSelected.rowIndex][this.optionsSelected.colname] = innetValue
        this.optionsSelected.cell.querySelector('.cell div').innerText = innetValue
        // value = ''
      }
    },
    cellDblclick (row, column, cell, event) { // 双击单元格
      if (column.dataMap) {
        this.dblClickSelectedData = column.dataMap
      }
      this.CurrentItem = row
      let col = {}
      _.each(this.columns, item => {
        if (item.binding === column.columnKey) {
          col = _.extend(column, item)
        }
      })
      this.$emit('ondblclick', row, col, cell, event)
    },
    onContextMenuHide (e) { // 右键
      e.preventDefault()
      const hideContextMenu = () => {
        this.rightMenuConfig.show = false
        this.$emit('hide:contextmenu', e)
        this.$nextTick(() => {
          this.$emit('hidden:contextmenu', e)
        })
      }
      if (e.relatedTarget && e.relatedTarget.tagName === 'A') {
        _.delay(_ => {
          hideContextMenu()
        }, 150)
      } else {
        hideContextMenu()
      }
    },
    contextMenuDisabled (display = true) { // 右键判断
      if (this.rightMenuConfig.show) {
        if (_.isBoolean(display)) {
          return display
        } else {
          return false
        }
      }
      return true
    },
    contextMenuDisplay (display = true) { // 右键判断
      if (this.rightMenuConfig.show) {
        if (_.isBoolean(display)) {
          return display
        } else {
          return false
        }
      }
      return true
    },
    select (selection, row) { // 单选
      // this.$emit('select-check-rows', row, !!selection.length)
      // this.$emit('selection-changed', row)
      // 增加
      let rowflag = true
      _.each(this.checkedRows, checked => {
        if (_.isEqual(checked, row)) {
          rowflag = false
        }
      })
      // 如果不存在添加
      if (rowflag) {
        this.checkedRows.push(row)
      } else {
        let id
        for (let i = 0; i < _.keys(row).length; i++) {
          if (/GUID/.test(_.keys(row)[i]) || /Guid/.test(_.keys(row)[i]) || /PSID/.test(_.keys(row)[i]) || /ApplyRevokeTime/.test(_.keys(row)[i]) || /CAutoID/.test(_.keys(row)[i])) {
            id = _.keys(row)[i]
            break
          }
        }
        for (let i = 0; i < this.checkedRows.length; i++) {
          if (this.checkedRows[i][id] === row[id]) {
            this.checkedRows.splice(i, 1)
            this.CurrentItem = null
          }
        }
      }
      this.checkedRowsCount = this.checkedRows.length
    },
    selectAll (selection) { // 全选
      if (selection.length === 0) {
        let id
        for (let i = 0; i < _.keys(this.checkedRows[0]).length; i++) {
          if (/GUID/.test(_.keys(this.checkedRows[0])[i]) || /Guid/.test(_.keys(this.checkedRows[0])[i]) || /PSID/.test(_.keys(this.checkedRows[0])[i]) || /ApplyRevokeTime/.test(_.keys(this.checkedRows[0])[i]) || /CAutoID/.test(_.keys(this.checkedRows[0])[i])) {
            id = _.keys(this.checkedRows[0])[i]
            break
          }
        }
        for (let i = 0; i < this.checkedRows.length; i++) {
          _.each(this.itemSource, item => {
            if (this.checkedRows[i] && this.checkedRows[i][id] === item[id]) {
              this.checkedRows.splice(i, 1)
            }
          })
        }
      } else {
          // 全选不为空 增加当页所有
        let catchRows = []
        _.each(selection, selected => {
          let flag = true
          _.each(this.checkedRows, item => {
            if (_.isEqual(selected, item)) {
              flag = false
            }
          })
          if (flag) {
            catchRows.push(selected)
          }
        })
        if (catchRows.length > 0) {
          _.each(catchRows, item => {
            this.checkedRows.push(item)
          })
        }
      }
      this.checkedRowsCount = this.checkedRows.length
      // }
    },
    headerClick (column, event) { // 表头点击
      if (!column.sortable) return
      let spanSort = event.target.querySelectorAll('.caret-wrapper i')
      if (this.headerCell !== event.target) {
        this.isShowSort = 0
      }
      if (event.target.nodeName === 'DIV') {
        if (spanSort[0] && spanSort[1]) {
          if (this.isShowSort === 0) {
            this.isShowSort++
            spanSort[0].style.display = 'none'
            spanSort[1].style.display = 'block'
          } else if (this.isShowSort === 1) {
            this.isShowSort++
            spanSort[0].style.display = 'block'
            spanSort[1].style.display = 'none'
          } else if (this.isShowSort === 2) {
            this.isShowSort = 0
            spanSort[0].style.display = 'none'
            spanSort[1].style.display = 'none'
          }
        }

        this.headerCell = event.target
      } else {
        for (let i = 0; i < spanSort.length; i++) {
          spanSort[i].onclick = function (e) {
            e.stopPropagation()
            e.preventDefault
            return false
          }
          // on(spanSort[i], 'click', function (e) {
          //   e.stopPropagation()
          //   e.preventDefault
          //   return false
          // })
        }
      }
    },
    gridItemSourceData () {
      return this.itemSource
    },
    getCheckedRows () { // 获取所有选择项
      var rows = []
      _.each(this.checkedRows, function (val) {
        rows.push(val)
      })
      return rows
    },
    getCurrentSelection () { // 获取当前页所有选择项
      return this.currentSelection
    },
    selectionChange (selection) { // 选项发生变化时,当前选择项,类似账号权限设置已带勾选项再次勾选时需要返回该值
      this.currentSelection = selection
    },
    getSelectedRows () { // 选择数据
      if (this.isMultiRowsCheck) {
        if (_.filter(this.gridItemSource.items, item => item[CHECK_COLUMN_NAME]).slice().length <= 0) {
          // console.log('选择', this.checkedRows, this.CurrentItem)
          return this.checkedRows.length !== 0 ? this.checkedRows : (_.isNull(this.CurrentItem) ? [] : [this.CurrentItem])
        } else {
          return _.filter(this.gridItemSource.items, item => item[CHECK_COLUMN_NAME]).slice()
        }
      } else {
        // console.log(this.checkedRows)
        return this.checkedRows.length !== 0 ? this.checkedRows : (_.isNull(this.CurrentItem) ? [] : [this.CurrentItem])
      }
    }
  },
  mounted () {
    // 加入表头搜索
    // console.log('mounted', this)
    let thead = this.$el.querySelector('thead')
    let newTr = document.createElement('tr')
    newTr.setAttribute('class', 'searchInp')
    let str = ''
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible) {
        if (!this.columns[i].isFieldSearch || this.columns[i].name === '_Checked') {
          str += '<th><div class="el-input" style="padding:0px"><input readonly="readonly" data-name="' + this.columns[i].name + '" autocomplete="off" height=30 type="text"  class="el-input__inner searchInp"></div></th>'
        } else if (this.columns[i].isFieldSearch && this.columns[i].showDropDown) {
          str += '<th><div class="el-input" style="padding:0px"><input data-name="' + this.columns[i].name +
            '" autocomplete="off" height=30 type="text"  class="el-input__inner searchInp"></div></th>'
        } else {
          str += '<th><div class="el-input" style="padding:0px"><input data-name="' + this.columns[i].name +
            '" autocomplete="off" height=30 type="text"  class="el-input__inner searchInp"><i class="el-input__icon el-icon-circle-close" style="display:none"></i></div></th>'
        }
      }
    }
    newTr.innerHTML = str
    thead.insertBefore(newTr, thead.firstChild)
    // if (!this.isFieldsSearch) {
    //   let elHeaderTr = this.$el.querySelectorAll('.el-table .el-table__header-wrapper thead tr.searchInp')[0]
    //   if (elHeaderTr) {
    //     elHeaderTr.style.display = 'none'
    //   }
    // }

    let _this = this
    let searchInputsIcon = newTr.querySelectorAll('.searchInp')
    _.each(searchInputsIcon, item => {
      item.onkeyup = function () {
        let icon = item.parentElement.querySelector('.el-input__icon')
        if(icon){
          if (item.value) {
            icon.style.display = 'block'
            icon.onclick = function () {
              item.value = ''
              let e = {}
              e.keyCode = 13
              _.delay(_this.search, 100, e)
              icon.style.display = 'none'
            }
          } else {
            icon.style.display = 'none'
          }
        }
      }
    })
    let searchInputs = newTr.querySelectorAll('input')
    _.each(searchInputs, (item) => {
      item.onkeydown = this.search
    })
    // 加入下拉框及日期框
    let columnsConfig = []
    _.each(this.columns, item => {
      if (item.visible) {
        columnsConfig.push(item)
      }
    })
    // console.log(columnsConfig)
    try {
      for (let i = 0; i < columnsConfig.length; i++) {
        if (columnsConfig[i].dataType && columnsConfig[i].dataType === 4) {
          this.setDatePlug(columnsConfig[i].name)
        }
      }
      for (let i = 0; i < columnsConfig.length; i++) {
        if (columnsConfig[i].showDropDown && columnsConfig[i].visible) {
          this.setSelectedPlug(this, columnsConfig[i].name, columnsConfig[i].visible)
        }
      }
    } catch (err) {}
  },
  updated () {
    // console.log(this.checkedRows)
  }
}
</script>
<style>
  .el-table .el-table__header-wrapper .cell, .el-table th>div{
    padding-left: 0;
    padding-right: 0;
  }
  /* 单元格间距 */
  .el-table .el-table__body-wrapper td .cell, .el-table__body td>div{
    padding: 0 0px;
  }
  .el-table__row td .cell .el-checkbox{
    height: 30px;
  }
    .znl-grid .el-button.el-button--default.eleBtnStyle {
    margin: 0;
    padding: 0;
  }
  /* 搜索框 */
  .el-input .el-input__inner.searchInp{
    height:30px;
    margin: 0;
    border-radius: 0;
    padding: 0 5px;
    border: none;
  }
  /* 表头选择日期框 */
  .el-input .el-input input{
    border: none;
    border-radius: 0;
    height: 30px;
  }
  .el-input .el-input__inner.searchInp:focus{
    border: none;
  }
  /* 表头cell */
  .el-table .el-table__header-wrapper .cell .caret-wrapper i{
    display: none;
  }
  /* body cell框 */
  .el-table .el-table__row .cell{
    line-height: 30px;
    position: relative;
  }
  /* 操作按钮 */
  .el-table .el-table__row .cell .elementGridBtn,.IsAdoptStkTxtBtn{
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .elementGridBtn .el-button,.IsAdoptStkTxtBtn .el-button{
      transition: none;
      border: none!important;
      padding: 3px;
      border-radius: 3px;
      color: #EE7700;
      text-decoration: underline;
      background-color: transparent;
  }
  .elementGridBtn .el-button.tgactive{
    color: #ED9E00;
  }
  .elementGridBtn .el-button.active{
    background-color: transparent;
  }
  .elementGridBtn .el-button span{
    background-color: transparent!important;
  }
  .elementGridBtn .IsextensionResultGridBtn{
    color:#6B6B6A;
    text-decoration: none;
  }
  .elementGridBtn .el-button:hover{
      background-color: #EE7700;
      color: #fff;
      text-decoration: none;
  }

  .el-table .el-table__row .cell>div{
    padding: 0 5px;
  }
  .el-table .el-table__row .cell .el-checkbox{
    left: 50%;
    transform: translateX(-50%);
  }
  .el-table  .cell .el-checkbox .el-checkbox__input.is-checked .el-checkbox__inner{
    background-color: #ff7700;
    border-color: #e46b01;
  }

  .el-table tbody{
    font-size: 12px;
  }
  .el-table tbody tr.current-row>td{
    background-color: #D4D4D4!important;
  }
  .el-table thead th,.el-table thead th .el-input{
    height:30px;
    line-height: 10px;
  }
  .el-table tbody td {
    height: 30px;
  }
  /* 日期控件 */
  .base-flex-grid .el-date-editor--daterange.el-input{
    width:100%;
  }
  .znl-pagination{
    width: 270px;
  }
  .znl-pagination .el-pagination__total{
    width:40px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .btnSaveAndCancel{
    position: absolute;
    top: 7px;
    right: 50px;
  }
  /* 表头 */
  .el-table__footer-wrapper thead div, .el-table__header-wrapper thead div{
    background-color: #525A66;
    color: #fff;
    font-weight: 500;
  }
    /* // 右键菜单 */
  .wj-right-menu {
    padding: 0;
    margin: 0;
    background-color: #fff;
    border: 1px solid #d1dbe5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .12);
    padding: 6px 0;
    top: 0;
    left: 0;
    min-width: 100px;
    position: fixed;
    z-index: 9999;
    }
  .wj-right-menu:focus {
    outline: none;
  }
  .wj-right-menu ul{
    margin: 0;
    padding: 0;
  }
  .wj-right-menu li{
    padding: 0;
    margin: 0;
    min-width: 120px;
    list-style: none;
  }
  .wj-right-menu li span {
    color: lighten(#000, 60%);
  }
  .wj-right-menu li span .fa-icon {
    color: lighten(#000, 80%);
  }
  .wj-right-menu li.divider {
    height: 1px;
    margin: 9px 0;
    overflow: hidden;
    background-color: #eee;
  }
  .wj-right-menu li a,.wj-right-menu li span {
    /* padding: 0 10px 0 30px; */
    font-size: 12px;
    color: #222;
    display: block;
    height: 26px;
    line-height: 26px;
    text-decoration: none;
    position: relative;
    cursor: pointer;
  }
  .wj-right-menu li a:hover,.wj-right-menu li span:hover {
    background-color: #FF7700
  }
  .wj-right-menu li a .fa-icon,.wj-right-menu li span .fa-icon {
    height: 14px;
    color: #777;
    position: absolute;
    left: 10px;
    top: 7px;
  }

  .footer {
    display: flex;
    align-items: center;
    padding: 5px;
  }
  .footer .infoSelection{
    float: left;
    font-size: 12px;
  }
  /* 分页器 */
  .footer .el-pagination .el-pager li.active{
    background-color: #FF7700;
    border: none;
  }
  /* 双击下拉选择框 */
  #dblClickSelected{
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height:30px;
    border-radius: 0;
    box-sizing: border-box;
    z-index: 10;
  }
  #dblClickSelected .el-select{
    width: 100%;
    height: 30px;
  }
  /* 编辑单元格input的resize-triggers */
  #dblClickSelected .resize-triggers, .resize-triggers > div, .contract-trigger:before{
    top:-1px;
  }
  #dblClickSelected .el-input{
      width: 100%;
      padding: 0px;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      border: 1px solid #ED9E00;
      border-radius: 0;
      position: relative;
      top: -1px;
    }
  #dblClickSelected .el-input  .el-input__inner{
    width: 100%;
    font-size: 12px;
    border: none;
    padding: 0 5px;
    border-radius: 0;
    outline: none;
    height: 30px;
  }
  #dblClickSelected .el-input .el-input__icon{
    width: 10px;
    height: 10px;
    line-height: 30px;
    position: absolute;
    top: 25px;
    right: 9px;
    transition: none;
  }
  #dblClickSelected .el-input .el-input__icon.is-reverse{
    top:5px;
  }
  /* 编辑input */
  .dblClickInputStyleAll{
    position: absolute;
    z-index: 9999;
    top:0;
    left:0;
  }
  /* action只读列 */
  .isReadOnlyColumn{
    background-color: #F0F0F0;
  }

</style>

