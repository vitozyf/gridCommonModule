import {getCookie, setCookie, addClass, setStyle} from '../utils/dom'
const debug = process.env.NODE_ENV !== 'production'
  // http://api.znlbd.com/
  // http://test.znlbd.com:8080/
const apiDomain = process.env.NODE_ENV !== 'production' ? 'http://192.168.1.10:9610/' : 'http://test.znlbd.com:8080/'
const authURL = 'Security/ValidateTokenID'
const cookieName = 'ZNLUSERGUID'

export default {
  methods: {
    log (...args) {
      debug && !_.isUndefined(console) && console.log.apply(console, args)
    },
    openTab (name, query) {
      this.$router.push({name: name, query: query})
    },
    async userLogin () {
      let cookie = getCookie(this.cookieName)
      if (!cookie) {
        cookie = await this.getClientSessionid().then(
          data => {
            return data.SessionID
          })
      }
      let authed = false
      let authFromServer
      if (cookie) {
        authFromServer = await this.$post(authURL)
        if (!_.isUndefined(authFromServer)) {
          authed = true
          this.$store.commit('setAccountInfo', authFromServer)
        }
      }
      if (authed) {
        await this.getPageRoles()
        return Promise.resolve(authFromServer)
      } else {
        return Promise.reject()
      }
    },
    // 获取sessionId
    async getClientSessionid () {
      if (debug) return true

      const session = await this.csRequest('get-session', {Model: 'a'})
      var jsonData = JSON.parse(session)
      if (jsonData.SessionID) {
        setCookie(cookieName, 'Token' + jsonData.SessionID, 2)
        return jsonData
      } else {
        throw new Error(jsonData)
      }
    },
       // 获取控件权限列表
    async  getElementRoles (pageName) {
      if (debug) return []

      var elementRoles = await this.csRequest('get-ownerroleitems')
      let jsonData = JSON.parse(elementRoles)
      this.$store.commit('setAccountInfo', {
        moduleRoles: jsonData
      })
      return jsonData
    },
    // 获取模块权限列表
    async  getModuleRoles () {
      if (debug) {
        const moduleRoles = []
        this.$store.commit('setAccountInfo', {
          moduleRoles: moduleRoles
        })
        return moduleRoles
      } else {
        const moduleRoles = await this.csRequest('get-ownerroleitems', '')
        let jsonData = JSON.parse(moduleRoles)
        this.$store.commit('setAccountInfo', {
          moduleRoles: jsonData
        })
        return jsonData
      }
    },
    // 获取页面限项
    async  getPageRoles () {
      // if (CONFIG.debug) {
      this.$store.commit('setAccountInfo', {
        pageAuthorUrl: 'UserResource/GetPageModuls'
      })
      return this.$post('UserResource/GetUserPage', {}, (data) => {
        // console.log(data)
        let roles = data.map(item => item.Name)
        this.$store.commit('setAccountInfo', {
          pageRoles: roles
        })
        // console.log(roles)
      })
      // const roles = ['首页', '工作台', '现货销售', '库存管理', '销售管理', '采购管理', 'CRM', '财务', '数据统计', '库存推广', '表格配置', '系统设置', '货销售', '发货单', '入库单', '供应商库存', '我的库存', '客户需求', '采购报价', '采购单', '客户管理', '供应商管理', '终端客户名录', '银行账户', '资金流水', '收支明细', '预付款', '预收款', '报价统计', '销售出库统计', '询价统计', '采购入库统计', '未收款统计', '未付款统计', '客户跟进记录统', '型号报价统计', '热搜型号统计', '拨号统计', '推广的库存', '投诉记录', '云价格推广', '开通申请', '账号管理', '汇率设置', '单号规则设置', '表格配置', '表格批量更新']
      // this.$store.commit('setAccountInfo', {
      //   pageRoles: roles
      // })
      // return roles
      // } else {
      //   var pageRoles = await this.csRequest('get-ownRoles')
      //   if (pageRoles.substr(pageRoles.length - 2, 2) === ',]') {
      //     pageRoles = pageRoles.substring(0, pageRoles.length - 2) + ']'
      //   }
      //   let jsonData = JSON.parse(pageRoles)
      //   this.$store.commit('setAccountInfo', {
      //     pageRoles: jsonData
      //   })
      //   return jsonData
      // }
    },
    // 执行客户端函数
    csExecuteCmd (req, dataJson = {}) {
      try {
        window.ExecuteCsCmd({
          request: req,
          data: JSON.stringify(dataJson)
        })
      } catch (e) {
        console.error('call From Browser error', e)
      }
    },
    // 执行客户端函数（回调）
    csRequest (req, dataJson = {}) {
      try {
        const promise = new Promise((resolve, reject) => {
          window.cefQuery({
            request: req,
            data: JSON.stringify(dataJson),
            onSuccess: (res) => { resolve(res) },
            onFailure: (err) => { reject(err) },
            persistent: false
          })
        })
        return promise
      } catch (e) {
        console.error('call From Browser error', e)
        return Promise.reject(e)
      }
    },
    // GET请求
    $get (url, ...args) {
      let {data, success, error} = {
        data: args.length && _.has(args[0], 'data') ? args[0].data : (!_.isFunction(args[0]) ? args[0] : null),
        success: args.length && _.has(args[0], 'success') && _.isFunction(args[0].success) ? args.success : (_.isFunction(args[0]) ? args[0] : args[1]),
        error: args.length && _.has(args[0], 'error') && _.isFunction(args[0].error) ? args.error : (_.isFunction(args[0]) ? args[1] : args[2])
      }

      return this.$http.get(apiDomain + url, {
        params: JSON.stringify(data),
        headers: {
          'Authorization': getCookie(cookieName)
        }
      }).then((response) => {
        try {
          return this.successResponseHandler({data: response.data, success: success, error: error})
        } catch (e) {
          _.isFunction(error) ? error(e) : this.$notify.error({title: '错误', message: e.message})
          throw e
        }
      }, (e) => {
        _.isFunction(error) ? error(e) : this.$notify.error({title: '错误', message: e.statusText || '系统错误！'})
        return e
      })
    },
    // POST请求
    $post (url, ...args) {
      let {data, success, error} = {
        data: args.length && _.has(args[0], 'data') ? args[0].data : (!_.isFunction(args[0]) ? args[0] : undefined),
        success: args.length && _.has(args[0], 'success') && _.isFunction(args[0].success) ? args.success : (_.isFunction(args[0]) ? args[0] : args[1]),
        error: args.length && _.has(args[0], 'error') && _.isFunction(args[0].error) ? args.error : (_.isFunction(args[0]) ? args[1] : args[2])
      }

      return this.$http.post(apiDomain + url, JSON.stringify(data), {
        headers: {
          'Authorization': getCookie(cookieName)
        }
      }).then((response) => {
        try {
          return this.successResponseHandler({data: response.data, success: success, error: error})
        } catch (e) {
          _.isFunction(error) ? error(e) : this.$notify.error({title: '错误', message: e.message})
          throw error
        }
      }, (e) => {
        _.isFunction(error) ? error(e) : this.$notify.error({title: '错误', message: e.statusText || '系统错误，请联系管理员！'})
        throw e
      })
    },

    // ajax请求成功对code进行处理
    successResponseHandler ({ data, success, error } = {}) {
      if (data) {
        switch (data.code) {
          case 200:
            return _.isFunction(success) ? (success(data.data) || {}) : data.data
          case 110:
            this.$alert('账号验证失败,请重新登录！', '提示', {
              showClose: false,
              confirmButtonText: '重新登录',
              callback: () => {
                this.$root.login && this.$root.login()
              }
            })
            return
          case 120:
          case 130:
          case 140:
            errorMsg = '系统异常，请稍后再试'
            break
          case 403:
            errorMsg = '账号权限限制'
            break
          case 404:
            errorMsg = '页面未找到'
            break
          case 500:
            errorMsg = '内部错误，请稍后再试'
        }

        if (data.code === 110 || data.code === 403) {
          _.isFunction(error) && error(data)
          throw new Error(data.msg)
        } else {
          errorMsg = data.msg
        }
      } else {
        var errorMsg = '数据异常，请稍后再试'
      }
      if (errorMsg) {
        throw new Error(errorMsg)
      }
    },
     // 将服务器列配置转换为表格控件列配置对象
    flexGridColumnsHandler (columnConfigs = []) {
      return columnConfigs.map(column => {
        return _.defaults({
          'name': column.BindField,
          'dataType': column.DataType,
          'binding': column.BindField,
          'width': column.ColumnWidth,
          'header': column.SCTitle || column.CTitle,
          'visible': !!column.IsShow,
          'sort': column.DisplayIndex,
          'isReadOnly': !!column.IsReadonly,
          'isSystem': !!column.IsSystem,
          'authUsers': column.ShowUserGuids,
          'isTag': !!column.IsLable,
          'isFieldSearch': !column.IsLable,
          'extraConfig': _.isString(column.ExtenValue) && column.ExtenValue.length ? JSON.parse(column.ExtenValue) : {}
        }, {
          'dataType': 1,
          'isRequired': false,
          'allowSorting': true,
          'editable': true,
          'authUsers': []
        })
      })
    },

    // 将表格的列配置对象转换为服务器列配置
    flexGridSettingHandler (columns, pageSize, defaultConfig = {}) {
      let columnsConfig = _.map(columns, column => {
        var defaultColumnConfig = defaultConfig && _.find(defaultConfig.ColumnConfigs, d => d.BindField === column.binding)
        return _.extend({}, defaultColumnConfig, {
          'BindField': column.binding,
          'ColumnWidth': column.width,
          'CTitle': column.header,
          'IsShow': column.visible,
          'DisplayIndex': column.sort,
          'IsReadonly': column.isReadOnly,
          'ShowUserGuids': column.authUsers,
          'HidedUserGuids': _.filter(this.users, user => !column.authUsers.includes(user.id)).map(user => user.id),
          'ExtenValue': column.extraConfig
        })
      })
      return _.extend({}, defaultConfig, {
        PageSize: pageSize,
        ColumnConfigs: columnsConfig
      })
    }
  },
  mounted () {
    if (this.$parent && this.$parent.$options.componentName === 'znlCol' && this.$parent.span) {
      var targetElement = this.$el
      var parent = this.$parent.$el
      let div = document.createElement('div')
    // if the parents lastchild is the targetElement...
      if (parent.lastChild === targetElement) {
        // add the newElement after the target element.
        parent.appendChild(div)
      } else {
        // else the target has siblings, insert the new element between the target and it's next sibling.
        parent.insertBefore(div, targetElement.nextSibling)
      }

      addClass(div, 'znl-cell')
      setStyle(div, { width: (100 / this.$parent.span) + '%' })
      div.appendChild(targetElement)
    }
  }
}
