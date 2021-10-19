class Dep {
  constructor() {
    this.subscribers = new Set();
  }
  depend() {
    if (activeeffect) {
      this.subscribers.add(activeeffect);
    }
  }
  notify() {
    this.subscribers.forEach(item => {
      item();
    });
  }
}

const targetMap = new WeakMap();
function getData(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

let activeeffect = null;
function watchEffect(fn) {
  activeeffect = fn;
  fn();
  activeeffect = null;
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      let dep = getData(target, key);
      dep.depend();
      return Reflect.get(target, key, receiver);
    },
    set(target, key, newValue, receiver) {
      let dep = getData(target, key);
      Reflect.set(target, key, newValue, receiver);
      dep.notify();
    },
  });
}

const infoProx = reactive({ name: "123" });
// infoProx.name = "321";
watchEffect(() => {
  console.log(infoProx.name, "name");
});
infoProx.name = "aaaa";
