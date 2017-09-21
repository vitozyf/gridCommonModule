<template>
  <el-dialog title="自定义表格配置"
             v-model="p_open"
             :close-on-click-modal="false"
             :close-on-press-escape="false">
    <el-table :data="columnsConfig"
              :max-height="369"
              class="customGrid"
              :row-style="(row,index)=>index===sortIndex?{backgroundColor:'#ede9dd'}:{}">
      <el-table-column type="expand"
                       v-if="hasEditRole('authUsers','tags','cellColor')">
        <template scope="scope">
          <el-tabs :value="hasEditRole('tags','cellColor')&&scope.row.isTag?'tags':'cellColor'"
                   @tab-click="tabChanged">
            <el-tab-pane label="标签配置"
                         name="tags"
                         v-if="scope.row.isTag&&hasEditRole('tags')">
              <el-row :gutter="10"
                      v-for="(tag,index) in scope.row.tags"
                      :key="index">
                <el-col :span="12">
                  <el-input v-model="tag.name" />
                </el-col>
                <el-col :span="8">
                  <el-color-picker v-model="tag.color"></el-color-picker>
                </el-col>
                <el-col :span="4">
                  <a href="#"
                     v-if="scope.row.tags.length-1===index"
                     @click="addTagCondition(scope.row.binding)">添加</a>
                  <a href="#"
                     v-if="scope.row.tags.length>1"
                     @click="removeTagCondition(scope.row.binding,index)">删除</a>
                  <a href="#"
                     v-else
                     @click="clearTagCondition(scope.row.binding,index)">清除</a>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="单元格颜色"
                         name="cellColor"
                         v-if="!scope.row.isTag&&hasEditRole('cellColor')">
              <div style="width:99%">
              <el-row :gutter="10"
                      v-for="(cellColor,index) in scope.row.cellColors"
                      :key="index">
                <el-col :span="6">
                  <el-select v-model="cellColor.operator"
                             @change="val=>{cellColor.params=val&&scope.row.dataType!==4&&operators[val].paramsNum>1?new Array(operators[cellColor.operator].paramsNum):''}">
                    <el-option label="请选择"
                               value="" />
                    <el-option v-for="(operator,key) in operators"
                               :key="key"
                               :label="operator.name"
                               :value="key"
                               :disabled="operator.typeSupport.indexOf(scope.row.dataType)<0" />
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-date-picker v-if="scope.row.dataType===4"
                                  placeholder="选择日期"
                                  format="yyyy/MM/dd"
                                  :type="cellColor.operator&&operators[cellColor.operator].paramsNum >1?'daterange':'date'"
                                  v-model="cellColor.params" />
                  <el-input v-else-if="cellColor.operator&&operators[cellColor.operator].paramsNum>1"
                            v-for="(num,index) in operators[cellColor.operator].paramsNum"
                            :key="index"
                            :value="cellColor.params&&cellColor.params.length>=num?cellColor.params[num-1]:''"
                            @change="val=>{cellColor.params[num-1]=val}" />
                  <el-input v-else
                            :value="cellColor.params"
                            @change="val=>{cellColor.params=val}" />
                </el-col>
                <el-col :span="6">
                  <el-color-picker v-model="cellColor.color"></el-color-picker>
                </el-col>
                <el-col :span="4">
                  <a href="#"
                     v-if="scope.row.cellColors.length-1===index"
                     @click="addCellColorCondition(scope.row.binding)">添加</a>
                  <a href="#"
                     v-if="scope.row.cellColors.length>1"
                     @click="removeCellColorCondition(scope.row.binding,index)">删除</a>
                  <a href="#"
                     v-else
                     @click="clearCellColorCondition(scope.row.binding,index)">清除</a>
                </el-col>
              </el-row>
              </div>
            </el-tab-pane>
            <el-tab-pane label="权限"
                         name="authUsers"
                         v-if="hasEditRole('authUsers')">
              <div class="auth-column"
                   v-show="users.length">
                <el-checkbox v-model="scope.row.checkedAll"
                             @change="checkAllUser(scope.row.name,$event)">全选</el-checkbox>
                <!-- <span>123123</span> -->
                <el-checkbox-group v-model="scope.row.authUsers"
                                   @change="(val)=>{checkUser(scope.row.name,val)}">
                  <el-checkbox v-for="(user,index) in users"
                               :label="user.id"
                               :key="user.id">{{user.name}}</el-checkbox>
                </el-checkbox-group>
              </div>
              <span v-if="isLoadingUsers">正在加载...</span>
            </el-tab-pane>
          </el-tabs>

        </template>
      </el-table-column>
      <el-table-column label="列名">
        <template scope="scope">
          <el-input size="mini"
                    v-model="scope.row.header"
                    v-if="hasEditRole('header')"></el-input>
          <span class="unEditable columnEneditStyle"
                v-else>{{scope.row.header}}</span>
        </template>
      </el-table-column>
      <el-table-column label="宽度">
        <template scope="scope">
          <el-input size="mini"
                    type="number"
                    v-model="scope.row.width"
                    v-if="hasEditRole('width')"></el-input>
          <span class="unEditable"
                v-else>{{scope.row.width}}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否显示"
                       align="center">
        <template scope="scope">
          <el-switch v-model="scope.row.visible"
                     on-text=""
                     off-text=""
                     :width="38"
                     :disabled="!hasEditRole('visible')"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="是否只读"
                       align="center"
                       v-if="hasEditRole('isReadOnly')">
        <template scope="scope">
          <el-switch v-model="scope.row.isReadOnly"
                     on-text=""
                     off-text=""
                     :width="38"></el-switch>
        </template>
      </el-table-column>
      <el-table-column class-name="sort-column"
                       align="center"
                       v-if="hasEditRole('sort')">
        <template scope="scope">
          <a href="#"
             :class="{invisible:scope.$index===0}"
             @click.stop.prevent="sortUp(scope.$index)">
            <icon name="arrow-up"></icon>
          </a>
          <a href="#"
             :class="{invisible:scope.$index===columns.length-1}"
             @click.stop.prevent="sortDown(scope.$index)">
            <icon name="arrow-down"></icon>
          </a>
        </template>
      </el-table-column>
    </el-table>

    <template slot="footer">

      <div class="pull-left">
        <span> 每页：</span>
        <el-input-number class="page-size"
                         size="small"
                         v-model="p_pageSize"
                         :min="1"
                         :step="5"></el-input-number>
      </div>
      <el-button type="text"
                 class='btn-reset'
                 size="small"
                 :loading="loading&&submitTarget==='reset'"
                 @click="reset">重置所有设置</el-button>
      <el-button type=""
                 :disabled="loading"
                 @click="cancel">取消</el-button>
      <el-button type="primary"
                 :loading="loadingFlag"
                 @click="confirm">{{loadingText}}</el-button>
    </template>
  </el-dialog>
</template>
<script>
import _ from 'underscore'
import { mixin as propSyncMixin } from './assets/scripts/mixins/propSync'
// import Icon from 'vue-awesome/components/Icon'
import { Dialog, Tabs, TabPane, Table, TableColumn, CheckboxGroup, Checkbox, Switch, Button, Input, InputNumber, Select, Option, ColorPicker, DatePicker, Tooltip, Row, Col } from 'element-ui'
import { mixin as actionMixin } from './scripts/action'

const CONFIG = {
  getCompanyUsersURL: 'CompanyAccount/GetAllUser'
}

const CELLCOLOR_CONDITION_DEFAULT = {
  operator: '',
  color: '#FF0000',
  params: '',
  expression: ''
}

const TAG_CONDITION_DEFAULT = {
  name: '',
  color: '#000000'
}

const COLUMN_TYPES = {
  0: Object,
  1: String,
  2: Number,
  3: Boolean,
  4: Date,
  5: Array
}

const OPERATORS = {
  greaterThan: {
    name: '大于',
    paramsNum: 1,
    typeSupport: [2, 4],
    action (field, value = '', type = Number) {
      switch (type) {
        case Number:
          if (_.isNaN(Number.parseFloat(value))) break
          return '{' + field + '}>' + value
        case Date:
          if (_.isNaN(Date.parse(value))) break
          return 'new Date("{' + field + '}")>new Date("' + value + '")'
        default:
          return '0===1'
      }
    }

  },
  lessThan: {
    name: '小于',
    paramsNum: 1,
    typeSupport: [2, 4],
    action (field, value = '', type = Number) {
      switch (type) {
        case Number:
          if (_.isNaN(Number.parseFloat(value))) break
          else return '{' + field + '}<' + value
        case Date:
          if (_.isNaN(Date.parse(value))) break
          else return 'new Date("{' + field + '}")<new Date("' + value + '")'
        default:
          return '0===1'
      }
    }
  },
  equal: {
    name: '等于',
    paramsNum: 1,
    typeSupport: [1, 2, 3, 4],
    action (field, value = '', type = String) {
      switch (type) {
        case String:
          return '"{' + field + '}"==="' + (value || '') + '"'
        case Number:
        case Boolean:
          // if (!_.isBoolean(value) || _.isNaN(Number.parseFloat(value))) break
          if (!_.isBoolean(value) || !_.isFinite(value)) break
          else return '{' + field + '}===' + value
        case Date:
          if (_.isNaN(Date.parse(value))) break
          else return 'new Date("' + value + '")===new Date("{' + field + '}")'
        default:
          return '0===1'
      }
    }
  },
  unEqual: {
    name: '不等于',
    paramsNum: 1,
    typeSupport: [1, 2, 3, 4],
    action (field, value = '', type = String) {
      switch (type) {
        case String:
          return '"{' + field + '}"!=="' + value + '"'
        case Number:
        case Boolean:
          if (!_.isBoolean(value) || _.isNaN(Number.parseFloat(value))) break
          else return '{+' + field + '}!==+' + value
        case Date:
          if (_.isNaN(Date.parse(value))) break
          return 'new Date("' + value + '")!==new Date("{' + field + '}")'
        default:
          return '0!==0'
      }
    }
  },
  between: {
    name: '区间',
    paramsNum: 2,
    typeSupport: [2, 4],
    action (field, values, type = Number) {
      if (!_.isArray(values) || values.length < 2 || _.some(values, value => _.isUndefined(value))) {
        return '0===1'
      } else {
        switch (type) {
          case Number:
            if (_.isNaN(Number.parseFloat(values[0])) || _.isNaN(Number.parseFloat(values[1]))) break
            else return '{' + field + '}>=' + values[0] + '&&{' + field + '}<=' + values[1]
          case Date:
            if (_.isNaN(Date.parse(values[0])) || _.isNaN(Date.parse(values[1]))) break
            return 'new Date("{' + field + '}")>=new Date("' + values[0] + '")&&new Date("{' + field + '}")<=new Date("' + values[1] + '")'
          default:
            return '0===1'
        }
      }
    }
  },
  contains: {
    name: '包含',
    paramsNum: 1,
    typeSupport: [1],
    action (field, value = '', type = String) {
      return '"{' + field + '}".indexOf("' + value + '")>-1'
    }
  }
}

const EDIT_ROLE_CONFIG = {
  '1': ['width', 'sort'],
  '2': ['header', 'width', 'visible', 'sort', 'tags', 'cellColor', 'authUsers'],
  '3': []
}

export default {
  name: 'ZnlGridConfiguration',
  mixins: [propSyncMixin, actionMixin],
  components: {
    // Icon,
    elDialog: Dialog,
    elTabs: Tabs,
    elTabPane: TabPane,
    elTable: Table,
    elTableColumn: TableColumn,
    elCheckboxGroup: CheckboxGroup,
    elCheckbox: Checkbox,
    elSwitch: Switch,
    elButton: Button,
    elInput: Input,
    elInputNumber: InputNumber,
    elSelect: Select,
    elOption: Option,
    elColorPicker: ColorPicker,
    elDatePicker: DatePicker,
    elTooltip: Tooltip,
    elRow: Row,
    elCol: Col
  },
  props: {
    loading: Boolean,
    open: {
      type: Boolean,
      default: false,
      propsync: true
    },
    columns: {
      type: Array,
      default () {
        return []
      }
    },
    pageSize: {
      type: Number,
      default: 10,
      propsync: true
    },
    role: {
      type: [Number, String],
      default: 1,
      validator (value) {
        return _.contains(['1', '2', '3'], value + '')
      }
    }
  },
  data () {
    return {
      operators: OPERATORS,
      isLoadingUsers: false,
      columnsConfig: [],
      users: [],
      sortIndex: -1,
      submitTarget: '',
      loadingFlag: false,
      loadingText: '确定'
    }
  },
  watch: {
    columns (val) {
      this.columnsConfig = val.filter(t => !t.isSystem).map((column, index) => {
        return _.extend({}, column, {
          authUsers: column.authUsers || [],
          cellColors: (column.extraConfig && column.extraConfig.cellColors && column.extraConfig.cellColors.length ? column.extraConfig.cellColors : [_.clone(CELLCOLOR_CONDITION_DEFAULT)]).slice(),
          tags: (column.extraConfig && column.extraConfig.tags && column.extraConfig.tags.length ? column.extraConfig.tags : [_.clone(TAG_CONDITION_DEFAULT)]).slice(),
          checkedAll: false
        })
      })
    },
    user (val) {
      _.each(this.columnsConfig, column => {
        column.checkedAll = !!column.authUsers && column.authUsers.length === val.length
      })
    }
  },
  methods: {
    getCompanyUsers () {
      return this.$post(CONFIG.getCompanyUsersURL, (data) => {
        this.users = _.map(data.Users, user => {
          return {
            id: user.UserGUID,
            name: user.UserName
          }
        })
      })
    },
    hasEditRole (...fields) {
      return !!EDIT_ROLE_CONFIG[this.role + ''] && !!_.filter(EDIT_ROLE_CONFIG[this.role + ''], r => _.contains(fields, r)).length
    },
    sortUp (index) {
      const prev = this.columnsConfig[index - 1]
      const currect = this.columnsConfig.splice(index, 1)[0]
      const currectSort = currect.sort
      currect.sort = prev.sort
      prev.sort = currectSort
      this.columnsConfig.splice(index - 1, 0, currect)
      this.sortIndex = index - 1
    },
    sortDown (index) {
      const next = this.columnsConfig[index + 1]
      const currect = this.columnsConfig.splice(index, 1)[0]
      const currectSort = currect.sort
      currect.sort = next.sort
      next.sort = currectSort
      this.columnsConfig.splice(index + 1, 0, currect)
      this.sortIndex = index + 1
    },
    checkAllUser (name, e) {
      const column = _.find(this.columnsConfig, column => column.name === name)
      column.authUsers = e.target.checked ? this.users.map(user => user.id) : []
    },
    checkUser (name, value) {
      const column = _.find(this.columnsConfig, column => column.name === name)
      column.checkedAll = column.authUsers.length === this.users.length
    },
    addCellColorCondition (field) {
      let column = _.find(this.columnsConfig, column => column.binding === field)
      column.cellColors.push(_.extend({}, CELLCOLOR_CONDITION_DEFAULT))
    },
    removeCellColorCondition (field, index) {
      let column = _.find(this.columnsConfig, column => column.binding === field)
      column.cellColors.splice(index, 1)
    },
    clearCellColorCondition (field, index) {
      let column = _.find(this.columnsConfig, column => column.binding === field)
      _.extend(column.cellColors[index], CELLCOLOR_CONDITION_DEFAULT)
    },
    addTagCondition (field) {
      let column = _.find(this.columnsConfig, column => column.binding === field)
      column.tags.push(_.extend({}, TAG_CONDITION_DEFAULT))
    },
    removeTagCondition (field, index) {
      let column = _.find(this.columnsConfig, column => column.binding === field)
      column.tags.splice(index, 1)
    },
    clearTagCondition (field, index) {
      let column = _.find(this.columnsConfig, column => column.binding === field)
      _.extend(column.tags[index], TAG_CONDITION_DEFAULT)
    },
    tabChanged (tab) {
      if (tab.name === 'authUsers') {
        if (!this.users.length) {
          this.isLoadingUsers = true
          this.getCompanyUsers().then(() => {
            this.isLoadingUsers = false
          }).catch(() => {
            this.isLoadingUsers = false
          })
        }
      }
    },
    confirm () {
      let configRefs = _.union(this.$parent.$children, this.$parent.$children[3] ? this.$parent.$children[3].$children : [])
      let config
      _.each(configRefs, item => {
        if (item.$el && item.$el.className === 'base-flex-grid') {
          config = item
        }
      })
      config.cancelAllChecked()
      // console.log(config)
      config.tableData = []
      this.loadingFlag = true
      this.loadingText = ''
      this.submitTarget = 'confirm'
      let columns = _.map(this.columnsConfig, column => {
        if (column.isTag) {
          column.extraConfig = JSON.stringify({ 'tags': _.filter(column.tags, tag => tag.name) })
        } else {
          column.extraConfig = JSON.stringify({
            'cellColors': _.map(_.filter(column.cellColors, cell => cell.operator), cell => {
              // let params = []
              // if (_.isString(cell.params)) {
              //   params = this.transformSubmitValue([cell.params])
              // }
              return _.extend({}, cell, {
                expression: cell.operator && this.operators[cell.operator].action(column.binding, cell.params, COLUMN_TYPES[column.dataType])
              })
            })
          })
        }
        let presentCol = this.$parent.$el.querySelectorAll('.el-table .el-table__body-wrapper tbody tr td')
        _.each(presentCol, item => {
          if (item.getAttribute('getcolor') === 'true') {
            item.removeAttribute('getcolor')
          }
        })
        return _.clone(column)
      })
      this.$emit('confirm', columns, this.p_pageSize)
      _.delay(() => {
        this.loadingFlag = false
        this.loadingText = '确定'
      }, 3000)
    },
    reset () {
      this.submitTarget = 'reset'
      this.$emit('reset')
    },
    cancel () {
      this.p_open = false
    }
  }
}
</script>

<style>
 /*@import 'app/assets/styles/_variables.scss';

a {
  color: $gray-light;

  &:hover {
    color: $gray;
  }
}

.el-table {
  .el-table__header-wrapper .cell{
   padding: 0 5px;
  }
  .el-table__body-wrapper .el-input__inner{
   padding: 0 5px;
   width:95%;
 }
 .el-tab-pane{
   overflow: hidden!important;
 }
  tr {
    td{
    }
    td ul {
      &>li {
        margin: 3px 5px;
        display: inline-block;
      }
    }

    span.unEditable {
      color: lighten($black, 60%);
      cursor: not-allowed;
    }

    .el-row {
      margin-top: 10px;
    }

    .sort-column a {
      margin-left: 5px;
      color: lighten($black, 70%);
      background-color: transparent;

      &:hover {
        color: $brand-primary;
        outline: none;
      }
    }

    .auth-column {
      padding: 2px;
      h3 {
        margin: 3px;
        display: inline-block;
      }
      .el-checkbox {
        margin-right: 15px;
        min-width: 120px;
        &+.el-checkbox {
          margin-left: 0;
        }
        bottom:0px !important;
        margin:0px -8px 5px 0px;
      }
    }
  }

}



.page-size {
  vertical-align: bottom;
}

.btn-reset {
  color: $gray;
  text-decoration: underline;
}

.el-dialog__wrapper{
  .el-dialog{
    .el-dialog__body{
      .customGrid{
        tbody tr{
          height:40px;
          .cell {
            span.columnEneditStyle{
              padding: 0 5px;
            }
          }
          .el-tabs__content{
            .el-tab-pane{
              padding: 0 5px;
            }
          }
        }
      }

    }
  }
  .el-dialog__footer{
    .pull-left{
        display: flex;
        align-items: center;
        .el-input{
          .el-input__inner{
            padding: 0 5px;
          }
        }
    }
    .el-button--primary{
      width: 60px;
    }

  }

}*/

</style>
