/* istanbul ignore next */

import Vue from 'vue'
const debug = process.env.NODE_ENV !== 'production'
const isServer = Vue.prototype.$isServer
const SPECIAL_CHARS_REGEXP = /([\\:\-\\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const ieVersion = isServer ? 0 : Number(document.documentMode)

/* istanbul ignore next */
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}
/* istanbul ignore next */
const camelCase = function (name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

/* istanbul ignore next */
// 封装事件注册
export const on = (function () {
  if (!isServer && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
// 封装事件解绑
export const off = (function () {
  if (!isServer && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/* element resize */
export const elResize = (function () {
  var EleResize = {
    _handleResize: function (e) {
      var ele = e.target || e.srcElement
      var trigger = ele.__resizeTrigger__
      if (trigger) {
        var handlers = trigger.__z_resizeListeners
        if (handlers) {
          var size = handlers.length
          for (var i = 0; i < size; i++) {
            var h = handlers[i]
            var handler = h.handler
            var context = h.context
            handler.apply(context, [e])
          }
        }
      }
    },
    _removeHandler: function (ele, handler, context) {
      var handlers = ele.__z_resizeListeners
      if (handlers) {
        var size = handlers.length
        for (var i = 0; i < size; i++) {
          var h = handlers[i]
          if (h.handler === handler && h.context === context) {
            handlers.splice(i, 1)
            return
          }
        }
      }
    },
    _createResizeTrigger: function (ele) {
      var obj = document.createElement('object')
      obj.setAttribute('style',
            'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden;opacity: 0; pointer-events: none; z-index: -1;')
      obj.onload = EleResize._handleObjectLoad
      obj.type = 'text/html'
      ele.appendChild(obj)
      obj.data = 'about:blank'
      return obj
    },
    _handleObjectLoad: function (evt) {
      this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__
      this.contentDocument.defaultView.addEventListener('resize', EleResize._handleResize)
    }
  }
  if (document.attachEvent) { // ie9-10
    EleResize.on = function (ele, handler, context) {
      var handlers = ele.__z_resizeListeners
      if (!handlers) {
        handlers = []
        ele.__z_resizeListeners = handlers
        ele.__resizeTrigger__ = ele
        ele.attachEvent('onresize', EleResize._handleResize)
      }
      handlers.push({
        handler: handler,
        context: context
      })
    }
    EleResize.off = function (ele, handler, context) {
      var handlers = ele.__z_resizeListeners
      if (handlers) {
        EleResize._removeHandler(ele, handler, context)
        if (handlers.length === 0) {
          ele.detachEvent('onresize', EleResize._handleResize)
          delete ele.__z_resizeListeners
        }
      }
    }
  } else {
    EleResize.on = function (ele, handler, context) {
      var handlers = ele.__z_resizeListeners
      if (!handlers) {
        handlers = []
        ele.__z_resizeListeners = handlers

        if (getComputedStyle(ele, null).position === 'static') {
          ele.style.position = 'relative'
        }
        var obj = EleResize._createResizeTrigger(ele)
        ele.__resizeTrigger__ = obj
        obj.__resizeElement__ = ele
      }
      handlers.push({
        handler: handler,
        context: context
      })
    }
    EleResize.off = function (ele, handler, context) {
      var handlers = ele.__z_resizeListeners
      if (handlers) {
        EleResize._removeHandler(ele, handler, context)
        if (handlers.length === 0) {
          var trigger = ele.__resizeTrigger__
          if (trigger) {
            trigger.contentDocument.defaultView.removeEventListener('resize', EleResize._handleResize)
            ele.removeChild(trigger)
            delete ele.__resizeTrigger__
          }
          delete ele.__z_resizeListeners
        }
      }
    }
  }
  return EleResize
})()

/* istanbul ignore next */
export const once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}
// 获取页面宽高，卷曲
export function getDocumentRect () {
  var win = {width: 0, height: 0, scrollLeft: 0, scrollTop: 0}
  if (window.innerHeight) {
    win.height = window.innerHeight
    win.width = window.innerWidth
  } else if (document.body && document.body.clientHeight) {
    win.height = document.body.clientHeight
    win.width = document.body.clientWidth
  }
  if (document.documentElement && document.documentElement.clientHeight) {
    win.height = document.documentElement.clientHeight
    win.width = document.documentElement.clientWidth
  }
  win.scrollTop = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop)
  win.scrollLeft = Math.max(window.pageXOffset, document.documentElement.scrollLeft, document.body.scrollLeft)
  return win
}
export function getClientWidthHeight () {
  let win = {
    clientWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0,
    clientHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0
  }
  return win
}

/* istanbul ignore next */
export function hasClass (el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
};

/* istanbul ignore next */
export function addClass (el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName
      }
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
};

/* istanbul ignore next */
export function removeClass (el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ')
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
};

/* istanbul ignore next */
// 获取样式兼容性函数
export const getStyle = ieVersion < 9 ? function (element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'styleFloat'
  }
  try {
    switch (styleName) {
      case 'opacity':
        try {
          return element.filters.item('alpha').opacity / 100
        } catch (e) {
          return 1.0
        }
      default:
        return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null)
    }
  } catch (e) {
    return element.style[styleName]
  }
} : function (element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

/* istanbul ignore next */
// 设置样式
export function setStyle (element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
};

 // 获取DOM元素data属性
export function getData (element, dataName) {
  if (!element || !dataName) return
  return element.getAttribute('data-' + dataName)
}

// 设置DOM元素data属性
export function setData (element, dataName, value) {
  if (!element || !dataName) return

  if (typeof dataName === 'object') {
    for (var prop in dataName) {
      if (dataName.hasOwnProperty(prop)) {
        setData(element, prop, dataName[prop])
      }
    }
  } else {
    element.setAttribute('data-' + dataName, value)
  }
}

  // 移出DOM元素data属性
export function removeData (element, dataName) {
  if (!element || !dataName) return
  element.removeAttribute('data-' + dataName)
}

  // 设置客户端Cookie
export function setCookie (name, value, expireDays) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expireDays)
  document.cookie = name + '=' + escape(value) +
      ((expireDays == null) ? '' : ';expires=' + exdate.toGMTString())
}
    // 获取客户端Cookie
export function getCookie (name) {
  if (debug) {
    // return 'Tokena42431f0-2190-4dac-b362-6d51055b50e2'
    // return 'Tokend0248172-f694-4096-b87f-c683cb2b0bba'
    // return 'Tokenad826357-9646-445b-b9e5-1a33b58aaddb'
    return 'Tokend29c914a-276f-4f7b-a7f3-682bbf2d7c73'
  } else {
    if (document.cookie.length > 0) {
      var cStart = document.cookie.indexOf(name + '=')
      if (cStart !== -1) {
        cStart = cStart + name.length + 1
        var cEnd
        cEnd = document.cookie.indexOf(';', cStart)
        if (cEnd === -1) cEnd = document.cookie.length
        return unescape(document.cookie.substring(cStart, cEnd))
      }
    }
    return ''
  }
}
