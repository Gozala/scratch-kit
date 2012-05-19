'use strict'

let core = require('./core')
let { PageMod } = require('page-mod')


let mod = PageMod({
  include: 'https://addons.mozilla.org/en-US/developers/docs/sdk/*',
  onAttach: function(worker) {
    worker.port.on('scratch', function(source) {
      core.scratch({ text: source })
    })
  },
  contentScript: 'new ' + function() {

    var snippets = document.querySelectorAll('.syntaxhighlighter.js')

    function onScratch(event) {
      event.preventDefault()
      var code = event.currentTarget.querySelector('.code')
      var lines = code.querySelectorAll('.line')
      var source = Array.prototype.map.call(lines, function(line) {
        return line.textContent
      }).join('\n')
      self.port.emit('scratch', source)
    }

    function addExecButton(snippet) {
      var buttonHTML = '<span><a href="" class="toolbar_item command_scratch">⎋</a></span>'
      var toolbar = snippet.querySelector('.toolbar')
      toolbar.innerHTML = buttonHTML + toolbar.innerHTML
    }

    Array.prototype.forEach.call(snippets, function(snippet) {
      snippet.addEventListener('click', onScratch, false)
      addExecButton(snippet)
    })
  }
})

