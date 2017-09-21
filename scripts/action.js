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
  if (this.rowAddable()) return
  defaultVal[PK_COLUMN] = -1
  let items = this.gridItemSource.items.slice()
  items.unshift(_.clone(defaultVal))
  this.gridItemSource.sourceCollection = items

  this.$nextTick(() => {
    let editingCell = _.find(this.$refs.baseFlexGrid.checkColumns, item => {
      // console.log(item)
      // console.log(item.visible && !item.isReadOnly && !item.isTag && item.name !== baseOptions.checkColumnName)
      return item.visible && !item.isReadOnly && !item.isTag && item.name !== baseOptions.checkColumnName
    })
    // console.log(this.itemSource)
    if (editingCell) {
      // let startEditing = (s, e) => {
      //   this.grid.startEditing(true, 0, editingCell.index, true)
      //   this.grid.updatedLayout.removeHandler(startEditing)
      // }
      // this.grid.updatedLayout.addHandler(startEditing)
      (_.isArray(this.itemSource) ? this.itemSource : this.itemSource.items).unshift(defaultVal)
    }
  })
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
  this.gridItemSource.sourceCollection = items
}

// 移出行
const REMOVE_ROW = function (deleteItem) {
  let items = this.gridItemSource.items.slice()
  let deletingIndex = _.findIndex(this.gridItemSource.items, deleteItem)
  if (deletingIndex > -1) {
    this.editingSelection && this.editingSelection.row === deletingIndex && (this.editingSelection = null)
    items.splice(deletingIndex, 1)
    this.gridItemSource.sourceCollection = items
  }
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
  this.gridItemSource.sourceCollection = items
}

// 从改变数据行中删除
const REMOVE_FROM_EDITING = function (editedItems, rowData) {
  let removeIndex = _.findIndex(editedItems, item => IS_ROWDATA_MATCHED.call(this, item, rowData))
  removeIndex > -1 && editedItems.splice(removeIndex, 1)
}

// 是否是正在编辑的行
const IS_ROWDATA_CHANGED = function (editItems, rowData) {
  return rowData && (rowData[PK_COLUMN] === -1 || _.findIndex(editItems, item => IS_ROWDATA_MATCHED.call(this, item, rowData)) > -1)
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
  showSaveRowRightMenuDisabled: {
    type: Boolean,
    default: true
  },
  showSaveRowRightMenu: {
    type: Boolean,
    default: true
  },
  showDeleteRowRightMenu: {
    type: Boolean,
    default: true
  },
  onBeforeAddRow: Function,
  onSaveRow: Function,
  onSaveRows: Function,
  onDeleteRow: Function,
  onDeleteRows: Function,
  onRefresh: Function,
  onSearch: Function,
  onPageChanged: Function
}

const METHODS = {
  rowAddable (grid, ht) {
    return _.findIndex(this.gridItemSource.items, item => item[PK_COLUMN] === -1) > -1
  },
  rowSaveable (grid, ht) {
    return !_.some(this.gridItemSource.items, item => {
      let cacheItem = _.find(this.cacheItemSource, cache => cache[PK_COLUMN] === item[PK_COLUMN])
      return !IS_ROWDATA_MATCHED.call(this, item, cacheItem)
    })
  },
  rowDeleteable (grid, ht) {
    return grid.rows[ht.row].cssClass === STATE_CSSCLASS.saving || grid.itemsSource.currentPosition < 0
  },
  getSelectedRows () {
    return this.$refs.baseFlexGrid.getSelectedRows()
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
  deleteRow (rowData) {
    let rowDataItem = rowData

    this.$confirm('删除确认, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      let cols = this.$refs.baseFlexGrid.checkColumns
      _.each(cols, (col) => {
        if (col.dataMap && col.dataMap.length > 0) {
          // _.each(rowDataItem, item => {
          _.each(col.dataMap, data => {
            if ((data.value) === rowDataItem[col.name] || (_.isFinite(data.value) ? Number(data.value) : data.value) === Number(rowDataItem[col.name])) {
              rowDataItem[col.name] = data.key
            }
          })
          // })
        }
      })
      let deleteRow = this.onDeleteRow && this.onDeleteRow(_.clone(rowDataItem))
      if (_.isBoolean(deleteRow) && deleteRow) {
        // REMOVE_ROW.call(this, rowData)
        this.onRefresh()
      } else if (!_.isUndefined(deleteRow) && deleteRow.then) {
        deleteRow.then(d => {
          if (_.isBoolean(d) && d) {
            // REMOVE_ROW.call(this, rowData)
            this.onRefresh()
          }
        })
      }
      this.editingSelection = null
    })
  },
  deleteRows () {
    let rowsData = this.getSelectedRows()
    if (rowsData.length) {
      this.$confirm('删除确认, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let cols = this.$refs.baseFlexGrid.checkColumns
        _.each(cols, (col) => {
          if (col.dataMap && col.dataMap.length > 0) {
            _.each(rowsData, item => {
              _.each(col.dataMap, data => {
                if ((_.isFinite(data.value) ? Number(data.value) : data.value) === item[col.name] || (_.isFinite(data.value) ? Number(data.value) : data.value) === Number(item[col.name])) {
                  item[col.name] = data.key
                }
              })
            })
          }
        })
        let deleteRows = this.onDeleteRows && this.onDeleteRows(_.map(rowsData, rowData => _.clone(rowData)))
        if (_.isBoolean(deleteRows) && deleteRows) {
          // _.each(rowsData, rowData => {
          //   REMOVE_ROW.call(this, rowData)
          // })
          this.onRefresh()
        } else if (!_.isUndefined(deleteRows) && deleteRows.then) {
          deleteRows.then(d => {
            if (_.isBoolean(d) && d) {
              // _.each(rowsData, rowData => {
              //   REMOVE_ROW.call(this, rowData)
              // })
              this.onRefresh()
            }
          })
        }
        this.clearSelection()
        this.editingSelection = null
      })
    } else {
      this.$message.error('请选择要删除的数据行')
    }
  },
  saveRow () {
    let { flexGrid, view } = {
      flexGrid: this.grid,
      view: this.grid.collectionView
    }
    if (view.currentPosition < 0) return
    let saveingPosition = flexGrid.selection
    let row = flexGrid.rows[saveingPosition.row]
    let savingData = view.items[saveingPosition.row] // 保存之前的数据

    let savedRow = this.onSaveRow && this.onSaveRow(_.clone(savingData))
    if (_.isBoolean(savedRow)) {
      if (savedRow) {
        SAVE_ROW.call(this, savingData, row.index)
      } else {
        row.cssClass = STATE_CSSCLASS.error
        this.editingSelection = saveingPosition
      }
    } else if (!_.isUndefined(savedRow) && savedRow.then) {
      row.cssClass = STATE_CSSCLASS.saving
      row.isReadOnly = true
      savedRow.then(d => {
        row.isReadOnly = false
        row.cssClass = ''
        SAVE_ROW.call(this, d, row.index)
      }, e => {
        row.cssClass = STATE_CSSCLASS.error
        this.editingSelection = saveingPosition
      })
    } else if (!_.isEmpty(savedRow)) {
      SAVE_ROW.call(this, savedRow, row.index)
    }
    this.editingSelection = null
  },
  saveRows () {
    let items = this.$refs.baseFlexGrid.gridItemSourceData()
    let oldValueDivs = this.$el.querySelectorAll('.cell[oldvalue]')
    if (oldValueDivs.length > 0) {
      _.each(oldValueDivs, item => {
        item.removeAttribute('oldvalue')
      })
    }
    // 保存时数据处理：有编辑时才会传到服务器
    let requestData = []
    _.each(items, item => {
      // BDLineGUID
      let flag = this.$refs.baseFlexGrid.CurrentItem && this.$refs.baseFlexGrid.CurrentItem.BDLineGUID && this.$refs.baseFlexGrid.CurrentItem.BDLineGUID === item.BDLineGUID
      if (item.isEdit || flag || (this.$refs.baseFlexGrid.CurrentItem && this.$refs.baseFlexGrid.CurrentItem.StkGUID && this.$refs.baseFlexGrid.CurrentItem.StkGUID === item.StkGUID)) { // 解决采纳改变数据时无法保存的问题
        requestData.push(_.extend({}, item))
      }
    })
    // console.log('保存数据时转换后数据', requestData)
    if (requestData.length > 0) {
      this.transformSubmitValue(requestData)
      let savedRows = this.onSaveRows && this.onSaveRows(requestData)
      this.$refs.baseFlexGrid.CurrentItem = '' // 保存后清空选择项
      this.clearSelection()
      if (_.isBoolean(savedRows) && savedRows) {
        this.onRefresh()
      } else if (!_.isUndefined(savedRows) && savedRows.then) {
        savedRows.then(d => {
          if (_.isBoolean(d) && d) {
              // _.each(rowsData, rowData => {
              //   REMOVE_ROW.call(this, rowData)
              // })
            this.onRefresh()
          }
        }, e => {
        // row.cssClass = STATE_CSSCLASS.error
        })
      }
      this.editingSelection = null
      let inps = this.$el.querySelectorAll('.dblClickInputStyle')
      _.each(inps, (item) => {
        item.classList.remove('dblClickInputBlur')
        item.setAttribute('editFlag', 'false')
      })
        // 保存时销毁所有的editflag 底色恢复
      let cells = this.$el.querySelectorAll('.el-table .el-table__body-wrapper .cell')
      _.each(cells, (item) => {
        item.removeAttribute('editflag')
        item.style.backgroundColor = 'transparent'
      })
    } else {
      return this.$message({message: '表格未做任何修改', type: 'error'})
    }
  },
  transformSubmitValue (requestData) { // name => key 数据转换
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
  cancelEdit () {
    // let editFlagDiv = this.$el.querySelectorAll('div[editflag="true"]')
    let editFlagDiv = this.$el.querySelectorAll('div[oldValue]')
    // console.log(editFlagDiv)
    _.each(editFlagDiv, item => {
      // 取出旧值
      item.querySelector('div').innerText = item.getAttribute('oldValue')
      item.setAttribute('editflag', 'false')
      item.style.backgroundColor = 'transparent'

       // 替换itemsource
      let rowIndex = item.getAttribute('rowIndex')
      let columnName = item.getAttribute('columnName')
      // console.log('数据转换', this.transformSubmitValue(item.getAttribute('oldValue')))
      this.gridItemSourceData()[rowIndex][columnName] = this.transformSubmitValue([item.getAttribute('oldValue')][0])

      item.removeAttribute('oldValue')
    })
    // console.log(editFlagDiv)
  },
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
