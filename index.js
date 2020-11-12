module.exports = function () {
  var regl = null
  var queue = []
  var def = dfn('()')
  unset()
  def.setRegl = function (r) {
    regl = r
    if (!r) return unset()
    for (var i = 0; i < queue.length; i++) {
      queue[i](regl)
    }
    queue = null
    def.frame = r.frame
    def.draw = r.draw
    def.poll = r.poll
    def.clear = r.clear
    def.buffer = r.buffer
    def.texture = r.texture
    def.elements = r.elements
    def.framebuffer = r.framebuffer
    def.framebufferCube = r.framebufferCube
    def.renderbuffer = r.renderbuffer
    def.cube = r.cube
    def.read = r.read
    def.hasExtension = r.hasExtension
    def.limits = r.limits
    def.stats = r.limits
    def.now = r.now
    def.destroy = r.destroy
    def.on = r.on
  }
  return def

  function unset () {
    if (!queue) queue = []
    def.frame = function (cb) { queue.push(function (r) { r.frame(cb) }) }
    def.draw = function (cb) { queue.push(function (r) { r.draw(cb) }) }
    def.poll = function () { queue.push(function (r) { r.poll() }) }
    def.clear = function (opts) { queue.push(function (r) { r.clear(opts) }) }
    def.prop = function (key) {
      return function (context, props) {
        if (!falsy(props[key])) {
          return props[key]
        } else {
          // missing key could be speical case unrolled uniform prop
          // https://github.com/regl-project/regl/issues/258
          // https://github.com/regl-project/regl/issues/373
          var matches = key.match(/(?<prop>.+)\[(?<index>.+)\]/i)
          if (matches) {
            return props[matches.groups.prop][matches.groups.index]
          }
        }
      }
    }
    def.props = def.prop
    def.context = function (key) {
      return function (context, props) { return context[key] }
    }
    def['this'] = function (key) {
      return function (context, props) { return this[key] }
    }
    def.buffer = dfn('buffer')
    def.texture = dfn('texture')
    def.elements = dfn('elements')
    def.framebuffer = dfnx('framebuffer',['resize','use'])
    def.framebufferCube = dfn('framebufferCube')
    def.renderbuffer = dfn('renderbuffer')
    def.cube = dfn('cube')
    def.read = function () {}
    def.hasExtension = function () {}
    def.limits = function () {}
    def.stats = function () {}
    def.now = function () { return 0 }
    def.destroy = function () { queue.push(function (r) { r.destroy() }) }
    def.on = function (name, f) { queue.push(function (r) { r.on(name,f) }) }
  }
  function dfn (key) {
    return function (opts) {
      if (key === '()' && regl) return regl(opts)
      else if (regl) return regl[key](opts)

      var f = null
      if (key === '()') {
        queue.push(function (r) { f = r(opts) })
      } else {
        queue.push(function (r) { f = r[key](opts) })
      }
      return function () {
        var args = arguments
        if (!falsy(f)) {
          if (key === '()') f.apply(null,args)
          else return f
        } else {
          queue.push(function (r) { f.apply(null,args) })
        }
      }
    }
  }
  function dfnx (key, methods) {
    return function (opts) {
      if (key === '()' && regl) return regl(opts)
      else if (regl) return regl[key](opts)

      var f = null
      if (key === '()') {
        queue.push(function (r) { f = r(opts) })
      } else {
        queue.push(function (r) { f = r[key](opts) })
      }
      var r = function () {
        var args = arguments
        if (!falsy(f)) {
          if (key === '()') f.apply(null,args)
          else return f
        } else {
          queue.push(function (r) { f.apply(null,args) })
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var m = methods[i]
        r[m] = function () {
          var args = arguments
          if (!falsy(f)) return f[m].apply(f,args)
          else queue.push(function () { f[m].apply(f,args) })
        }
      }
      return r
    }
  }
}

function falsy (x) {
  return x === null || x === undefined
}
