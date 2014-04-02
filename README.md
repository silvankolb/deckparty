# deckparty JS

A JQuery plugin to manage decks for HTML5 apps


### Standalone
You can use the standalone version:
```html
<script src="deckparty.js"></script>
```

## How-to
Create a new instance of deckparty.
```js
$().deckparty({	deck : 'mydeck' });
```

### Settings
Create a new instance of `deckparty`, you can use:

```html
	$.fn.deckparty.defaults = {
	    deck  	  	: '',
	    anchor		  : 'anchor',
	    deckcss		  : 'anchorScreen',
	    dtr 		    : '-',
	    fields 		  : [],
	    trans 		  : [],
	    deck404     : 'nodata',
	    url			    : "index.php?ac=AjaxControllerDispatcher&kay=GMPXMJUFHPFTBKBY&cid=",
	    seturl      : "index.php?ac=AjaxControllerDispatcher&kay=GMPXMJUFHPFTBKBY&cid=set",
	    polling     : false,
	    polltime    : 60000,
	    pollstat    : false,
	    onCreate    : function() {},
	    onComplete  : function() {},
	    onHide      : function() {},
	    onShow      : function() {},
	    onSetShow   : function() {},
	    onOffline   : function() {},
	    onExternal  : function(sett) {},
	    init        : true,
	    xLoaderPoll : false,
		  scrollBottom: false,	    
		  setUpdate   : false,
		  onSetLocale : true,
		  fieldEnter  : '',
		  dataHash    : '',
		  lang        : 'en',
		  touch       : false,
		  setHtml     : true,
```		

## API
### deckparty(settings)
Create a new instance of `deckparty`, you can use:








## Maintained by
- Silvan Kolb (Web-App developer | app design lover)
- E-mail: [contact@silvankolb.de](mailto:contact@silvankolb.de)
- Web: [http://silvankolb.de](http://silvankolb.de)

## License
Licensed under the MIT license.

Copyright (c) 2014 [http://silvankolb.de](http://silvankolb.de).
