/*jshint asi:true globalstrict: true */

'use strict';

let Cu = Components.utils
let ioService = Cc['@mozilla.org/network/io-service;1'].
                getService(Ci.nsIIOService)

function resolveURI(relative, base) {
  return ioService.newURI(relative, null, ioService.newURI(base, null, null)).spec
}
function isRelative(id) { return id[0] === '.' }
function isSDK(id) {
  let name = id.split('/').shift()
  return name === 'api-utils' || name === 'addon-kit'
}
function id2path(id) {
  let paths = id.split('/')
  paths.splice(1, 0, 'lib')
  return paths.join('/')
}

function normalize(uri) {
  return uri.substr(-3) !== '.js' ? uri + '.js' : uri
}

self.port.on('pathChange', function(path) {
  let SDK_ROOT = path

  if (SDK_ROOT.substr(-1, 1) !=== '/')
    SDK_ROOT += '/'

  function resolve(id, requirer) {
    let uri = null
    if (loader && id in loader.modules)
      uri = id
    else if (isRelative(id))
      uri = normalize(resolveURI(id, requirer.uri))
    else if (isSDK(id))
      uri = normalize(resolveURI(id2path(id), SDK_ROOT + 'packages/'))
    else
      uri = normalize(resolveURI(id, 'file://'))
    return uri
  }

  let uri = resolve('api-utils/cuddlefish')
  let { Require, Loader, override } = Cu.import(uri)
  let console = override({}, unsafeWindow.console)
  console.exception = console.error

  let loader = Loader({
    globals: { console: console },
    resolve: resolve
  })
  let modules = override({}, loader.modules)
  let module = { id: '@scratch-kit', uri: uri }


  function require(id, options) {
    if (options && options.all) loader.modules = modules
    if (options && options.reload) {
      let uri = resolve(id, module)
      delete loader.modules[uri]
      require.run('api-utils/system/events').emit('startupcache-invalidate', {})
    }
    return require.run(id)
  }
  require.run = Require(loader, module)
  unsafeWindow.console = console
  unsafeWindow.require = require
  unsafeWindow.loader = loader
})
