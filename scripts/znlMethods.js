const version = '1.0.0'

const methods = {
  async onInit (config, refresh) {
    if (!config || config === undefined) {
      config = await this.$post(this.$options.config.configURL)
    }
    let columns = this.flexGridColumnsHandler(config.ColumnConfigs)
    this.defaultConfig = config
    this.columns = columns
    this.role = config.Role
    this.pageSize = config.PageSize
    this.resourceList = config.ResourceList.map(item => item.Code)
    if (this.initData || refresh) {
      this.onBindData()
    }
  },
  async onBindData (pageIndex = 1) {
    let filterFields = {}
    if (this.filterFields) {
      _.each(this.filterFields, (value, key) => {
        filterFields[key.substring(0, 1).toUpperCase() + key.substring(1)] = value
      })
    }
    let response = await this.$post(this.$options.config.searchURL, _.extend({
      FieldWhereString: JSON.stringify(this.searchFields),
      PageIndex: pageIndex,
      PageSize: this.pageSize
    }, filterFields))
    this.pageIndex = pageIndex
    this.itemSource = response.ResultList
    this.totalCount = response.TotalCount
    this.checkedRows = []
    this.checkedRowsCount = 0
  },
  async onSearch (params = {}) {
    _.extend(this.searchFields, params)
    await this.onBindData(1)
    this.checkedRows = []
    this.checkedRowsCount = 0
  },
  async onBeforeAddRow () {
    let nullPK = {}
    nullPK[this.$options.config.PK] = null
    if (!_.isUndefined(this.$options.config.defaultValURL)) {
      var response = await this.$post(this.$options.config.defaultValURL)
    }
    return _.extend({}, response, nullPK)
  },
  async onSaveRow (savingData) {
    let response = await this.$post((!savingData[this.$options.config.PK] ? this.$options.config.addURL : this.$options.config.updateURL), savingData)
    this.$message({ message: '保存成功', type: 'success' })
    return response
  },
  onSaveRows (rows) {
    return true
    // if (rows.length > 0) {
    //   this.$post(CONFIG.saveRowsURL, rows, (data) => {
    //     if (data >= 0) {
    //       this.$message({ message: '保存成功', type: 'success' })
    //       this.onBindData(this.pageIndex)
    //     } else {
    //       this.$message({ message: '保存失败', type: 'error' })
    //     }
    //   })
    //   return rows
    // }
  },
  async onDeleteRow (deletingData) {
    if (!deletingData[this.$options.config.PK]) {
      return true
    } else {
      let response = await this.$post(this.$options.config.deleteURL, deletingData)
      if (Number(response) > 0) {
        this.$message({ message: '删除成功', type: 'success' })
        return true
      } else {
        this.$message({ message: '删除失败', type: 'error' })
        return false
      }
    }
  },
  async onDeleteRows (deletingDatas) {
    if (_.some(deletingDatas, data => data[this.$options.config.PK])) {
      let response = await this.$post(this.$options.config.multiDeleteURL, _.filter(deletingDatas, data => data[this.$options.config.PK]))
      if (Number(response) > 0) {
        this.$message({ message: '删除成功', type: 'success' })
        return true
      } else {
        this.$message({ message: '删除失败', type: 'error' })
        return false
      }
    } else {
      this.$message({ message: '删除成功', type: 'success' })
      return true
    }
  },
  async onSaveSetting (columns, pageSize) {
    await this.$post(this.$options.config.saveConfigURL, this.flexGridSettingHandler(columns, pageSize, this.defaultConfig))
  },
  async onResetSetting () {
    await this.$post(this.$options.config.resetConfigURL)
  },
  async onRefresh () {
    await this.onBindData(this.pageIndex)
  }
}
const watch = {
  filterFields: {
    handler: 'onSearch',
    deep: true
  }
}

const mixin = {
  methods: methods
}

const watchMixin = {
  watch: watch
}
export {
  version,
  methods,
  watchMixin,
  mixin
}

