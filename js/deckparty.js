/**
 * deckparty
 * jquery plugin
 *
 * Version: 1.0.9
 *
 * Copyright 2015 BY Silvan Kolb
 * deckparty is currently available for use in all personal or commercial projects 
 * under both the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL 
 * version 2.0 (http://www.gnu.org/licenses/gpl-2.0.html) licenses. This means that you can 
 * choose the license that best suits your project and use it accordingly. 
 */
!(function ( $ ) {
	
    /**
    * deckparty Constructor.
    * @constructor
    * @params {options} All options for settings
    * @returns {deckparty} Returns a new instance of deckparty.  
    */
    $.fn.deckparty = function( options ) {

	var settings = $.extend({}, $.fn.deckparty.defaults, options);
        var deckHTML = '';
		
	/**
	* INIT
        */
        $.fn.deckparty.init(settings);

        /**
	* Event handler
        */ 		 
        var clickEventType =((document.ontouchstart!==null)?'click':'touchstart');	

        /**
	* clickEventType
        * action of click or touch event
	*/ 
        $("."+settings.anchor).live(clickEventType, function(){

			  var classNames = this.className.split(' ');

			   if(classNames[0]=='anchorLang'){
				     $.fn.deckparty.setLocaleStorage('dp-lang',classNames[1]);
			   }

			  settings.dataHash = $(this).data('id');
			  $.fn.deckparty.setLocaleStorage('deckPosting-dataHash',settings.dataHash);
						
			  $.fn.deckparty.init(settings);
		  }); 

	    	$("#"+settings.fieldEnter).keydown(function(e) {
		    if ( e.which == 13 ) {
				e.preventDefault();
				$("#"+settings.deck+' .dp-btn-form').click();
			}
  		});

		$("#"+settings.deck+' .dp-btn-form').bind('touchstart click', function(){

			if($.fn.deckparty.isOnline())
			{		 
				var classNames 	= this.className.split(' ');
				var method 		= $.fn.deckparty.getXMethod(classNames);

					$.fn.deckparty.setXRequest(settings,method);				
			} 
			else settings.onOffline.call();
		});
		return this;
	};

	/**
	* Send a form from deck to server
	* @function 	    
	* @params {settings}- Options 
	* @params {String} 	- POST or GET
	* @set 	  {server} 	- LocaleStorage & HTML
	* @return {server} 	- Response from ajax
	*/
  	$.fn.deckparty.setXRequest = function( settings, method ) {

		var daten = $("#"+settings.deck+'Form').serialize();

		// set localestorage
		if(settings.onSetLocale){
		 if($.fn.deckparty.isLocaleStorage()){
			var datenArray = $("#"+settings.deck+'Form').serializeArray();
			$.each( datenArray, function( key, v ) {
				 $.fn.deckparty.setLocaleStorage(settings.deck+'-'+v.name,v.value);
			});
		 }	
		}

		var url   		= settings.seturl;
		var param 		= settings.deck;		
		var urlParam    = '';	
		var params      = '&'+daten;	

		var xMethod = '';
		if(method == 'dp-x-post') { xMethod = 'POST'; urlParam = url + param; } else
		if(method == 'dp-x-get')  {	xMethod = 'GET';  urlParam = url + param + '&' + daten; }

		var request = $.fn.deckparty.createCORSRequest(xMethod,urlParam);
		
		if (request){
	    	request.onload = function(){
	        //do something with request.responseText       
			if (request.readyState==4 && request.status==200) 
			{
			   	if(settings.setUpdate === true){
					var json  = request.responseText; 
					var oData = $.fn.deckparty._fnJsonToObject( json );
					for(var i = 0; i < settings.fields.length; i++) {
						$.fn.deckparty.setLocaleStorage(settings.deck+'-'+settings.fields[i],oData[settings.fields[i]]);
						if(settings.setHtml===true){
							$('.'+settings.fields[i]).html(oData[settings.fields[i]]);	 
						}	
		 			 	settings.onExternal.call(); 
					}
					if($.fn.deckparty.isLocaleStorage()){
						var justInTime = $.fn.deckparty.getTimeStamp();
					    $.fn.deckparty.setLocaleStorage(settings.deck+'-deck-lut',justInTime);
					}
		    	} 		     
				$.fn.deckparty.scrollBottom(settings);

			 	settings.onSetShow.call(); 
			}
		  	}		        
		};
	    
		//Send the proper header information along with the request
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.setRequestHeader("Content-length", params.length);
		request.setRequestHeader("Connection", "close");

		if(method == 'dp-x-post') {  request.send(params); } else
		if(method == 'dp-x-get')  {  request.send(); } 
	};
			
	/**
	* Get data from Server in format JSON. Fields are updated in the this deck.
	* @function 	    
	* @params {settings}- Options 
	*/
  	$.fn.deckparty.server = function( settings ) {

		var url   		= settings.url;
		var param 		= settings.deck;
		var dataHash 	= '&dataHash='+settings.dataHash; 
		
		var urlParam 	= url + param + dataHash;	
		
		var request = $.fn.deckparty.createCORSRequest("get",urlParam);
		if (request){
	    	request.onload = function(){
	        //do something with request.responseText       
			if (request.readyState==4 && request.status==200) 
			{
			    var json  = request.responseText; 
				var oData = $.fn.deckparty._fnJsonToObject( json );

				for(var i = 0; i < settings.fields.length; i++) {					
					$.fn.deckparty.setLocaleStorage(settings.deck+'-'+settings.fields[i],oData[settings.fields[i]]);					
					if(settings.setHtml===true){
						$('.'+settings.fields[i]).html(oData[settings.fields[i]]);	 
					}	
		 		 	settings.onExternal.call(); 
				}
				if($.fn.deckparty.isLocaleStorage()){
					var justInTime = $.fn.deckparty.getTimeStamp();
				    $.fn.deckparty.setLocaleStorage(settings.deck+'-deck-lut',justInTime);
				}
				if($.fn.deckparty.isNotInit(settings)){settings.onComplete.call();}
			}
		  	}		        
	    };
	    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	    request.send();
	};

	/**
	* Template load into a deck
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
  	$.fn.deckparty.load = function( settings ) {

		var urlParam = settings.template;	
		
		var request = $.fn.deckparty.createCORSRequest("get",urlParam);
		if (request){
	    	request.onload = function(){
	        //do something with request.responseText       
			if (request.readyState==4 && request.status==200) 
			{
                deckHTML = request.responseText; 
                
                settings.loadStat = 1;
                
                // add to DOM tree model
                $.fn.deckparty.setTemplateToBody(settings);
  			}
		  	}		        
	    };
	    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	    request.send();
	};
    
	/**
	* Data from LocaleStroage into a deck
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	 $.fn.deckparty.locale = function( settings ) {

		for(var i = 0; i < settings.fields.length; i++) {
			var content = $.fn.deckparty.getLocaleStorage(settings.deck+'-'+settings.fields[i]);
			if(content === '' || content === 'undefined'){content='?';}
			if(settings.setHtml===true){
				$('.'+settings.fields[i]).html(content);	
			}	
 		 	settings.onExternal.call(); 
		}
	};
		
	/**
	* Set translate data into a deck
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
  	$.fn.deckparty.translate = function( settings ) {

		settings.lang = $.fn.deckparty.getLanguage(settings);

		if(settings.trans.length>0){
		var lang = settings.lang;
		for(var i = 0; i < settings.trans.length; i++) {
		 
			var langTrans 	= settings.trans[i][0];
			var placeholder = settings.trans[i][1];
			var content		= '';
			if(lang==langTrans){
				content = settings.trans[i][2];
				$('.'+placeholder).html(content);	
			}
		}}
	};

	/**
	* Get routing for data update
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	 $.fn.deckparty.router = function( settings ) {

		var cid  = settings.deck;
		var rule = settings.dtr; 
		var lut  = '';

		if( !$.fn.deckparty.isEmpty(rule) ){
		 	if(rule === '-'){ settings.dus = 1; } else
		 	if(rule === '0'){ settings.dus = 0; } else
		 	if(rule > 0){ 
				lut = $.fn.deckparty.getLocaleStorage(cid + '-deck-lut');

				if( $.fn.deckparty.isEmpty(lut) ){ settings.dus = 0; }
				else
				{	
					var justInTime = $.fn.deckparty.getTimeStamp();
					var diff = justInTime - lut;
			        var min = Math.floor(diff/1000/60);
					if(min >= rule){ settings.dus = 0; } else settings.dus = 1;				
				}
			} 
		}
		if( settings.dus == 0 ){
			if($.fn.deckparty.isOnline() == false ){		 
			 	settings.dus = 9; 
			} 		 
		}		
	};

	/**
	* Init a deck
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	$.fn.deckparty.init = function( settings ) {

		if( $.fn.deckparty.isNotInit(settings))
		  $.fn.deckparty.hide(settings);

		$.fn.deckparty.translate(settings);

		$.fn.deckparty.router(settings);
		
        	if($.fn.deckparty.isOnline() && settings.dus===0){

			if($.fn.deckparty.isNotInit(settings)){	
			 	settings.onCreate.call(); 
			}	
			$.fn.deckparty.server(settings); 

			if(settings.polling && settings.pollstat===false){
				setInterval(function(){ 
			 		if( $.fn.deckparty.isNotInit(settings) 
					 && $.fn.deckparty.isXLoaderPoll(settings)){
						settings.onCreate.call(); 	
					}
					if($.fn.deckparty.isOnline()){
			  	    	$.fn.deckparty.server(settings); 
			  	    } else	
			  	    	$.fn.deckparty.locale(settings); 
				}, settings.polltime);
				settings.pollstat = true;
			}	 
		} else
        	if($.fn.deckparty.isLocaleStorage() && settings.dus===1){
	    	$.fn.deckparty.locale(settings); 

			if(settings.polling && settings.pollstat===false){
				setInterval(function(){ 
		  	    	$.fn.deckparty.locale(settings); 
				}, settings.polltime);
				settings.pollstat = true;
			}	 
		} else
	        $.fn.deckparty.gotoDeck404(settings);

		if( $.fn.deckparty.isNotInit(settings))
			$.fn.deckparty.show(settings);
		$.fn.deckparty.setInitFlag(settings);

		$.fn.deckparty.scrollBottom(settings);

        	if(settings.loadStat === 0 && settings.template != ''){
        	 $.fn.deckparty.load(settings);
	 	}
	 	return this;
	};

	/**
	* Set deck hidden
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	$.fn.deckparty.hide = function( settings ) {
        
     		var actDeck =  $.fn.deckparty.findActDeck(settings);
        
	 	if(settings.myTransition===true){
	 		settings.onHide.call(); 
	 		return this;
 	 	}
	 	else { 		
			$('#'+actDeck).css('display','none');
	 		return this;
	 	}	
	};

	/**
	* Set deck show
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	 $.fn.deckparty.show = function( settings ) {
	 if(settings.myTransition===true){
	 	settings.onShow.call(settings.deck);
	 	return this;
 	 }
	 else { 	 		 		 
  		$('#'+settings.deck).css('display','block');
		return this;
	 }	
	};

	/**
	* Find an current deck
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	 $.fn.deckparty.findActDeck = function(settings) {
	 	var opaID = '';
	    $('.'+settings.deckcss).each( function() {
			var opa = $(this).css('display');
				if(opa==='block'){ 
				 	opaID = $(this).attr('id'); return false;
				}
		});
		return opaID;
	};

	/**
	* Set deck404
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	$.fn.deckparty.gotoDeck404 = function( settings ) {
		settings.deck = settings.deck404;
	};

	/**
	* Set init flag to false
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	 $.fn.deckparty.setInitFlag = function( settings ) {
		return settings.init = false;
  	};

	/**
	* get options init flag
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	$.fn.deckparty.isNotInit = function( settings ) {
		return (settings.init == false) ? true : false;
  	};

	/**
	* get options polling flag
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
	$.fn.deckparty.isXLoaderPoll = function( settings ) {
		return settings.xLoaderPoll ? true : false;
  	};

	/**
	* check deck of display 
	* @function 	    
	* @private
	* @params {list of settings} 
	*/
  	$.fn.deckparty.isView = function( settings ) {
		return ($('#'+settings.deck).attr('display')=='display') ? true : false;
  	};

	/**
	* get online status
	* @function 	    
	* @private
	* @params {event} 
	*/
	 $.fn.deckparty.isOnline = function(event) {
		return navigator.onLine ? true : false;
  	};

	/**
	* get LocaleStorage status
	* @function 	    
	* @private
	* @params {event} 
	*/
	 $.fn.deckparty.isLocaleStorage = function() {
		return (typeof(Storage)!=="undefined") ? true : false;
  	};
	
	/**
	* Init cross domain object {CORS}
	* @function 	    
	* @private
	* @params {method} - POST or GET
	* @params {url}	   - url for server
	*/
	$.fn.deckparty.createCORSRequest = function(method, url){
	    var xhr = new XMLHttpRequest();
	    if ("withCredentials" in xhr){
	        xhr.open(method, url, true);
	    } else if (typeof XDomainRequest != "undefined"){
	        xhr = new XDomainRequest();
	        xhr.open(method, url);
	    } else {
	        xhr = null;
	    }
	    return xhr;
	};
	 
	/**
	* Convert JSON to Object
	* @function 	    
	* @private
	* @params {String} - JSON 
	*/
	$.fn.deckparty._fnJsonToObject = function(json) {
		try	{ var obj = jQuery.parseJSON( json );}
		catch( e ){ return false; }
		return obj;
  	};

	/**
	* Check string empty
	* @function 	    
	* @private
	* @params {String} 
	*/
	$.fn.deckparty.isEmpty = function(str) {
	    return !str || !/[^\s]+/.test(str);
	};

	/**
	* Get timestamp 
	* @function 	    
	* @private
	* @return {longint} - Timestamp
	*/
	$.fn.deckparty.getTimeStamp = function() {
		var today = new Date(); 
		var timestamp = today.getTime(); 
		return timestamp;
  	};
	
	/**
	* Scroll to bottom
	* @function 	    
	* @private
	* @params {list of options} - settings
	*/
	 $.fn.deckparty.scrollBottom = function( settings ) {
	  	if(settings.scrollBottom){
		 	$('#'+settings.deck+' .scrollBottom').scrollTop(99999);
		 }	else
		 return false;
  	};

	/**
	* Set data to LocaleStorage
	* @function 	    
	* @private
	* @params {String} - key
	* @params {String} - value
	*/
  	$.fn.deckparty.setLocaleStorage = function(key,value) {
	    if ('localStorage' in window && window['localStorage'] !== null) {
	        try {
				localStorage.setItem(key,value);  
	        } catch (e) {
	        if (e == QUOTA_EXCEEDED_ERR) {
            	alert('Quota exceeded!');
        	}}
	    } else {return false;}
	};
    
	/**
	* Get data from LocaleStorage
	* @function 	    
	* @private
	* @params  {String} - key
	* @returns {String} - value
	*/
	 $.fn.deckparty.getLocaleStorage = function(key) {
	    if ('localStorage' in window && window['localStorage'] !== null) {
	         return localStorage.getItem(key);  
	    } else {return false;}
	};

  	/**
	* set template to body
	* @function 	    
	* @private
	* @params  {list of String} - settings
	*/
	$.fn.deckparty.setTemplateToBody = function(settings){       
       		$('body').prepend(deckHTML); 
		 if(settings.landing === 'true'){
        		 $.fn.deckparty.show(settings);
        	} else $('#'+settings.deck).css('display','none');
    	};
    	
	/**
	* Serialize form from deck
	* @function 	    
	* @private
	* @params  {list of String} - settings
	* @returns {String} - Daten
	*/
	$.fn.deckparty.serializeForm = function(settings) {
		var daten = $('#'+settings.deck+'Form').serialize();		
		return daten;
	};
    
	/**
	* Is class ?
	* @function 	    
	* @private
	* @params {String} - name of class 
	* @params {String} - name of classes
	*/
  	$.fn.deckparty.isClass = function(nameOfClass,classNames) {
		$.each( classNames, function( key, value ) {
			if(nameOfClass === value) return true;
		});
	};

    	/**
	* Get Language
	* @function 	    
	* @private
	* @params  {list of String} - settings
	*/
	 $.fn.deckparty.getLanguage = function(settings) {		
	    if ('localStorage' in window && window['localStorage'] !== null) {
	     //    return localStorage.getItem('dp-lang');  
	    }
		return settings;  
	};

	/**
	* Get field class
	* @function 	    
	* @private
	* @params  {String} - name of class
	*/
	 $.fn.deckparty.getFieldOfClass = function(classNames) {
		var cl;
		var fields = [];
		$.each( classNames, function( key, value ) {
		 	cl = value.substring(0,9);
			if(cl === 'dp-field-'){
			 	fields.push(value.substring(9));
			} 
		});
		return fields;
	};
    
	/**
	* Get xMethod for form method
	* @function 	    
	* @private
	* @params  {String} - name of class
	*/
	$.fn.deckparty.getXMethod = function(classNames) {
		var method = false;
		$.each( classNames, function( key, value ) {
			if(value === 'dp-x-post' || value === 'dp-x-get'){
			 	method = value;			 	
			} 
		});
		if(method===false) method = 'dp-x-post';
		
		return method;
	};
	
	/**
	* Defaults of settings, you can set external 
	* @private
	*/
	$.fn.deckparty.defaults = {
	    version     : '0.0.9',
	    deck  		: '',
	    anchor		: 'anchor',
	    deckcss		: 'anchorScreen',
	    dtr 		: '-',
	    fields 		: [],
	    trans 		: [],
	    deck404     : 'nodata',
	    dus         : 0,
	    url			: "index.php?ac=AjaxControllerDispatcher&kay=GMPXMJUFHPFTBKBY&cid=",
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
	    onExternal  : function() {},
	    myTransition: false,
	    init        : true,
	    xLoaderPoll : false,
      scrollBottom: false,	    
      setUpdate   : false,
      onSetLocale : true,
	    fieldEnter  : '',
	    dataHash    : '',
	    lang        : 'en',
      landing     : 'none',
	    touch       : false,
	    setHtml     : true,
      template    : '',
      loadStat    : 0,
      animation   : false,
	};

}( jQuery ));
