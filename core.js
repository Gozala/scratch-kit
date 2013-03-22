"use strict";

let { Cu } = require("chrome")
let loaderModule = require("toolkit/loader")
let { Loader, Require, Sandbox, load, Module, resolveURI, resolve,
      unload, descriptor, override } = loaderModule
let { env, pathFor } = require("sdk/system")
let { Scratchpad } = require("./scratchpad")
let { prefs } = require("sdk/simple-prefs")
let { Hotkey } = require("sdk/hotkeys")
let { loadReason } = require("sdk/self")

require("./doc-mod")

function libURI() {
  let path = prefs.path || env.CFX_ROOT
  return path ? normalizeURI(path) + "lib/" : "resource://gre/modules/commonjs/"
}

function normalizeURI(uri) {
  uri = uri.substr(-1) === "/" ? uri : uri + "/"
  uri = ~uri.indexOf("://") ? uri : "file://" + uri
  return uri
}

const HOME_URI = normalizeURI(pathFor("Home"))

function scratch(options) {
  let { text, name } = options || {}

  let loader = Loader({
    id: "@scratch-kit",
    name: "scratch-kit",
    version: "0.5.0",
    main: module,
    metadata: {},
    rootURI: HOME_URI + ".scratch-kit/",
    prefixURI: HOME_URI + "." ,
    loadReason: loadReason,
    modules: {
      "toolkit/loader": loaderModule
    },
    paths: {
      "/": "file:///",
      "./":  + ".scratch-kit/",
      "": libURI(),
    }
  })

  let moduleURI = resolveURI("./scratch-kit", loader.mapping)
  let module = Module("./scratch-kit", moduleURI)

  let require = new function() {
    let modules = loader.modules
    let mapping = loader.mapping
    function require(id, options) {
      if (options && options.all) loader.modules = modules
      if (options && options.reload) {
        let uri = resolveURI(id, mapping)
        delete loader.modules[uri]
        require.run("sdk/system/events").emit("startupcache-invalidate", {})
      }
      return require.run(id)
    }
    require.run = Require(loader, module)
    return require
  }


  // Override globals to make `console` available.
  var globals = require("sdk/system/globals")
  Object.defineProperties(loader.globals, descriptor(globals))

  var window = Scratchpad({
    text: text || "// Jetpack scratchpad\n\n",
    sandbox: Sandbox({
      name: name || "scratch-kit",
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
  Hotkey({ combo: "alt-j", onPress: scratch })
  Hotkey({ combo: "meta-alt-j", onPress: scratch })
}

if (require.main === module) start()
