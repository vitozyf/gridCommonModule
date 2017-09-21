
import _ from 'underscore'
import {mixin as baseMixin, options as baseOptions} from './base'

const VERSION = '1.0.0'

const PK_COLUMN = '_PKIndex'

const STATE_CSSCLASS = {
  beginedit: 'wj-state-beginEdit',
  editing: 'wj-state-editing',
  saving: 'wj-state-saving',
  error: 'wj-state-error',
  readonly: 'wj-state-readonly'
}

const DIALOG_PARAMS = {
  loading: false,
  show: false,
  title: '标题',
  searchTxt: '',
  searchPlaceholder: '',
  columns: [],
  itemSource: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  selectedRowData: null,
  action: 'cancel',
  onPageChange: _.noop,
  onSearch: _.noop
}

// 添加行
const ADD_NEWROW = function (defaultVal = {}) {
  // if (this.isAddingNewRow()) return
  // defaultVal[PK_COLUMN] = -1
  let items = _.isArray(this.itemSource) ? this.itemSource : this.itemSource.items
  // console.log(items)
  items.push(_.clone(defaultVal))
  // this.gridItemSource.sourceCollection = items

  // this.$nextTick(() => {
  //   let editingCell = _.find(this.grid.columnHeaders.columns, item => {
  //     return item.isVisible && !item.isReadOnly && !item.isTag && item.name !== baseOptions.checkColumnName
  //   })
  //   if (editingCell) {
  //     let startEditing = (s, e) => {
  //       this.grid.startEditing(true, 0, editingCell.index, true)
  //       this.grid.updatedLayout.removeHandler(startEditing)
  //     }
  //     this.grid.updatedLayout.addHandler(startEditing)
  //   }
  // })
}
// 保存行
const SAVE_ROW = function (rowData, rowIndex) {
  let items = this.gridItemSource.items.slice()
  if (!_.has(rowData, PK_COLUMN) || rowData[PK_COLUMN] === -1) rowData[PK_COLUMN] = _.max(items, item => item[PK_COLUMN])[PK_COLUMN] + 1
  let oldData = items.splice(rowIndex, 1, rowData)
  if (!oldData.length) return
  else if (oldData[0][PK_COLUMN] === -1) {
    this.cacheItemSource.push(_.clone(rowData))
  } else {
    let orginalSavingIndex = _.findIndex(this.cacheItemSource, item => item[PK_COLUMN] === oldData[0][PK_COLUMN])
    this.cacheItemSource.splice(orginalSavingIndex, 1, _.clone(rowData))
  }
  REMOVE_FROM_EDITING.call(this, this.editedRows, oldData[0])
  // this.gridItemSource.sourceCollection = items
}
// 移出行
const REMOVE_ROW = function (deleteItem) {
  // let items = _.isArray(this.itemSource) ? this.itemSource : this.itemSource.items
  let items = this.$refs.actionFlexGrid.gridItemSourceData()
  // console.log(this.$refs.actionFlexGrid)
  let deletingIndex = _.findIndex(items, deleteItem)
  // let len = this.getSelectedRows().length
  // for (let i = 0; i < len; i++) {
  // this.editingSelection && this.editingSelection.row === deletingIndex && (this.editingSelection = null)
  items.splice(deletingIndex, 1)
  // this.gridItemSource.sourceCollection = items
  // }
}
// 取消编辑
const CANCEL_EDIT = function (rowData, rowIndex) {
  let items = this.gridItemSource.items.slice()
  if (rowData[PK_COLUMN] === -1) {
    items.splice(rowIndex, 1)
  } else {
    let originalData = _.find(this.cacheItemSource, cache => cache[PK_COLUMN] === rowData[PK_COLUMN])
    originalData && items.splice(rowIndex, 1, _.clone(originalData))
  }
  // this.gridItemSource.sourceCollection = items
}

// 从改变数据行中删除
const REMOVE_FROM_EDITING = function (editedItems, rowData) {
  let removeIndex = _.findIndex(editedItems, item => IS_ROWDATA_MATCHED.call(this, item, rowData))
  removeIndex > -1 && editedItems.splice(removeIndex, 1)
}

// 是否是正在编辑的行
const IS_ROWDATA_CHANGED = function (editItems, rowData) {
  return rowData && rowData[PK_COLUMN] === -1 || _.findIndex(editItems, item => IS_ROWDATA_MATCHED.call(this, item, rowData)) > -1
}

// 列数据是否匹配（显匹配显示列的数据值）
const IS_ROWDATA_MATCHED = function (data, rowData) {
  let columnNames = _.map(this.columns, column => column.name)
  return _.isEqual(
    _.pick(data, (value, key, object) => columnNames ? _.indexOf(columnNames, key) > -1 : true),
    _.pick(rowData, (value, key, object) => columnNames ? _.indexOf(columnNames, key) > -1 : true))
}

const PROPS = {
  showAddRowRightMenu: {
    type: Boolean,
    default: true
  },
  showDeleteRowRightMenu: {
    type: Boolean,
    default: true
  },
  onBeforeAddRow: Function,
  onSaveRow: Function,
  onDeleteRow: Function,
  onDeleteCheckedRow: Function,
  onDeletedRow: Function,
  onDeletedCheckedRow: Function,
  onRefresh: Function,
  onSearch: Function,
  onPageChanged: Function
}

const METHODS = {
  isAddingNewRow () {
    return false
    // return _.findIndex(this.gridItemSource.items, item => item[PK_COLUMN] === -1) > -1
  },
  getSelectedRows () {
    return this.$refs.actionFlexGrid.getSelectedRows()
  },
  addRow () {
    if (this.onBeforeAddRow) {
      var beforeAddRow = this.onBeforeAddRow()
      if (!_.isUndefined(beforeAddRow) && beforeAddRow.then) {
        beforeAddRow.then(d => {
          ADD_NEWROW.call(this, d)
        })
      } else if (_.isObject(beforeAddRow)) {
        ADD_NEWROW.call(this, beforeAddRow)
      }
    } else {
      ADD_NEWROW.call(this, {})
    }
  },
  excelAddRow (defaultvalue) {
    this.log('进入edit。js')
    this.log(defaultvalue)
    if (_.isObject(defaultvalue)) {
      ADD_NEWROW.call(this, defaultvalue)
    } else {
      ADD_NEWROW.call(this, {})
    }
  },
  deleteRow (rowData) {
    this.$confirm('删除确认, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // let deleteRow = this.onDeleteRow && this.onDeleteRow(_.clone(rowData))
      let deleteRow = true
      if (_.isBoolean(deleteRow) && deleteRow) {
        REMOVE_ROW.call(this, rowData)
        this.onDeletedRow && this.onDeletedRow(_.clone(rowData))
      } else if (!_.isUndefined(deleteRow) && deleteRow.then) {
        deleteRow.then(d => {
          if (_.isBoolean(d) && d) {
            REMOVE_ROW.call(this, rowData)
            this.onDeletedRow && this.onDeletedRow(_.clone(rowData))
          }
        })
      }
      this.editingSelection = null
    })
  },
  deleteRows () {
    let rowsData = this.$refs.actionFlexGrid.getSelectedRows()
    if (!_.isUndefined(rowsData[0])) {
      this.$confirm('删除确认, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        _.each(rowsData, rowData => {
          REMOVE_ROW.call(this, rowData)
        })
        this.clearSelection()
        this.editingSelection = null
      })
    } else {
      this.$message.error('请选择要删除的数据行')
    }
  },
  deleteSelectedRow () {
    let rowsData = this.getSelectedRows()
    if (!_.isUndefined(rowsData[0])) {
      this.deleteRow()
    } else {
      this.$message.error('请选择要删除的数据行')
    }
  },
  // saveRow () {
  //   let { flexGrid, view } = {
  //     flexGrid: this.grid,
  //     view: this.grid.collectionView
  //   }
  //   if (view.currentPosition < 0) return
  //   let saveingPosition = flexGrid.selection
  //   let row = flexGrid.rows[saveingPosition.row]
  //   let savingData = view.items[saveingPosition.row] // 保存之前的数据

  //   let savedRow = this.onSaveRow && this.onSaveRow(_.clone(savingData))
  //   if (_.isBoolean(savedRow)) {
  //     if (savedRow) {
  //       SAVE_ROW.call(this, savingData, row.index)
  //     } else {
  //       row.cssClass = STATE_CSSCLASS.error
  //       this.editingSelection = saveingPosition
  //     }
  //   } else if (!_.isUndefined(savedRow) && savedRow.then) {
  //     row.cssClass = STATE_CSSCLASS.saving
  //     row.isReadOnly = true
  //     savedRow.then(d => {
  //       row.isReadOnly = false
  //       row.cssClass = ''
  //       SAVE_ROW.call(this, d, row.index)
  //     }, e => {
  //       row.cssClass = STATE_CSSCLASS.error
  //       this.editingSelection = saveingPosition
  //     })
  //   } else if (!_.isEmpty(savedRow)) {
  //     SAVE_ROW.call(this, savedRow, row.index)
  //   }
  //   this.editingSelection = null
  // },
  // cancelEdit () {
  //   let view = this.grid.collectionView
  //   if (view.currentPosition < 0) return
  //   let cancelingData = view.items[view.currentPosition]
  //   CANCEL_EDIT.call(this, cancelingData, view.currentPosition)
  //   this.editingSelection = null
  // },
  onToggleTag (tag) {
    let value = this.grid.getCellData(this.editingSelection.row, this.editingSelection.col)
    let tags = value && value.split(',')
    if (_.findIndex(tags, t => t === tag) > -1) {
      var newValue = _.reject(tags, t => t === tag)
    } else {
      newValue = _.union(tags, [tag])
    }
    this.currentTags = newValue
    this.grid.setCellData(this.editingSelection.row, this.editingSelection.col, newValue.join(','))
  },

  onExcelPasted () {
    console.log('edit.js/EXCEL')
  }
}

let mixin = {
  props: Object.assign({}, baseMixin.props, PROPS),
  methods: Object.assign({}, baseMixin.methods, METHODS)
}

let options = Object.assign(baseOptions, {
  pkColumn: PK_COLUMN,
  stateCssClass: STATE_CSSCLASS,
  dialogParams: DIALOG_PARAMS,
  addNewRow: ADD_NEWROW,
  saveRow: SAVE_ROW,
  removeRow: REMOVE_ROW,
  removerRromEditing: REMOVE_FROM_EDITING,
  calcelEdit: CANCEL_EDIT,
  isRowDataChanged: IS_ROWDATA_CHANGED,
  isRowDataMatched: IS_ROWDATA_MATCHED
})

export {
  VERSION as version,
  options,
  mixin
}
