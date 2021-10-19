const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  //第一步：根据tag，创建HTML元素，并且存储到vnode的el中；
  const el = vnode.el = document.createElement(vnode.tag)
  //第二步：处理props属性 如果以on开头，那么监听事件； 普通属性直接通过 setAttribute 添加即可；
  if (vnode.props) {
    for (const key in vnode.props) {
      let value = vnode.props[key]
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }
  //第三步：处理子节点:如果是字符串节点，那么直接设置textContent如果是数组节点，那么遍历调用 mount 函数；
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(child => {
        mount(child, el)
      })
    }
  }

  container.appendChild(el)

}

const path = (n1, n2) => {
  // n1是旧节点 n2是新节点
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {

    // 处理props

    const el = n2.el = n1.el

    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    for (const key in newProps) {
      let value = newProps[key]
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }

    // 删除旧的oldValue
    for (const key in oldProps) {
      let value = oldProps[key]
      if (key.startsWith('on')) {
        el.removeEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.removeAttribute(key)
      }
    }

    // 处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    if (typeof newChildren === 'string') { // newChildren 是一个字符串
      if (typeof newChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren
        }
      } else {
        el.innerHTML = newChildren
      }
    } else {// 第二种情况 newChildren 本身就是一个数组
      // oldChildren 是一个字符串
      if (typeof oldChildren === 'string') {
        el.textContent = ''
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // 两个都是数组的情况
        const commonLength = Math.min(newChildren.length, oldChildren.length)

        for (let i = 0; i < commonLength; i++) {
          path(oldChildren[i], newChildren[i])
        }

        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el)
          })
        }

        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren).forEach(item => {
            el.removeChild(item)
          })
        }

      }
    }
  }
}
