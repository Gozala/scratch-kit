# scratch-kit

This add-on allows you to use Firefox [Scratchpad][] to hack on add-on SDK.

# Setup

If you'd like to give it a try install add-on from downloads. Once installed
you need to configure it to so it knows where your clone of [Add-on SDK] is.
This can be done either by setting environment variable `CFX_ROOT` to a value
like this: `/Users/gozala/Projects/addon-sdk/` or via preference for this
add-on (later one shadows env variable if both set). If omitted add-on will
assume that SDK is at `~/addon-sdk/`.

# Use

Once you've configured add-on properly `accel-alt-j` keyboard shortcut (see
[Troubleshooting](#Troubleshooting)) can be used to bring up scratchpad with
jetpack context with in it. Following examples give you an idea what can be
done:

```js
require('addon-kit/tabs').open('data:text/html,Welcome to scratch-kit')
require('/path/to/module') // returns module from that path

// Once module is loaded it's cached, but you can force reload. This is useful
// to load modules after you modified them.
require('/path/to/module', { reload: true })
```

All the changes done by exectuing code in scratchpad can be undone by simply
closing scratchpad window.

You could also start playing with code examples from
[Add-on SDK documentation][]. For example go to the
[widget API documentation page][] and click green button on in the right top
corner of the first code example. You will get a new scratchpad with that
example in it ready to execute. If close scratchpad window any changes done
by it will be unloaded!

Enjoy hacking your browser!

# Troubleshooting

* `accel-alt-j` is "alt-command-j" on OSX.  In particular, the 'shift-function-f4' scratchpad shortcut
gives the 'regular' scratchpad, which won't work.
* "Jetpack scratchpad" should be on the scratchpad when you open it. 
* CFX_ROOT=/Users/glind/gits/addon-sdk  cfx run

[Scratchpad]:https://developer.mozilla.org/en/Tools/Scratchpad
[Add-on SDK]:https://github.com/mozilla/addon-sdk
[Add-on SDK documentation]:https://addons.mozilla.org/en-US/developers/docs/sdk/latest/
[widget API documentation page]:https://addons.mozilla.org/en-US/developers/docs/sdk/latest/packages/addon-kit/widget.html
