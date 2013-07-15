console.log("background")

// Listen for a click on the camera icon.  On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("HEY!");
  /*
    */
});

function urlMatch(url, pattern) {
  //right now we do naive match assuming pattern is the host
  //in the future we may want more sophisticated rules for matching urls
  return url.indexOf(pattern) >= 0;
}


var requestSize = 5000*1024*1024;
//FileSystem stuff from http://www.html5rocks.com/en/tutorials/file/filesystem/
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
//window.requestFileSystem(window.PERSISTENT, 1024*1024*1024, onInitFs, errorHandler);
window.webkitStorageInfo.requestQuota(PERSISTENT, requestSize, function(grantedBytes) {
  console.log("granted", grantedBytes/1024/1024 + "MB");
  localStorage.setItem("granted", grantedBytes);
  window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
}, function(e) {
  console.log('Error', e);
});


function onInitFs(fs) {
  console.log('Opened file system: ' + fs.name);

  /*
  chrome.syncFileSystem.getUsageAndQuota(fs, function (storageInfo) {
    console.log("INFO", storageInfo)
    var using = storageInfo.usageBytes/1024/1024;
    var total = storageInfo.quotaBytes/1024/1024;
    console.log("hi", using, total)
    localStorage.setItem("using", using);
    localStorage.setItem("total", total);
  });
  */


  function getDirectory(dirname, callback) {
    fs.root.getDirectory(dirname, {create: true}, function(dirEntry) {
      callback(null, dirEntry);
    }, callback);
  };


  function takeScreenshot(dirname, tab) {
    //console.log("taking screenshot", dirname, tab);
    chrome.tabs.captureVisibleTab(null, function(img) {
      var screenshotUrl = img;
      //console.log("IMG")
      //console.log(img);
      var format = d3.time.format("%Y-%m-%d %X");
      var time = new Date();
      var filename = format(time) + "_" + (+time) + ".jpg";
      //save the image (base64 data) into the specified directory
      getDirectory(dirname, function(err, dirEntry) {
        if(err) return errorHandler(err);
        //save the thumbnail
        //console.log("writing to file", filename, "in", dirname);
        dirEntry.getFile(filename, {create: true}, function(fileEntry) {

          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {
              console.log('Write completed.');
            };

            fileWriter.onerror = function(e) {
              console.log('Write failed: ' + e.toString());
            };

            //TODO: figure out how to write a binary image instead of the data
            //url? Since we are writing the string to disk, we can load it into
            //the src of an img, but we can't directly open it with chrome
            //var blob = new Blob([img], {type: 'image/jpeg'});
            var blob = new Blob([img]);

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
    //console.log("active", activeTab, tabId);
    var domains = localStorage.getItem("domains");
    domains = JSON.parse(domains);

    if(+activeTab === tabId) {
      //check if this tab's url matches one we are listening on
      for(var i = domains.length; i--;) {
        if(urlMatch(tab.url, domains[i].host)) {
          if(!domains[i].count) domains[i].count = 0;
          domains[i].count += 1
          localStorage.setItem("domains", JSON.stringify(domains));
          setTimeout(takeScreenshot, domains[i].delay, domains[i].name, tab);
        }
      }
      /*
      if(tab.url.match(/tributary.io\/inlet/)) {
        console.log("url match!", tab.url)
        //save to appropriate directory
        var directory = "tributaryio"
        //takeScreenshot(directory, tab);
      } else if(tab.url.match(/localhost:8888\/inlet/)) {
        var directory = "tributarydev"
        //takeScreenshot(directory, tab);
      }
      */
    }

  });

}




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
