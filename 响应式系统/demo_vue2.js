class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify() {
    this.subscribers.forEach((effect) => {
      effect()
    })
  }
}

let dep = new Dep()

let activeEffect = null
function watchEffect(effect) {
  // 加入依赖中
  activeEffect = effect
  // 添加依赖后 立即执行一次
  effect()
  dep.depend()
}

let tagetMap = new WeakMap()
function getdep(target, key) {
  let depsMap = tagetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    tagetMap.set(target, depsMap)
  }
  // 取出对应的dep
  let dep = tagetMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    let dep = getdep(raw, key)
    console.log(dep, 'dep')
    let value = raw[key]
    Object.defineProperty(raw, key, {
      get() {
        dep.depend()
        return value
      },
      set(newValue) {
        value = newValue
        dep.notify()
      },
    })
  })
  return raw
}

let info = reactive({ counter: 100 })

// watchEffect(function () {
//   console.log(info.counter)
// })

watchEffect(function () {
  console.log(info.counter, '2222')
})

// info.counter++
