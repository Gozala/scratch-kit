# scratch-kit

This add-on allows you to use Firefox [scratchpad][] to hack an add-ons
by just typing JS into it. This works starting from Firefox 21 (Current Aurora).

# Usage

Once installed just press `alt-j` keyboard shortcut which will bring up
scratchpad with an [Addon-SDK][] context. You can type following examples
and run execute to see what it does!

```js
var Widget = require("sdk/widget")
var widget = Widget({
  id: "mozilla-icon",
  label: "My Mozilla Widget",
  contentURL: "http://www.mozilla.org/favicon.ico"
})

// Once module is loaded it's cached, but you can force reload. This is useful
// to load modules after you modified them.
require("sdk/widgets", { reload: true })
```

All the changes done by the typed code are undone once scratchpad window is
closed.

You could also start playing with code examples from
[Add-on SDK documentation][]. For example go to the
[widget API documentation page][] and click green button on in the right top
corner of the first code example. You will get a new scratchpad with that
example in it ready to execute. If close scratchpad window any changes done
by it will be unloaded!

Enjoy hacking your browser!

# Hacking on SDK itself

If you wanna hack on [Addon-SDK][] you may find scratch-kit also pretty handy.
All you need to do is clone [Add-on SDK][] repository and set add-on preference
to `file` URL of the location you cloned it. For example if you clone SDK into
your home directiory on OSX it will be something like:
`file:///Users/me/addon-sdk/`

If this preference is set scratch-kit will load modules from your SDK clone
so any changes you make to modules can be easily tested without running CFX
or any other boilerplate. Optionally you could also set `CFX_ROOT` environment
variable instead of add-on preference.


[Scratchpad]:https://developer.mozilla.org/en/Tools/Scratchpad
[Add-on SDK]:https://github.com/mozilla/addon-sdk
[Add-on SDK documentation]:https://addons.mozilla.org/en-US/developers/docs/sdk/latest/
[widget API documentation page]:https://addons.mozilla.org/en-US/developers/docs/sdk/latest/packages/addon-kit/widget.html
