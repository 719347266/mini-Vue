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

let tagetMap = new WeakMap()
function getdep(target, key) {
  let depsMap = tagetMap.get(target)
  // depsMap 为空对他做一个初始化操作
  if (!depsMap) {
    depsMap = new Map()
    tagetMap.set(target, depsMap)
  }
  // 取出对应的dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

function reactive(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      let dep = getdep(target, key)
      dep.depend()
      return target[key]
    },
    set(target, key, value) {
      let dep = getdep(target, key)
      target[key] = value
      dep.notify()
    },
  })
}

let info = reactive({ name: '123' })

watchEffect(function () {
  console.log(info.name)
})

info.name = '321'
