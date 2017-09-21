/**
 * 移动元素到指定的节点
 * 使用方法：
 * v-move-to.body //移到body目录
 * v-move-to="moveTo" //可以为Node节点元素或检索元素的字符串或Function
 */

const version = '1.0.0'

const refreshComponent = function (component) { // 解决flexgrid tab切换后无法正常渲染问题
  if (!component) return
  if (component.grid && component.grid.invalidate) {
    component.grid.invalidate()
  }
  if (component.$children.length) {
    _.each(component.$children, child => {
      refreshComponent(child)
    })
  }
}

const refreshGrid = {
  inserted (el, binding, vnode) {
    refreshComponent(vnode.componentInstance)
  }
  // update (el, binding, vnode) {
  //   refreshComponent(vnode.componentInstance)
  // }
}

const mixin = {
  directives: {
    refreshGrid: refreshGrid
  }
}

export {
  version,
  refreshGrid,
  mixin
}
