// CUDDLEFISH_ROOT
const { data } = require('self');
const { ChromeMod } = require('./chrome-mod');
const preferences = require('addon-kit/simple-prefs');


let workers = []
let mod = ChromeMod({
  include: 'about:addons',
  contentScriptFile: data.url('loader.js'),
  onAttach: function(worker) {
    worker.on('destroy', function() {
      workers.splice(workers.indexOf(worker), 1)
    })
    workers.push(worker)

    if (preferences.prefs.path != 'file://')
      worker.port.emit('pathChange', preferences.prefs.path)
  }
})

preferences.on('path', function(path) {
  workers.forEach(function(worker) {
    worker.port.emit('pathChange', preferences.prefs.path)
  })
})


const tabs = require("tabs");
if (tabs.length==1) {
  tabs[0].url = ("about:addons");  // let's go somewhere useful
}
