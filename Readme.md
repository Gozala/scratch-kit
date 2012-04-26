# scratch-kit

This add-on allows you to use Firefox [Scratchpad][] to hack on add-on SDK.

# Setup

If you'd like to give it a try install add-on from downloads. Once add-on is
installed go to 'about:addons' and set preference of **scratch-kit** add-on
to a directory where you have cloned [Add-on SDK]. It should be something like
this: `file:///Users/gozala/Projects/addon-sdk/`.

# Use

Once you're done with a setup you can use scratchpad with jetpack enabled
context as long as your active tab is "about:addons" page. Following examples
give you an idea what can be done:

```js
require('addon-kit/tabs').open('data:text/html,Wellcome to scratch-kit')
require('/path/to/module') // returns module from that path

// Once module is loaded it's cached, but you can force reload. This is useful
// to load modules after you modified them.
require('/path/to/module', { reload: true })
```

[Scratchpad]:https://developer.mozilla.org/en/Tools/Scratchpad
[Add-on SDK]:https://github.com/mozilla/addon-sdk
