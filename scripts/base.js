import Vue from 'vue'
// import wijmo from 'wijmo'
import { DatePicker, Select, Option } from 'element-ui'
import _ from 'underscore'

const VERSION = '1.0.0'

const CHECK_COLUMN_NAME = '_Checked'

const CHECK_COLUMN_DEFINED = {
  'name': CHECK_COLUMN_NAME,
  'binding': CHECK_COLUMN_NAME,
  'width': 35,
  'header': '选择',
  'visible': true,
  'dataType': 3,
  'allowSorting': false,
  'isRequired': false,
  'isReadOnly': false,
  'isTag': false,
  'extraConfig': {}
}

const EL_DATEPICKER = Vue.extend({
  template: '<el-date-picker v-model="date" :size="size" :type="type" :placeholder="placeholder" @change="val=>{$emit(\'change\',val)}"></el-date-picker>',
  components: {
    elDatePicker: DatePicker
  },
  props: {
    type: {
      type: String,
      default: 'date'
    },
    size: {
      type: String,
      default: 'mini'
    },
    placeholder: String
  },
  data () {
    return {
      date: ''
    }
  }
})

const EL_SELECT = Vue.extend({
  template: '<el-select v-model="value" :size="size" filterable :placeholder="placeholder" @change="val=>{$emit(\'change\',val)}">' +
    '<el-option v-for="item in options" :key="item.key" :label="item.value" :value="item.key"></el-option>' +
  '</el-select>',
  components: {
    elSelect: Select,
    elOption: Option
  },
  props: {
    options: {
      type: Array,
      default () {
        return []
      }
    },
    size: {
      type: String,
      default: 'mini'
    },
    placeholder: String
  },
  data () {
    return {
      value: ''
    }
  }
})
// 配置条件过滤
// const EXPRESSION_CALC = function (expression, data, defaultVal = false) {
//   if (_.isUndefined(expression)) {
//     var matched = defaultVal
//   } else if (_.isBoolean(expression)) {
//     matched = expression
//   } else if (_.isString(expression)) {
//     let pattern = expression
//     let fields = _.uniq(pattern.match(/{\w+}/g))

//     for (let i = 0; i < fields.length; i++) {
//       let fieldName = fields[i].replace('{', '').replace('}', '')
//       let regex = window.eval('/' + fields[i] + '/g')
//       pattern = _.has(data, fieldName) && pattern.replace(regex, data[fieldName])
//     }
//     try {
//       matched = window.eval(pattern)
//     } catch (e) {
//       matched = defaultVal
//     }
//   } else if (_.isFunction(expression)) {
//     matched = expression(data)
//   }
//   return !!matched
// }

// const INSERT_EMPTY_ROW = function () {
//   const hasRows = _.filter(this.grid.rows, row => row.cssClass !== 'wj-noitems').length
//   const hasEmptyRow = _.filter(this.grid.rows, row => row.cssClass === 'wj-noitems').length
//   if (!hasRows && !hasEmptyRow) {
//     // 判断有无渲染数据
//     let emptyData = {}
//     for (let i = 0, len = this.grid.columns.length; i < len; i++) {
//       this.grid.columns[i].allowMerging = true
//       this.grid.columns[i].dataType = 1
//       emptyData[this.grid.columns[i].name] = ' '
//     }
//     let newRow = new wijmo.grid.Row(emptyData)
//     newRow.allowMerging = true
//     newRow.isReadOnly = true
//     newRow.cssClass = 'wj-noitems'
//     this.grid.rows.push(newRow)
//   } else if (hasRows) {
//     _.each(this.grid.columns, column => {
//       column.allowMerging = false
//       let columnDefined = _.find(this.checkColumns, config => config.name === column.name)
//       columnDefined && (column.dataType = columnDefined.dataType)
//     })
//   }
// }

const PROPS = {
  columns: {
    type: Array,
    default () {
      return []
    },
    required: true
  },
  height: {
    type: Number,
    validator (val) {
      return val >= 0
    }
  },
  maxHeight: {
    type: Number,
    validator (val) {
      return val >= 0
    }
  },
  minHeight: {
    type: Number,
    validator (val) {
      return val >= 0
    }
  },
  frozenColumns: {
    type: Number,
    default: 0
  },
  itemSource: {
    type: [Array, Object],
    default () {
      return []
    }
  },
  isMultiRowsCheck: {
    type: Boolean,
    default: false
  },
  isFieldsSearch: {
    type: Boolean,
    default: false
  },
  searchFields: {
    type: Object,
    default () {
      return {}
    }
  },
  columnColors: {
    type: Array,
    default () {
      return []
    }
  },
  rowColors: {
    type: Array,
    default () {
      return []
    }
  },
  pageSize: {
    type: Number,
    default: 20,
    validator (val) {
      return val > 0
    }
  },
  pageIndex: {
    type: Number,
    default: 1,
    validator (val) {
      return val > 0
    }
  },
  totalCount: {
    type: Number,
    default: 0,
    validator (val) {
      return val >= 0
    }
  },
  rightMenus: {
    type: Array,
    default: () => {
      return []
    }
  },
  onRefresh: Function,
  onSearch: Function,
  onPageChanged: Function
}

const METHODS = {
  getSelectedRows () {
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
  },
  getSelectedRow () {
    return [this.CurrentItem] || this.getSelectedRows()
  }
}

const mixin = {
  props: PROPS,
  methods: METHODS
}

const options = {
  ElDatePicker: EL_DATEPICKER,
  ElSelect: EL_SELECT,
  checkColumnName: CHECK_COLUMN_NAME,
  checkColumnDefined: CHECK_COLUMN_DEFINED
  // expressionCalc: EXPRESSION_CALC,
  // insertEmptyRow: INSERT_EMPTY_ROW
}

export {
  VERSION as version,
  options,
  mixin
}
