<template>
  <div class="action-flex-grid">
    <base-element-grid ref="baseFlexGrid"
                    :columns="columns"
                    :height="height"
                     :is-btn="isBtn"
                     type="action"
                    :min-height="minHeight"
                    :max-height="maxHeight"
                    :frozen-columns="frozenColumns"
                    :item-source="itemSource"
                    :is-multi-rows-check="isMultiRowsCheck"
                    :is-fields-search="isFieldsSearch"
                    :search-fields="searchFields"
                    :column-colors="columnColors"
                    :row-colors="rowColors"
                    :page-size="pageSize"
                    :page-index="pageIndex"
                    :total-count="totalCount"
                    :right-menus="gridRightMenus"
                    :on-search="onSearch"
                    :on-refresh="onRefresh"
                    :on-page-changed="onPageChanged"
                    :masterFlag="masterFlag"
                    :isShowPagination="isShowPagination"
                    :dblClickSelectedData="dblClickSelectedData"
                    :isDblClickSelectedShow = "isDblClickSelectedShow"
                    :isdblClickDataPickerShow = "isdblClickDataPickerShow"
                    :optionsSelected="optionsSelected"
                    @ondblclick="ondblclick"
                    @select-check-rows="(val,check)=>{$emit('select-check-rows',val,check)}"
                    @selection-changed="(val)=>{$emit('selection-changed',val )}"
                    @is-dblClick-selectedShow="dblSelectionChanged"
                    :checkboxBindingKey="checkboxBindingKey">
      <div slot="btach-save">
           <el-button type="primary"
                     size="mini"
                     class="saveandout"
                     style="border:1px solid #DFE2E5;background:none;color:#999999;padding:7px 16px"
                     @click="cancelEdit"
                   >
            撤消修改</el-button>
          <el-button type="primary"
                     size="mini"
                     style="margin-left:20px;padding:7px 16px"
                     class="znl-btn savebtn"
                     @click="saveRows"
                    >
            保存修改</el-button>
      </div>

    </base-element-grid>
    <el-dialog :title="dialog.title"
               :max-height="369"
               v-for="dialog in dialogs"
               :key="dialog"
               v-model="dialog.show">
      <div class="znl-search">
        <el-input v-model="dialog.searchTxt"
                  @keyup.enter.native="dialog.onSearch"></el-input>
        <el-button type="primary"
                   @click="dialog.onSearch">搜索</el-button>
      </div>
      <el-table class="wj-table"
                highlight-current-row
                v-if="dialog.columns&&dialog.columns.length"
                v-loading="dialog.loading"
                :data="dialog.itemSource"
                @current-change="val=>{dialog.selectedRowData=val}">
        <el-table-column v-for="column in dialog.columns"
                         v-if="column.visible"
                         :key="column.name"
                         :property="column.binding"
                         :label="column.header"
                         :width="column.width"
                         :min-width="80"
                         :show-overflow-tooltip="true"></el-table-column>
      </el-table>

      <span slot="footer">
        <el-pagination small
                       v-if="dialog.onPageChanged&&dialog.totalCount>0&&dialog.pageIndex>0"
                       layout="prev, pager, next, total"
                       :page-size="dialog.pageSize"
                       :total="dialog.totalCount"
                       :current-page.prop="dialog.pageIndex"
                       @current-change="dialog.onPageChanged"></el-pagination>
        <el-button type="primary"
                   :disabled="!dialog.selectedRowData"
                   @click="()=>{dialog.show=false,dialog.action='confirm'}">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
import _ from 'underscore'
import BaseElementGrid from './baseElementGrid'
import { mixin as actionMixin, options as actionOptions } from './scripts/action'
// import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'ZnlActionFlexGrid',
  mixins: [actionMixin],
  components: {
    // BaseFlexGrid
    BaseElementGrid
    // Icon
  },
  data () {
    return {
      editedRows: [],
      cacheItemSource: [],
      // editingSelection: null,
      tags: [],
      currentTags: [],
      dialogs: [],
      addDialogConfig: {
        show: false,
        left: 0,
        right: 0
      },
      editFlag: '',
      GUIDType: '',
      dblClickSelectedData: [],
      isDblClickSelectedShow: false,
      isdblClickDataPickerShow: false,
      optionsSelected: {}
    }
  },
  props: {
    checkboxBindingKey: {
      type: String,
      default: ''
    },
    isBtn: true,
    flexS: {},
    masterFlag: Boolean,
    isShowPagination: Boolean,
    onBeforeAddRow: Function
  },
  computed: {
    gridRightMenus () {
      const defaultMenus = [
      //   {
      //   iconName: 'plus',
      //   text: '添加',
      //   disabled: (grid, ht) => this.grid && this.rowAddable(grid, ht),
      //   display: this.showAddRowRightMenu,
      //   index: -13,
      //   click: (rowData, grid) => {
      //     this.addRow()
      //   }
      // },
        {
          iconName: 'save',
          text: '保存',
          disabled: (grid, ht) => this.grid && this.showSaveRowRightMenuDisabled && this.rowSaveable(grid, ht),
          display: this.showSaveRowRightMenu,
          index: -12,
          click: (rowData, grid) => {
            this.saveRows()
          }
        },
        {
          iconName: 'minus',
          text: '删除',
          disabled: (grid, ht) => this.grid && this.rowDeleteable(grid, ht),
          display: this.showDeleteRowRightMenu,
          index: -11,
          click: (rowData) => {
            rowData && this.deleteRow(rowData.row)
          }
        }]
      _.some(defaultMenus, menu => menu.display) && defaultMenus.push({
        type: 'separator',
        index: -10
      })
      return _.union(defaultMenus, this.rightMenus)
    }
  },
  watch: {

  },
  methods: {
    search () {
      return this.$refs.baseFlexGrid.search()
    },
    ondblclick (row, column, cell, event) { // 双击编辑
      this.optionsSelected.row = row
      this.optionsSelected.column = column
      this.optionsSelected.cell = cell
      this.optionsSelected.oldValue = row[column.columnKey]
      let itemList = this.$refs.baseFlexGrid.gridItemSourceData()

      // cell.querySelector('.cell').setAttribute('oldValueFlag', true)
      // 行序号
      let rowIndex = 0
      _.each(itemList, (itemRow, index) => {
        if (row === itemRow) {
          rowIndex = index
        }
      })

       // 将编辑前的原值存储
      this.cacheItemSource = _.isArray(this.itemSource) ? this.itemSource : this.itemSource.items
      if (_.isNull(cell.querySelector('.cell').getAttribute('oldValue'))) {
        cell.querySelector('.cell').setAttribute('rowIndex', rowIndex)
        cell.querySelector('.cell').setAttribute('columnName', column.columnKey)
        cell.querySelector('.cell').setAttribute('oldValue', this.transformSubmitValue([row[column.columnKey]])[0] || '')
      }
      // 列序号
      let cols = this.$refs.baseFlexGrid.checkColumns
      let colIndex = 0
      let colsList = []
      _.each(cols, (colitem, index) => {
        if (colitem.visible) {
          colsList.push(colitem)
        }
      })
      _.each(colsList, (colitem, index) => {
        if (colitem.name === column.columnKey) {
          colIndex = index
        }
      })
      // console.log('列序号', colIndex)
      this.optionsSelected.colIndex = colIndex
      // 行GUID
      let keys = []
      if (_.isArray(this.itemSource)) {
        for (let key in this.itemSource[0]) {
          keys.push(key)
        }
      } else {
        for (let key in this.itemSource.items[0]) {
          keys.push(key)
        }
      }
      _.each(keys, (id) => {
        // console.log(/GUID/.test(id))
        if (/GUID/.test(id)) {
          this.GUIDType = id
        }
      })
      if (!this.GUIDType) {
        this.GUIDType = 'CompanyID'
      }
      // grid对象
      let gridobj = {
        row: row,
        rows: itemList,
        column: column,
        inpValue: row[column.property],
        getColumn: (name) => {
          for (let i = 0; i < cols.length; i++) {
            if (name === cols[i].name) {
              return {
                col: cols[i],
                index: i
              }
            }
          }
        },
        setCellData: (r, c, v) => {
          let trs = this.$el.querySelectorAll('.el-table .el-table__body-wrapper .el-table__body tbody tr')
          let containerOld = trs[r].querySelectorAll('td')[c].querySelector('.cell div')
          let containerNew = trs[r].querySelectorAll('td')[c].querySelector('.cell input')
          containerOld ? containerOld.innerText = v : containerNew.value = v
        }
      }
      // 增加选择框或下拉框
      let nowColumn = _.find(this.$refs.baseFlexGrid.columns, item => {
        return item.name === column.columnKey
      })
      if (!column.isReadOnly && nowColumn.showDropDown) {
        this.isDblClickSelectedShow = true
        this.dblClickSelectedData = nowColumn.dataMap
        let dblClickSelected = this.$el.querySelector('#dblClickSelected')
        this.optionsSelected.placeholder = cell.innerText
        this.optionsSelected.rowIndex = rowIndex
        this.optionsSelected.colname = column.columnKey
        cell.appendChild(dblClickSelected)
      //  else if (!column.isReadOnly && column.dataType && column.dataType === 4) {
      //   console.log(4)
      // }
      }else if (!column.isReadOnly && !cell.querySelector('div input')) {
        // 增加input
        let container = cell.querySelector('div div')
        console.log(container)
        let inp = document.createElement('input')
        inp.style.height='30px'
        inp.setAttribute('type', 'text')
        inp.style.backgroundColor = '#fff'
        let autofocusInps = this.$el.querySelectorAll('.focusInput')
        if (autofocusInps) {
          _.each(autofocusInps, (item) => {
            item.classList.remove('focusInput')
          })
        }
        inp.setAttribute('class', 'dblClickInputStyle')
        inp.classList.add('dblClickInputStyleAll')
        inp.classList.add('focusInput')
        inp.onfocus = function (e) {
          inp.classList.add('dblClickInputFocus')
          inp.classList.remove('dblClickInputBlur')
        }

        inp.value = cell.innerText
        // 失去焦点
        inp.onblur = (e) => {
          // console.log(aftervalue, beforevalue, colname, gridobj, rowindex, colindex)
          let colsBefor = this.$refs.baseFlexGrid.columns
          // 获取未隐藏列
          let cols = []
          _.each(colsBefor, item => {
            if (item.visible) {
              cols.push(item)
            }
          })
          inp.classList.remove('dblClickInputFocus')
          if ((_.isNull(row[column.property]) || _.isUndefined(row[column.property]) ? '' : row[column.property] + '') === inp.value + '') {
            inp.parentElement.setAttribute('editFlag', 'false')
            inp.parentElement.classList.add('editEndDiv')
          } else {
             // 双击的编辑的行再用于数据保存请求，减轻服务器压力
            row.isEdit = true
            inp.parentElement.setAttribute('editFlag', 'true')
            inp.parentElement.classList.add('editEndDiv')
            if (_.isFinite(inp.value)) {
              let inpValue = parseFloat(inp.value)
              row[column.property] = inpValue
            } else {
              row[column.property] = inp.value
            }
            // console.log(typeof row[column.property])
          }

          this.$emit('edit:cell-ended', inp.value, inp.parentElement.getAttribute('oldvalue') || '', column.property, gridobj, rowIndex, colIndex)
          // console.log(inp.value, inp.parentElement.getAttribute('oldvalue') || '')
          // 数据改变
          // this.$refs.baseFlexGrid.gridItemSourceData()[rowIndex][column.property] =
          // 给父元素加上类
          inp.parentElement.classList.add('dblClickInputStyle')
          // 失去焦点时将值显示
          inp.parentElement.querySelector('div').innerText = inp.value || ''
          // 替换input
          e.target.parentElement.removeChild(inp)
        }
        // container.removeChild(container.children[0])
        container.appendChild(inp)
        this.$el.querySelector('.focusInput').focus()
      }
    },
    dblSelectionChanged (val) {
      this.isDblClickSelectedShow = val.isShow
    },
    selectionChanged (s, e) {
      if (s.columns[e.col].name === '_checked') return
      if (e.row > -1) {
        let rowData = s.collectionView.items[e.row]
        if (actionOptions.isRowDataChanged.call(this, this.editedRows, rowData)) {
          // this.editingSelection = s.selection
        } else {
          // this.editingSelection = null
        }
      } else {
        // this.editingSelection = null
      }
    },
    getCheckedRows () {
      return this.$refs.baseFlexGrid.getCheckedRows()
    },
    getCheckedKeys () {
      return this.$refs.baseFlexGrid.getCheckedKeys()
    },
    cancelAllChecked () {
      this.$refs.baseFlexGrid.cancelAllChecked()
    },
    refreshCheckedCount (delKeys) {
      this.$refs.baseFlexGrid.refreshCheckedCount(delKeys)
    },
    gridItemSourceData () {
      return this.$refs.baseFlexGrid.gridItemSourceData()
    },
    clearSelection () { // 清空选择
      return this.$refs.baseFlexGrid.clearSelection()
    },
    getCurrentSelection () {
      return this.$refs.baseFlexGrid.getCurrentSelection()
    }
  }
}
</script>

<style>
/* // @import 'app/assets/styles/variables';
// @import 'app/assets/styles/mixins'; */


/* .action-flex-grid {
  position: relative;
  .wj-flexgrid {
    .wj-add-dialog {
      padding: 7px 6px;
      min-width: 72px;
      background-color: lighten($brand-warning, 20%);
      text-align: center;
      position: absolute;
      z-index: 1000;
      @include box-shadow(3px 3px rgba(0, 0, 0, .075), 0 0 8px lighten($black, 80%));

      ul.wj-tag {
        margin-bottom: 5px;
        li {
          margin: 5px;
          padding: $padding-xs-vertical $padding-xs-horizontal;
          color: $gray-dark;
          background-color: $white;
          border-radius: $border-radius-small;
          display: inline-block;
          font-weight: 600;

          &.wj-tag-exist {
            background-color: $white;
          }
          a {
            text-decoration: $link-hover-decoration;
          }
        }
      }
    }

    .el-dialog {
      .el-pagination {
        float: left;
      }
    }

    .wj-cells {
      .wj-cell {
        &.wj-state-beginEdit:not(.wj-state-readonly) {
          border: 1px solid #ED9E00;
        }
        &.wj-state-editing:not(.wj-state-readonly) {
          // background-color: lighten($brand-warning, 20%) !important;
          background: #CCEEFF !important;
          &.wj-state-selected {
            background-color: lighten($brand-warning, 10%) !important;
          }
        }
        &.wj-state-saving {
          background-color: lighten($black, 95%) !important;
        }
        &.wj-state-error,
        &.wj-state-error input {
          color: $brand-danger !important;
          &:not(.wj-state-readonly) {
            background-color: lighten($brand-warning, 20%) !important;
          }
        }
        &.wj-state-readonly:not(.wj-header):not(.wj-group):not(.wj-state-selected):not(.wj-state-multi-selected):not(.wj-data-operate) {
          background-color: lighten($black, 95%) !important;
        }

        .wj-tag-icon {
          width: 22px;
          line-height: 22px;
          color: lighten($black, 80%) !important;
          text-align: center;
          position: absolute;
          top: 0px;
          right: 0px;
          bottom: 0px;
          cursor: pointer;

          &:hover {
            color: lighten($black, 40%) !important;
          }
        }

        &.wj-date {
          padding: 0;
          .el-date-editor.el-input {
            width: 100%;
            .el-input__inner {
              background-color: transparent;
              border: none;
              border-radius: 0;
            }
            .el-input__icon {
              display: none;
              width: 22px;
              color: lighten($black, 70%);
              &+.el-input__inner {
                padding: 3px
              }
            }
          }
        }

        &.wj-dropdown {
          padding: 0;
          .el-select {
            width: 100%;
            .el-input__inner {
              background-color: transparent;
              border: none;
              border-radius: 0;
            }
            .el-input__icon {
              width: 22px;
              color: lighten($black, 70%);
              &+.el-input__inner {
                padding: 3px
              }
            }
          }
        }
      }
    }
  }
} */


.wj-listbox {
  z-index: 9998 !important;
}
.wj-listbox.wj-content {
    border-radius: 0;
}
.wj-listbox .wj-listbox-item.wj-state-selected {
  background-color: #FF7700;
}

.el-button.znl-btn.el-button--default.el-button--mini{
  color: #666666;
  background-color: #ffffff;
  border: 1px solid #E6EAEE !important;
  border-radius: 4px;
  padding: 2px 5px;
  margin-right: 10px;
}

.el-button.znl-btn.el-button--default.el-button--mini:hover{
    background-color: #E6E6E6;
    border-color: #E6E6E6;
    color: #555555;
    transition: background-color .8s;
}

.saveandout:hover{
  background-color: #FFF7E7!important
}
.dblClickInputStyleAll{
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 5px;
  outline:medium;
  border:none;
  position: absolute;
  top: 0;
  left: 0;
}
.dblClickInputFocus{
  border: 1px solid #ED9E00;

}
.dblClickInputBlur{
   background-color :#CDEFFF!important;
}
 /* 保存修改 撤销修改按钮 */
.btnSaveAndCancel{
    position: absolute;
    top: 7px;
    right: 10px;
}
.btnSaveAndCancel .savebtn{
  background-color: #ED9E00;
  border: none;
}

</style>
