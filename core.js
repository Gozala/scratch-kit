let { Loader, Require, Sandbox,
      resolveID, unload, override } = require('api-utils/loader')
let { env, pathFor } = require('api-utils/system')
let { Scratchpad } = require('./scratchpad')
let { prefs } = require('simple-prefs')
let { Hotkey } = require('hotkeys')

require('./doc-mod')

let main = require.main;

function baseURI() {
  return prefs.base || env.CFX_BASE || 'resource:///modules/'
}

function sdkURI() {
  return prefs.path || env.CFX_ROOT || normalizeURI(pathFor('Home')) + 'addon-sdk'
}

function normalizeURI(uri) {
  uri = uri.substr(-1) === '/' ? uri : uri + '/'
  uri = ~uri.indexOf('://') ? uri : 'file://' + uri
  return uri
}

function packagesURI() {
  return normalizeURI(sdkURI()) + 'packages/'
}


function isRelative(id) { return id[0] === '.' }
function isAbsolute(id) { return id[0] === '/' }
function isPseudo(id) { return id === 'chrome' || id[0] === '@' }
function normalize(id) {
  return id === 'self' ? 'api-utils/self' :
         !~id.indexOf('/') ? 'addon-kit/' + id : id
}
function isSDK(id) {
  let name = id.split('/').shift()
  return name === 'api-utils' || name === 'addon-kit'
}
function id2path(id) {
  let paths = id.split('/')
  paths.splice(1, 0, 'lib')
  return paths.join('/')
}
function id2file(id) {
  return id.indexOf(-3) === '.js' ? id : id + '.js'
}

function resolve(id, requirer, _) {
  // We ignore passed in baseURI in favor of one in preferences or environment
  // variables. This allows reflection of changes in configuration at runtime.
  let base = baseURI()
  let uri = null
  if (isRelative(id) || isPseudo(id)) {
    uri = resolveID(id, requirer, base)
  } else if (isSDK(normalize(id))) {
    uri = resolveID(id2path(normalize(id)), requirer, packagesURI())
  } else if (isAbsolute(id)) {
    uri = 'file://' + id2file(id)
  } else {
    uri = resolveID(id, requirer, base)
  }
  return uri
}

function scratch(options) {
  let { text, name } = options || {}

  let loader = Loader({
    baseURI: baseURI(),
    rootURI: packagesURI(),
    id: 'scratch-kit',
    name: 'scratch kit',
    version: '0.0.1',
    main: module,
    resolve: resolve
  })

  let require = new function() {
    let modules = loader.modules
    function require(id, options) {
      if (options && options.all) loader.modules = modules
      if (options && options.reload) {
        let uri = loader.resolve(id, {}, baseURI())
        delete loader.modules[uri]
        require.run('api-utils/system/events').emit('startupcache-invalidate', {})
      }
      return require.run(id)
    }
    require.run = Require(loader, {})
    return require
  }

  // Override globals to make `console` available.
  override(loader.globals, require('api-utils/globals'))

  var window = Scratchpad({
    text: text || '// Jetpack scratchpad\n\n',
    sandbox: Sandbox({
      name: name || 'scratch-kit',
      prototype: { require: require }
    }),
    unload: unload.bind(unload, loader),
    open: scratch
  })

  return window
}
exports.scratch = scratch

function start() {
  Hotkey({ combo: 'accel-alt-j', onPress: scratch })
}

if (main === module) start()
