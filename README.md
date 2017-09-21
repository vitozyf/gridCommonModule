# 通用组件使用说明

## 基础表格组件baseElementGrid
### Attributes
- data 表格数据
- maxHeightData 最大高度
- border 是否带纵边框
- empty-text 空数据文本
- isFit 是否固定
- highlight-current-row 是否高亮当前行
- height 高度
- default-sort 排序方式

### Events

## 可编辑表格组件actionElementGrid
### Attributes

### Events


## 其他组件

### 编辑框组件znlEditGridDlg
- Attributes
  - type 类型
  - showAddRowButton 显示‘新增一行’按钮  （type为action或edit）
  - isMultiRowsCheck && showDeleteRowButton  显示‘删除选中行’按钮 （type为action或edit）
  - isMultiRowsCheck && showDeleteRowButton  显示‘删除选择行’按钮 （type为action或edit）
  - showStocklistCheck    显示‘选择库存’按钮 （type为action或edit）
  - IsExcelCheck    显示‘从Excel粘贴’按钮 （type为action或edit）
  - onPageSave  保存方法
  - pageSubmit  提交方法
  - pageCancel  撤单方法
  - pageAudit   审核方法

- 调用举例

  ```javascript
    <znl-dialog title='测试znl-edit-grid-dlg标题'
                 :visible='showStkstocklog'
                 @update:visible="(val)=>{showStkstocklog=val}"
                 size='small'>
        <znl-edit-grid-dlg ref="StkStockLog"
                     :item-source="itemSource"
                      :maxHeightData="500"
                      height="300px"
                      :columns="columns"
                      type="edit"
                      :isBtn="true"
                      :showStocklistCheck='true'
                      :on-search="onSearch"
                      :isFieldsSearch="true"
                      :total-count="totalCount"
                      :page-index="pageIndex"
                      :page-size="pageSize"
                      :on-save-rows="onSaveRows"
                      :on-page-changed="onPageChanged"
                      :checkbox-binding-key="checkboxBindingKey"
                      ></znl-edit-grid-dlg>
      </znl-dialog>
  ```

### 选择框组件znlSelectDlg
- Attributes
  - on-page-changed  翻页回调函数

- $emit('confirm', selectedRow)  双击/确定向父组件提供选择数据（单条）
- this.$emit('cancel') 取消 向父组件发起cancel事件 在父组件关闭选择框

- 调用例子

  ```javascript
    <znl-dialog title='测试Select标题'
                 :visible='showSelectLog'
                 @update:visible="(val)=>{showSelectLog=val}"
                 size='small'>
        <znl-select-dlg ref="StkSelectLog"
                      :item-source="itemSource"
                      :maxHeightData="500"
                      height="300px"
                      :columns="columns"
                      :on-search="onSearch"
                      :isFieldsSearch="true"
                      :total-count="totalCount"
                      :page-index="pageIndex"
                      :page-size="pageSize"
                      :on-page-changed="onPageChanged"
                      :checkbox-binding-key="checkboxBindingKey"
                      @cancel="cancel"
                      @confirm="confirm"
                      ></znl-select-dlg>
      </znl-dialog>
  ```

## 调用说明
### 使用环境
- vue
- element-ui
- 建议使用vue-cli搭建

### 依赖安装
- vue
- vue-awesome
- element-ui
