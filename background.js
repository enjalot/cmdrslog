// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// To make sure we can uniquely identify each screenshot tab, add an id as a
// query param to the url that displays the screenshot.
// Note: It's OK that this is a global variable (and not in localStorage),
// because the event page will stay open as long as any screenshot tabs are
// open.
var id = 100;


//FileSystem stuff from http://www.html5rocks.com/en/tutorials/file/filesystem/

function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  console.log('Error: ' + msg);
}
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
//window.requestFileSystem(window.PERSISTENT, 1024*1024*1024 /*1GB*/, onInitFs, errorHandler);
window.webkitStorageInfo.requestQuota(PERSISTENT, 500*1024*1024, function(grantedBytes) {
  console.log("granted", grantedBytes);
  window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
}, function(e) {
  console.log('Error', e);
});


function onInitFs(fs) {
  console.log('Opened file system: ' + fs.name);

  function getDirectory(dirname, callback) {
    fs.root.getDirectory(dirname, {create: true}, function(dirEntry) {
      callback(null, dirEntry);
    }, callback);
  };


  function takeScreenshot(dirname, tab) {
    console.log("taking screenshot");
    chrome.tabs.captureVisibleTab(null, function(img) {
      var screenshotUrl = img;
      var format = d3.time.format("%Y-%m-%d %X");
      var time = new Date();
      var filename = format(time) + "_" + (+time) + ".png";
      //save the image (base64 data) into the specified directory
      getDirectory(dirname, function(err, dirEntry) {
        if(err) return errorHandler(err);
        //save the thumbnail
        console.log("writing to file", filename, "in", dirname);
        dirEntry.getFile(filename, {create: true}, function(fileEntry) {

          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {
              console.log('Write completed.');
            };

            fileWriter.onerror = function(e) {
              console.log('Write failed: ' + e.toString());
            };

            // Create a new Blob and write it to log.txt.
            var blob = new Blob([img], {type: 'image/png'});

            fileWriter.write(blob);
            console.log("wrote", fileEntry.toURL());

          }, errorHandler);

        })


      });

    });

  }
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    //{ tabId, windowId }
    localStorage.setItem("activeTab", activeInfo.tabId);
    //console.log("set", activeInfo.tabId)
  })

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //console.log("status", changeInfo.status, changeInfo)
    if(changeInfo.status != "complete") return;

    //check if this is active tab
    var activeTab = localStorage.getItem("activeTab");
    console.log("active", activeTab, tabId);
    if(+activeTab === tabId) {
      //check if this tab's url matches one we are listening on
      if(tab.url.match(/tributary.io\/inlet/)) {
        console.log("url match!", tab.url)
        //save to appropriate directory
        var directory = "tributaryio"
        takeScreenshot(directory, tab);
      } else if(tab.url.match(/localhost:8888\/inlet/)) {
        var directory = "tributarydev"
        takeScreenshot(directory, tab);
      }
    }

  });

  // Listen for a click on the camera icon.  On that click, take a screenshot.
  chrome.browserAction.onClicked.addListener(function(tab) {
    //alert("SUP", tab.id);
    //console.log("TAB", tab, tab.id);
    //localStorage.setItem("mytabid", tab.id);
    /*
    if (tab.url.match(/code.google.com/)) {
      takeScreenshot();
    } else {
      alert('This sample can only take screenshots of code.google.com pages');
    }
    */
  });

}
