<template>
  <div class="action-flex-grid">
    <action-element-grid ref="actionFlexGrid"
                    :columns="columns"
                    :height="height"
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
                    :on-before-add-row="onBeforeAddRow"
                    :isShowPagination="isShowPagination"
                     @edit:cell-ended="(value,oldValue,colName,grid,rowIndex,colIndex)=>{$emit('edit:cell-ended',value,oldValue,colName,grid,rowIndex,colIndex)}"
                    @grid-initialized="initialized"
                    @selection-changed="(val)=>{$emit('selection-changed',val )}">
    </action-element-grid>
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
      <el-table highlight-current-row
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
// import Icon from 'awesome-icon'
import ActionElementGrid from './actionElementGrid'
import znlDialog from './znlDialog'
import { mixin as editMixin, options as editOptions } from './scripts/edit'
import { ButtonGroup, Button, Input, Dialog, Table, TableColumn, Pagination } from 'element-ui'

export default {
  name: 'ZNLEditFlexGrid',
  mixins: [editMixin],
  components: {
    ActionElementGrid,
    znlDialog,
    // Icon,
    elDialog: Dialog,
    elTable: Table,
    elTableColumn: TableColumn,
    elInput: Input,
    elButtonGroup: ButtonGroup,
    elButton: Button,
    elPagination: Pagination
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
      }
    }
  },
  props: {
    onSearch: Function,
    onBeforeAddRow: Function,
    masterFlag: Boolean,
    isShowPagination: Boolean
  },
  computed: {
    gridRightMenus () {
      const defaultMenus = [{
        iconName: 'plus',
        text: '添加行',
        disabled: (grid, ht) => this.grid && this.isAddingNewRow(),
        display: this.showAddRowRightMenu,
        index: -12,
        click: (rowData, grid) => {
          this.addRow()
        }
      },
      {
        iconName: 'minus',
        text: '删除行',
        disabled: (grid, ht) => grid.rows[ht.row].cssClass === editOptions.stateCssClass.saving || grid.itemsSource.currentPosition < 0,
        display: this.showDeleteRowRightMenu,
        index: -11,
        click: (rowData, grid) => {
          rowData && this.deleteRow(rowData)
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
    // columns (val) {
    //   this.$nextTick(() => {
    //     _.each(val, column => {
    //       console.log(this)
    //       let col = this.columns.getColumn(column.name)

    //       col.isReadOnly = column.isTag || column.isReadOnly || !column.editable
    //       if (column.isReadOnly) col.cssClass = editOptions.stateCssClass.readonly
    //     })
    //   })
    // },
    editingSelection (val) {
      if (val && val.row > -1) {
        let editRow = this.grid.rows[val.row]
        let editCell = this.grid.columns[val.col]
        let columnDefine = _.find(this.columns, column => column.binding === editCell.binding)
        if (columnDefine && !columnDefine.isReadOnly) {
          if (!columnDefine.isTag) this.tags = []
          _.delay(() => {
            this.$set(this.addDialogConfig, 'show', true)
            this.$nextTick(() => {
              let { gridHeight, gridWidth, columnHeaderHeight, addDialogHeight, addDialogWidth, scrollX, scrollY } = {
                gridHeight: this.grid.clientSize.height,
                gridWidth: this.grid.clientSize.width,
                columnHeaderHeight: this.grid.columnHeaders.height,
                addDialogHeight: this.$refs.addDialog.offsetHeight,
                addDialogWidth: this.$refs.addDialog.offsetWidth,
                scrollX: this.grid.scrollPosition.x,
                scrollY: this.grid.scrollPosition.y
              }
              let rowHeight = editRow.renderHeight
              let cellWidth = editCell.renderWidth
              let rowY = editRow.pos
              let cellX = editCell.pos
              this.$set(this.addDialogConfig, 'top', rowY + scrollY + addDialogHeight - 1 > gridHeight ? rowY + scrollY + columnHeaderHeight - addDialogHeight : rowY + scrollY + rowHeight + columnHeaderHeight)
              this.$set(this.addDialogConfig, 'left', cellX + scrollX + addDialogWidth - 1 > gridWidth ? cellX + scrollX + cellWidth - addDialogWidth : cellX + scrollX)
            })
          }, 100)
          return
        }
      }
      _.delay(() => {
        this.$set(this.addDialogConfig, 'show', false)
      }, 100)
    },
    itemSource (val) {
      // this.editingSelection = null
    }
  },
  methods: {
    initialized (s) {
      this.grid = s
      s.isReadOnly = false
      s.allowAddNew = false
      s.allowDelete = false
      s.newRowAtTop = true
      s.collectionView.trackChanges = true
      s.formatItem.addHandler((s, e) => {
        this.formatItem(s, e)
      })
      // let prevValue
      s.beginningEdit.addHandler((s, e) => {
        // this.editingSelection = e
        // s.rows[e.row].cssClass = editOptions.stateCssClass.editing
        const rowData = s.collectionView.items[e.row]
        const colName = s.columns[e.col].name
        // prevValue = rowData[colName]
        this.$emit('edit:beginning', rowData[colName], colName, s, e.row, e.col)
      })
      s.cellEditEnded.addHandler((s, e) => {
        const rowData = s.collectionView.items[e.row]
        let cacheData = _.find(this.cacheItemSource, item => item[editOptions.pkColumn] === rowData[editOptions.pkColumn])
        if (rowData[editOptions.pkColumn] !== -1 && !editOptions.isRowDataMatched.call(this, cacheData, rowData)) {
          _.findIndex(this.editedRows, rowData) === -1 && this.editedRows.push(rowData)
        } else {
          // s.rows[e.row].cssClass = ''
        }
        // const colName = s.columns[e.col].name
        // this.$emit('edit:cell-ended', rowData[colName], prevValue, colName, s, e.row, e.col)
      })
      s.rowEditEnded.addHandler((s, e) => {
        // this.editingSelection = null
        const rowData = s.collectionView.items[e.row]
        let cacheData = _.find(this.cacheItemSource, item => item[editOptions.pkColumn] === rowData[editOptions.pkColumn])
        this.$emit('edit:row-ended', rowData, cacheData, s, e.row, e.col)
      })
      s.selectionChanged.addHandler((s, e) => {
        this.selectionChanged(s, e)
      })
    },
    selectionChanged (s, e) {
      if (s.columns[e.col].name === '_checked') return
      if (e.row > -1) {
        let rowData = s.collectionView.items[e.row]
        if (editOptions.isRowDataChanged.call(this, this.editedRows, rowData)) {
          // this.editingSelection = s.selection
        } else {
          // this.editingSelection = null
        }
      } else {
        // this.editingSelection = null
      }
    },
    clearSelection () {
      return this.$refs.actionFlexGrid.clearSelection()
    }
  }
}
</script>

<style>
/*@import 'app/assets/styles/variables';
@import 'app/assets/styles/mixins';

.action-flex-grid {
  position: relative;

  .wj-add-dialog {
    padding: 9px 12px;
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
      &.wj-state-editing:not(.wj-state-readonly) {
        background-color: lighten($brand-warning, 20%) !important;
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

      .el-date-editor {
        .el-input__icon {
          width: 22px;
          &+.el-input__inner {
            padding: 3px
          }
        }
      }
    }
  }
}

.wj-listbox-item.wj-state-selected {
  background-color: $brand-primary
}*/

</style>
