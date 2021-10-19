class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  depend() {
    if (activeeffect) {
      this.subscribers.add(activeeffect)
    }
  }

  notify() {
    this.subscribers.forEach((effect) => {
      effect()
    })
  }
}

let activeeffect = null
function watchEffect(effect) {
  activeeffect = effect
  effect()
  activeeffect = null
}

// tagetMap 存储的是每个reactive的对象dep类实例
let tagetMap = new WeakMap()
function getdep(target, key) {
  let depsMap = tagetMap.get(target)
  // depsMap 为空对他做一个初始化操作
  if (!depsMap) {
    // depsMap 为空给他初始化一个map
    depsMap = new Map()
    // 将初始化的map 存进tagetMap中
    tagetMap.set(target, depsMap)
  }
  // 取出对应的dep对象 如果不为空取出来的也是对应的map,
  // 如果为空也是上面初始化的一个空map
  let dep = depsMap.get(key)
  if (!dep) {
    // 为空 初始化一个Dep的收集的类方法
    dep = new Dep()
    // 将这个初始化的 类方法 存在上面初始化为空的map中
    depsMap.set(key, dep)
  }
  // 将对应的这个 响应式依赖的收集 返回出去 比如 target是counter  这个dep就是 counter对应的dep类实例
  return dep
}

function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getdep(raw, key)
    let value = raw[key]
    Object.defineProperty(raw, key, {
      get() {
        dep.depend()
        return value
      },
      set(v) {
        value = v
        dep.notify()
      },
    })
  })
  return raw
}

let info = reactive({ counter: 100 })

watchEffect(function () {
  console.log(info.counter, '11')
})

info.counter++
info.counter++
info.counter++
info.counter++
info.counter++
info.counter++
