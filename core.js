'use strict';

let { Cu } = require('chrome')
let loaderModule = require('toolkit/loader')
let { Loader, Require, Sandbox, load, Module, resolveURI, resolve,
      unload, descriptor, override } = loaderModule
let { env, pathFor } = require('sdk/system')
let { Scratchpad } = require('./scratchpad')
let { prefs } = require('sdk/simple-prefs')
let { Hotkey } = require('sdk/hotkeys')
let { loadReason } = require('sdk/self')

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

function libURI() {
  return normalizeURI(sdkURI()) + 'lib/'
}


function isRelative(id) { return id[0] === '.' }
function isPseudo(id) { return id === 'chrome' || id[0] === '@' }
function normalize(id) {
  return id === 'self' ? 'api-utils/self' :
         !~id.indexOf('/') ? 'addon-kit/' + id : id
}
function isSDK(id) {
  let name = id.split('/').shift()
  return name === 'api-utils' || name === 'addon-kit' || 'test-harness'
}

function resolveID(id, requirer) {
  return isRelative(id) ? resolve(id, requirer) :
         !isPseudo(id) && isSDK(normalize(id)) ? normalize(id) :
         id
}

function scratch(options) {
  let { text, name } = options || {}

  let loader = Loader({
    id: '@scratch-kit',
    name: 'scratch-kit',
    version: '0.0.1',
    main: module,
    rootURI: normalizeURI(pathFor('Home')) + '.scratch-kit/',
    prefixURI: normalizeURI(pathFor('Home')) + '.' ,
    loadReason: loadReason,
    modules: {
      'toolkit/loader': loaderModule
    },
    paths: {
      '/': 'file:///',
      '': baseURI(),
      'sdk/': libURI() + 'sdk/',
      'toolkit/': libURI() + 'toolkit/',
      './': normalizeURI(pathFor('Home')) + '.scratch-kit/'
    },
    resolve: resolveID
  })

  let module = Module('./scratch-kit', resolveURI('./scratch-kit', loader.mapping))

  let require = new function() {
    let modules = loader.modules
    let mapping = loader.mapping
    function require(id, options) {
      if (options && options.all) loader.modules = modules
      if (options && options.reload) {
        let uri = resolveURI(id, mapping)
        delete loader.modules[uri]
        require.run('sdk/system/events').emit('startupcache-invalidate', {})
      }
      return require.run(id)
    }
    require.run = Require(loader, module)
    return require
  }


  // Override globals to make `console` available.
  var globals = require('sdk/system/globals');
  Object.defineProperties(loader.globals, descriptor(globals));

  var window = Scratchpad({
    text: text || '// Jetpack scratchpad\n\n',
    sandbox: Sandbox({
      name: name || 'scratch-kit',
      prototype: override(globals, {
        require: require,
        module: module
      })
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
