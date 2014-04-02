# deckparty JS

A JQuery plugin to manage decks for HTML5 apps


### Standalone
You can use the standalone version:
```html
<script src="deckparty.js"></script>
```

## How-to
Create a new instance of deckparty with the name of deck (ID).

```js
// JAVASCRIPT
$().deckparty({	deck : 'mydeck' });
```

```js
// HTML
<div id="mydeck">  ...  <div>
```

## API
### deckparty(deck)
Set a new `deck` with identifier.
- `deck` - DIV ID Identifier.

### deckparty(anchor)
Set a anchor to linked this deck.
- `anchor` - Name of link anchor.




## Sample with two decks and linking

```js
// JAVASCRIPT
$().deckparty({	
                deck   : 'mydeck1',
                anchor : 'anchorMyDeck1',
              });
$().deckparty({	
                deck   : 'mydeck2',
                anchor : 'anchorMyDeck2',
              });
```

```js
// HTML
<div id="mydeck1">  
  <div class="anchorMyDeck2"> Link to mydeck2 </div>
<div>
<div id="mydeck2">  
  <div class="anchorMyDeck1"> Link to mydeck1 </div>
<div>
```

## Maintained by
- Silvan Kolb (Web-App developer | app design lover)
- E-mail: [contact@silvankolb.de](mailto:contact@silvankolb.de)
- Web: [http://silvankolb.de](http://silvankolb.de)

## License
Licensed under the MIT license.

Copyright (c) 2014 [http://silvankolb.de](http://silvankolb.de).
