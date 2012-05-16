/*jshint asi:true globalstrict: true */

'use strict'

let SCRATCHKIT_URI = 'resource:///modules/devtools/scratchpad-manager.jsm'
let { Cu } = require('chrome')
let { ScratchpadManager } = Cu.import(SCRATCHKIT_URI)

function Scratchpad(options) {
  let { sandbox, text, filename, unload, open } = options
  let window = ScratchpadManager.openScratchpad({
    text: text || ''
  })

  window.addEventListener('DOMContentLoaded', function onready() {
    window.addEventListener('unload', function onunload() {
      window.removeEventListener('unload', onunload)
      unload && unload()
    })

    window.removeEventListener('DOMContentLoaded', onready)
    let scratchpad = window.Scratchpad
    let { writeAsComment, openScratchpad } = scratchpad
    open = open || openScratchpad

    // Monkey patch scratchpad
    Object.defineProperties(scratchpad, {
      chromeSandbox: {
        configurable: true,
        get: function() { return sandbox }
      },
      contentSandbox: {
        configurable: true,
        get: function() { return sandbox }
      },
      openScratchpad: {
        configurable: true,
        value: function() {
          return open.call(this)
        }
      },
      writeAsComment: {
        configurable: true,
        value: function(value) {
          let result = value && value.toString ? value : Object.prototype.toString.call(value)
          return writeAsComment.call(this, result)
        }
      }
    })
  })

  return window
}
exports.Scratchpad = Scratchpad

exports.ScratchpadManager = ScratchpadManager
