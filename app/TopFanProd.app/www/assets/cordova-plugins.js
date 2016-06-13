/* MIT licensed */
// (c) 2012 Jesse MacFadyen, Nitobi

/*global Cordova */


function ChildBrowser()
{
  // Does nothing
}
// Callback when the location of the page changes
// called from native
ChildBrowser._onLocationChange = function(newLoc)
{
  var callback = window.plugins.childBrowser.onLocationChange;
  if(typeof callback === 'function') {
    callback.call(this, newLoc);
  }
};
// Callback when the user chooses the 'Done' button
// called from native
ChildBrowser._onClose = function()
{
  var callback = window.plugins.childBrowser.onClose;
  if(typeof callback === 'function') {
    callback.call(this);
  }
};
// Callback when the user chooses the 'open in Safari' button
// called from native
ChildBrowser._onOpenExternal = function()
{
  var callback = window.plugins.childBrowser.onOpenExternal;
  if(typeof callback === 'function') {
    callback.call(this);
  }
};
// Pages loaded into the ChildBrowser can execute callback scripts, so be careful to
// check location, and make sure it is a location you trust.
// Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
// called from native
ChildBrowser._onJSCallback = function(js,loc)
{
  // Not Implemented
  //window.plugins.childBrowser.onJSCallback(js,loc);
};
/* The interface that you will use to access functionality */

// Show a webpage, will result in a callback to onLocationChange
ChildBrowser.prototype.showWebPage = function(loc, useRestrictedBrowser)
{
  cordova.exec(null, null, "ChildBrowserCommand", "showWebPage",[loc, useRestrictedBrowser]);
};

// Open a page in the system browser
ChildBrowser.prototype.openExternal = function(loc)
{
  cordova.exec(null, null, "ChildBrowserCommand", "openExternal",[loc]);
};

// close the browser, will NOT result in close callback
ChildBrowser.prototype.close = function()
{
  cordova.exec(null, null, "ChildBrowserCommand", "close",[]);
};
// Not Implemented
ChildBrowser.prototype.jsExec = function(jsString)
{
// Not Implemented!!
//Cordova.exec("ChildBrowserCommand.jsExec",jsString);
};
// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.childBrowser
ChildBrowser.install = function()
{
  if(!window.plugins)
  {
    window.plugins = {
    };
  }
  window.plugins.childBrowser = new ChildBrowser();
};


cordova.addConstructor(ChildBrowser.install);
function GoogleAnalyticsPlugin() {}

GoogleAnalyticsPlugin.prototype.startTrackerWithAccountIds = function(primaryId, secondaryId) {
  cordova.exec(null, null, "GoogleAnalyticsPlugin", "startTrackerWithAccountIds", [primaryId, secondaryId]);
};

GoogleAnalyticsPlugin.prototype.trackPageview = function(pageUri) {
  cordova.exec(null, null, "GoogleAnalyticsPlugin", "trackPageview", [pageUri]);
};

GoogleAnalyticsPlugin.prototype.trackEvent = function(category,action,label,value) {
  var options = {category:category,
    action:action,
    label:label,
    value:value};
  cordova.exec(null, null, "GoogleAnalyticsPlugin", "trackEvent", [options]);
};

GoogleAnalyticsPlugin.prototype.setCustomVariable = function(index,name,value) {
  var options = {index:index,
    name:name,
    value:value};
  cordova.exec(null, null, "GoogleAnalyticsPlugin", "setCustomVariable", [options]);
};

GoogleAnalyticsPlugin.prototype.hitDispatched = function(hitString) {
  //console.log("hitDispatched :: " + hitString);
};
GoogleAnalyticsPlugin.prototype.trackerDispatchDidComplete = function(count) {
  //console.log("trackerDispatchDidComplete :: " + count);
};
GoogleAnalyticsPlugin.prototype.redirectToTopfanPlugin = function(str) {
  var options = {
    'name': str
  };
  cordova.exec(null, null, "GoogleAnalyticsPlugin", "redirectToTopfanPlugin", [options]);
}; 

cordova.addConstructor(function() {
  if(!window.plugins) window.plugins = {};
  window.plugins.googleAnalyticsPlugin = new GoogleAnalyticsPlugin();
});
/**
 * PhoneGap/Cordova is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) Matt Kane 2010
 * Copyright (c) 2010, IBM Corporation
 */


;(function(){

//-------------------------------------------------------------------
var BarcodeScanner = function() {
}

//-------------------------------------------------------------------
BarcodeScanner.Encode = {
        TEXT_TYPE:     "TEXT_TYPE",
        EMAIL_TYPE:    "EMAIL_TYPE",
        PHONE_TYPE:    "PHONE_TYPE",
        SMS_TYPE:      "SMS_TYPE",
        CONTACT_TYPE:  "CONTACT_TYPE",
        LOCATION_TYPE: "LOCATION_TYPE"
}

//-------------------------------------------------------------------
BarcodeScanner.prototype.scan = function(success, fail, options) {
    function successWrapper(result) {
        result.cancelled = (result.cancelled == 1)
        success.call(null, result)
    }

    if (!fail) { fail = function() {}}

    if (typeof fail != "function")  {
        console.log("BarcodeScanner.scan failure: failure parameter not a function")
        return
    }

    if (typeof success != "function") {
        fail("success callback parameter must be a function")
        return
    }
  
    if ( null == options ) 
      options = []

    return Cordova.exec(successWrapper, fail, "org.apache.cordova.barcodeScanner", "scan", options)
}

//-------------------------------------------------------------------
BarcodeScanner.prototype.encode = function(type, data, success, fail, options) {
    if (!fail) { fail = function() {}}

    if (typeof fail != "function")  {
        console.log("BarcodeScanner.scan failure: failure parameter not a function")
        return
    }

    if (typeof success != "function") {
        fail("success callback parameter must be a function")
        return
    }

    return Cordova.exec(success, fail, "org.apache.cordova.barcodeScanner", "encode", [{type: type, data: data, options: options}])
}

//-------------------------------------------------------------------

// remove Cordova.addConstructor since it was not supported on PhoneGap 2.0
if (!window.plugins) window.plugins = {}

if (!window.plugins.barcodeScanner) {
    window.plugins.barcodeScanner = new BarcodeScanner()
}

})();
//
//  FacebookConnect.js
//
// Created by Olivier Louvignes on 2012-06-25.
//
// Copyright 2012 Olivier Louvignes. All rights reserved.
// MIT Licensed

(function(cordova) {

  function FacebookConnect() {}
  var service = 'FacebookConnect';

  FacebookConnect.prototype.initWithAppId = function(appId, callback) {
    if(!appId) return false;

    var _callback = function(result) {
    //console.log('FacebookConnect.initWithAppId: %o', arguments);
      if(typeof callback == 'function') callback.apply(null, arguments);
    };

    return cordova.exec(_callback, _callback, service, 'initWithAppId', [{appId: appId}]);

  };

  FacebookConnect.prototype.login = function(options, callback) {
    if(!options) options = {};

    var config = {
      permissions: options.permissions || ['email'],
      appId: options.appId || ''
    };

    var _callback = function(result) {
      //console.log('FacebookConnect.login: %o', arguments);
      if(typeof callback == 'function') callback.apply(null, arguments);
    };

    return cordova.exec(_callback, _callback, service, 'login', [config]);

  };

  /**
   * Make an asynchrous Facebook Graph API request.
   *
   * @param {String} path Is the path to the Graph API endpoint.
   * @param {Object} [options] Are optional key-value string pairs representing the API call parameters.
   * @param {String} [httpMethod] Is an optional HTTP method that defaults to GET.
   * @param {Function} [callback] Is an optional callback method that receives the results of the API call.
   */
  FacebookConnect.prototype.requestWithGraphPath = function(path, options, httpMethod, callback) {
    var method;

    if(!path) path = "me";
    if(typeof options === 'function') {
      callback = options;
      options = {};
      httpMethod = undefined;
    }
    if (typeof httpMethod === 'function') {
      callback = httpMethod;
      httpMethod = undefined;
    }
    httpMethod = httpMethod || 'GET';

    var _callback = function(result) {
      //console.log('FacebookConnect.requestWithGraphPath: %o', arguments);
      if(typeof callback == 'function') callback.apply(null, arguments);
    };

    return cordova.exec(_callback, _callback, service, 'requestWithGraphPath', [{path: path, options: options, httpMethod: httpMethod}]);

  };

  FacebookConnect.prototype.logout = function(callback) {

    var _callback = function(logout) {
      //console.log('FacebookConnect.logout: %o', arguments);
      if(typeof callback == 'function') callback.apply(null, arguments);
    };

    return cordova.exec(_callback, _callback, service, 'logout', []);

  };

  FacebookConnect.prototype.dialog = function(method, options, callback) {

    var _callback = function(result) {
      //console.log('FacebookConnect.dialog: %o', arguments);
      if(typeof callback == 'function') callback.apply(null, arguments);
    };

    return cordova.exec(_callback, _callback, service, 'dialog', [{method: method, params: options}]);

  };

  cordova.addConstructor(function() {
    if(!window.plugins) window.plugins = {};
    window.plugins.facebookConnect = new FacebookConnect();
  });

})(window.cordova || window.Cordova);
// window.plugins.emailComposer

var EmailComposer = function() {
  this.resultCallback = null; // Function
}

EmailComposer.ComposeResultType = {
  Cancelled:  0,
  Saved:      1,
  Sent:       2,
  Failed:     3,
  NotSent:    4
};

// showEmailComposer : all args optional
EmailComposer.prototype.showEmailComposer = function(subject,body,toRecipients,ccRecipients,bccRecipients,bIsHTML) {
  var args = {};
  if(toRecipients)
    args.toRecipients = toRecipients;
  if(ccRecipients)
    args.ccRecipients = ccRecipients;
  if(bccRecipients)
    args.bccRecipients = bccRecipients;
  if(subject)
    args.subject = subject;
  if(body)
    args.body = body;
  if(bIsHTML)
    args.bIsHTML = bIsHTML;

  cordova.exec(null, null, "EmailComposer", "showEmailComposer", [args]);
};

// this will be forever known as the orch-func -jm
EmailComposer.prototype.showEmailComposerWithCB = function(cbFunction,subject,body,toRecipients,ccRecipients,bccRecipients,bIsHTML) {
  this.resultCallback = cbFunction;
  this.showEmailComposer.apply(this,[subject,body,toRecipients,ccRecipients,bccRecipients,bIsHTML]);
};

EmailComposer.prototype._didFinishWithResult = function(res) {
  if((typeof this.resultCallback) === 'function') {
    this.resultCallback(res);
  }
};

EmailComposer.install = function() {
  if(!window.plugins) window.plugins = {};
  if(!window.plugins.emailComposer) window.plugins.emailComposer = new EmailComposer();
};
cordova.addConstructor(EmailComposer.install);

var AudioStreamer = function( playerEl ) {

  var _src,
      _artist,
      _title;

  var _playing = false;
  var _paused = false;
  var _wasPaused = false;
  var _playTime = 0;
  var _duration = 0;
  var _playbackInterval = null;

  var _audio = null;
  var _controls = null;

  var init = function() {
    // add cache-player controls
    _controls = new cp.CachePlayerConrols( playerEl, controlsDelegate );
    _controls.setLoadedPercent(1);  // normally this would be called while loading, but since we can't seem to get that from the phonegap library, we say that it's fully loaded to make the progress calculations happy
  };

  // update controls on stream progress ----------------------
  var startMonitoringStream = function() {
    // start animation loop to check time and update controls
    if( _playbackInterval != null ) cancelAnimationFrame( _playbackInterval );
    _playbackInterval = requestAnimationFrame( monitorPlayback );
  }

  var monitorPlayback = function() {
    requestAnimationFrame( monitorPlayback );
    window.plugins.AudioStream.getProgress(updateProgress);
    window.plugins.AudioStream.getDuration(updateDuration);
  };

  var updateDuration = function(duration) {
    _duration = duration;
    if( duration > 0 ) _controls.setTotalTime( duration * 1000 );
  };

  var updateProgress = function(progress) {
    var lastPlayTime = _playTime;
    _playTime = progress;
    if( ( Math.abs( _playTime - lastPlayTime ) > 0.02 && _paused == false ) || _wasPaused == false ) {
      _wasPaused = false;
      setControlsProgress( _playTime );
      _controls.setBuffering( false );
    }
  };

  var setControlsProgress = function(progress) {
    _controls.setCurTime( progress * 1000 );
  };

  // stream operations -----------------------------
  var playAudio = function(src, artist, title, seekTime) {
    _src = src;
    _artist = artist;
    _title = title;

    var seekTime = seekTime || 0;
    var seekDelay = (seekTime == 0) ? 200 : 500;

    window.plugins.AudioStream.play(src,function(){
      setTimeout(function(){
        window.plugins.AudioStream.seekToTime( seekTime ); // seems to prevent a weird issues where progress wouldn't report back properly from AudioStreamer... however, if this happened, and the user seeked, it would report properyl, so we just seek to fix it...
      },seekDelay);
    });
    if( artist && title ) window.plugins.AudioStream.setNowPlaying( artist, title );

    // activate controls
    _controls.setPlaying();
    _controls.setBuffering( true );
    _controls.setCurTime(0);

    _paused = false;
    _playing = true;
    // start updating controls
    startMonitoringStream();
  };

  var pauseAudio = function() {
    _paused = !_paused;
    if( _paused ) {
      _playing = false;
      window.plugins.AudioStream.pause();
    } else {
      _playing = true;
      _paused = false;
      startMonitoringStream();
      controlsDelegate.seekTo(_playTime * 1000);
    }
  };

  var stopAudio = function() {
    window.plugins.AudioStream.stop();
  };

  // media streaming callbacks ---------------------
  // set up callback for AudioStream state changes
  // window.plugins.AudioStream.onStatusChange(function(status) {
  //   console.log("STATUS " + status);
  //   if(status == 'isPlaying') {
  //     _playing = true;
  //   } else if (status == 'isStopping') {
  //     console.log('Stopped');
  //     _playing = false;
  //     if( completeCallback ) completeCallback();
  //   } else if (status == 'isLoading') {
  //     console.log('Loading...');
  //   }
  // });

  // controls delegate ----------------------------
  var controlsDelegate = {
    seekTo: function( milliseconds ) {
      if( _playing == true ) {
        window.plugins.AudioStream.seekToTime(milliseconds/1000);
        window.plugins.AudioStream.pause(); // unpauses since we pause on touch
      } else {
        playAudio( _src, _artist, _title, milliseconds/1000 );
      }
      _controls.setBuffering( true );

      _wasPaused = true;
      setTimeout(function(){
        _paused = false;
        _playing = true;
        startMonitoringStream();
      }, 300);
    },
    pause: function() {
      if( _paused == false ) {
        _paused = !_paused;
        window.plugins.AudioStream.pause();
      }
    },
    // no close or play button in our interface
    play: function() {},
    close: function() {}
  };

  var reset = function() {
    _pause = false;
    _playing = false;
    stopAudio();
    _controls.setCurTime(0);
    _controls.setTotalTime(0);
  };

  var dispose = function() {
    _controls.dispose();
  };

  // initialization --------------------------------
  init();

  // public interface -----------------------------
  return {
    play: playAudio,
    stop: stopAudio,
    pause: pauseAudio,
    isPaused: function(){ return _paused; },
    reset: reset,
    dispose: dispose
  };
};


/*
 //  Copyright 2010 Liip AG. All rights reserved.
 //  MIT licensed
 */


function AudioStream() {
    this.lastMetaData = null;
    this.status = "isStopped";
    this.isLoading = false;
    this.callbacks = {
    onMetaDataChanged: [],
    onStatusChanged: [],
    onError: []
    };
}

AudioStream.prototype.play = function(url,metaCallBack) {
    try {
        cordova.exec(null, null, "AudioStream", "play", [url, metaCallBack]);
    } catch (e) {
        console.log(e);
    }
    
    this.isLoading = true;
    this.setStatus("isLoading");
};
AudioStream.prototype.pause = function() {
    cordova.exec(null,null,"AudioStream","pause", []);
};
AudioStream.prototype.stop = function() {
    cordova.exec(null,null,"AudioStream","stop", []);
};
AudioStream.prototype.mute = function() {
    cordova.exec(null,null,"AudioStream","mute", []);
};
AudioStream.prototype.unmute = function() {
    cordova.exec(null,null,"AudioStream","unmute", []);
};
AudioStream.prototype.setNowPlaying = function(artist, title) {
    cordova.exec(null,null,"AudioStream","setNowPlaying",[artist, title]);
};
AudioStream.prototype.seekToTime = function(seekTime) {
    cordova.exec(null,null,"AudioStream","seekToTime",[seekTime]);
};
AudioStream.prototype.getProgress = function(successCallback, errorCallback) {
    cordova.exec(function(result){ successCallback( result ); },function(result){ successCallback( 0 ); },"AudioStream","getProgress",[]);
};
AudioStream.prototype.getDuration = function(successCallback, errorCallback) {
    cordova.exec(function(result){ successCallback( result ); },function(result){ successCallback( 0 ); },"AudioStream","getDuration",[]);
};
AudioStream.prototype.registerNativeCallback = function(successCallback) {
    cordova.exec(function(result){ successCallback( result ); },null,"AudioStream","registerNativeCallback", []);
};


AudioStream.prototype.getMetaData = function(successCallback, errorCallback, options) {
    if (typeof successCallback == "function") {
        successCallback(this.lastMetaData);
    }
    return this.lastMetaData;
};

AudioStream.prototype.getStatus = function() {
    return this.status;
}

AudioStream.prototype.getRemoteControlClick = function(successCallback, errorCallback) {
    if (typeof successCallback == "function") {
        successCallback(this.lastMetaData);
    }
    return this.lastMetaData;
};


/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
AudioStream.prototype.onMetaDataChange = function(successCallback, errorCallback, options) {
    // Invoke the appropriate callback with a new Position object every time the implementation
    // determines that the position of the hosting device has changed.
    
    this.getMetaData(successCallback, errorCallback, options);
    this.callbacks.onMetaDataChanged.push(successCallback);
};

AudioStream.prototype.setMetaData = function(metaData) {
    metaData = metaData.replace(/StreamTitle='(.*)'/,"$1");
    this.lastMetaData = metaData;
    for (var i = 0; i < this.callbacks.onMetaDataChanged.length; i++) {
        
        var f = this.callbacks.onMetaDataChanged[i];
        f(metaData);
    }
};

AudioStream.prototype.onStatusChange = function(successCallback, errorCallback, options) {
    this.callbacks.onStatusChanged.push(successCallback);
};

AudioStream.prototype.setStatus = function(status) {
    this.status = status;
    if (status == 'isPlaying') {
        this.isLoading = false;
    }
    for (var i = 0; i < this.callbacks.onStatusChanged.length; i++) {
        var f = this.callbacks.onStatusChanged[i];
        f(status);
    }
    if (status == 'isStopping' && this.isLoading) {
        this.setStatus('isLoading');
    }
};

cordova.addConstructor(function() {
  if(!window.plugins) window.plugins = {};
  window.plugins.AudioStream = new AudioStream();
});

var TAG = "NativeStorage.js";

function NativeStorage() {
    console.log(TAG + ": is created");
}

NativeStorage.prototype.set = function(reference, value, success, error) {
    if (reference === null) {
        error("The reference can't be null");
    }
    if (value === null) {
        error("a Null value isn't supported");
    }
    switch (typeof value) {
        case 'undefined':
            error("an undefined type isn't supported");
            break;
        case 'boolean':
            {
                this.putBoolean(reference, value, success, error);
                break;
            }
        case 'number':
            {
                // Good now check if it's a float or an int
                if (value === +value) {
                    if (value === (value | 0)) {
                        // it's an int
                        this.putInt(reference, value, success, error);
                    } else if (value !== (value | 0)) {
                        this.putDouble(reference, value, success, error);
                    }
                }
                else error("The value doesn't seem to be a number");
                break;
            }
        case 'string': {
            this.putString(reference, value, success, error);
            break;
        }
        case 'object': {
            this.putObject(reference, value, success, error);
            break;
        }
        default:
            error("The type isn't supported or isn't been recognized");
    }
};

/* removing */
NativeStorage.prototype.remove = function(reference, success, error) {
    //console.log(TAG+": putBoolean");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }

    cordova.exec(success, error, "NativeStorage", "remove", [reference]);
};


/* boolean storage */
NativeStorage.prototype.putBoolean = function(reference, aBoolean, success, error) {
    //console.log(TAG+": putBoolean");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }

    if (aBoolean === null) {
        error("a Null value isn't supported"); return;
    }

    if (typeof aBoolean === 'boolean') {
        cordova.exec(success, error, "NativeStorage", "putBoolean", [reference, aBoolean]);
    }
    else error("Only boolean types are supported");
};

NativeStorage.prototype.getBoolean = function(reference, success, error) {
    //console.log(TAG+": getBoolean");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }
    cordova.exec(success, error, "NativeStorage", "getBoolean", [reference]);
};

/* int storage */
NativeStorage.prototype.putInt = function(reference, anInt, success, error) {
    //console.log(TAG+": putInt");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }

    cordova.exec(success, error, "NativeStorage", "putInt", [reference, anInt]);
};

NativeStorage.prototype.getInt = function(reference, success, error) {
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }
    cordova.exec(success, error, "NativeStorage", "getInt", [reference]);
};


/* float storage */
NativeStorage.prototype.putDouble = function(reference, aFloat, success, error) {
    //console.log(TAG+": putFloat");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }

    cordova.exec(success, error, "NativeStorage", "putDouble", [reference, aFloat]);
};

NativeStorage.prototype.getDouble = function(reference, success, error) {
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }
    cordova.exec(success, error, "NativeStorage", "getDouble", [reference]);
};

/* string storage */
NativeStorage.prototype.putString = function(reference, s, success, error) {
    //console.log(TAG+": putString");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }

    cordova.exec(success, error, "NativeStorage", "putString", [reference, s]);
};

NativeStorage.prototype.getString = function(reference, success, error) {
    //console.log(TAG+": getString");
    if (reference === null) {
        error("Null reference isn't supported"); return;
    }
    cordova.exec(success, error, "NativeStorage", "getString", [reference]);
};

/* object storage */
NativeStorage.prototype.putObject = function(reference, obj, success, error) {
    var objAsString = "";
    try {
        objAsString = JSON.stringify(obj);
    } catch (err) {
        error(err);
    }
    this.putString(reference, objAsString, success, error);
};

NativeStorage.prototype.getObject = function(reference, success, error) {
    //console.log(TAG+": getObject");
    this.getString(reference, function(data) {
        var obj = {};
        try {
            obj = JSON.parse(data);
            success(obj);
        } catch (err) {
            error(err);
        }
    }, error);
};


cordova.addConstructor(function() {
  if(!window.plugins) window.plugins = {};
  window.plugins.NativeStorage = new NativeStorage();
});

	
  
  
  
  
  
  
  

