module.exports = function () {
  var regl = null
  var queue = []

  var def = dfn('()')
  def.frame = function (cb) { queue.push(function (r) { r.frame(cb) }) }
  def.poll = function () { queue.push(function (r) { r.poll() }) }
  def.clear = function (opts) { queue.push(function (r) { r.clear(opts) }) }
  def.prop = function (key) {
    return function (context, props) { return props[key] }
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
  def.framebuffer = dfn('framebuffer')
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

  def.setRegl = function (r) {
    regl = r
    for (var i = 0; i < queue.length; i++) {
      queue[i](regl)
    }
    queue = null
    def.frame = r.frame
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
        if (f) f.apply(null,args)
        else queue.push(function (r) { f.apply(null,args) })
      }
    }
  }
}