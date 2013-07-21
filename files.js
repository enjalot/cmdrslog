var requestSize = 5000*1024*1024;
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
localStorage.setItem("requestSize", requestSize);
window.requestFileSystem(PERSISTENT, requestSize, onInitFs, errorHandler);
function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

var format = d3.format(",3g");
var MB = 1024*1024;
navigator.webkitPersistentStorage.queryUsageAndQuota(onUsage,  function(err) { console.log("error", err) });

function getDirectory(fs, dirname, callback) {
  fs.root.getDirectory(dirname, {create: true}, function(dirEntry) {
    callback(null, dirEntry, dirname);
  }, callback);
};

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
