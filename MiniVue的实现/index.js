function createApp(app) {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldVnode = null

      watchEffect(function () {
        if (!isMounted) {
          console.log(app)
          oldVnode = app.rander()
          mount(oldVnode, container)
          isMounted = true
        } else {
          const newVnode = app.rander()
          path(oldVnode, newVnode)
          oldVnode = newVnode
        }
      })
    },
  }
}
