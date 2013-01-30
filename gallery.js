
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


window.requestFileSystem(PERSISTENT, 500*1024*1024, onInitFs, errorHandler);

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}


function onInitFs(fs) {
  console.log("FS", fs);
  function getDirectory(dirname, callback) {
    fs.root.getDirectory(dirname, {create: true}, function(dirEntry) {
      callback(null, dirEntry);
    }, callback);
  };


  getDirectory("tributaryio", function(error, dirEntry) {
    console.log("dir!", dirEntry);
    var dirReader = dirEntry.createReader();
    dirReader.readEntries(function(results) {


      var files = toArray(results);
      console.log(files);

      //files.forEach(function(file) {
      for(var i = files.length; i--;) {
        var file = files[i];
        file.file(function(f) {
          var reader = new FileReader();
          reader.onloadend = function(e) {
            //console.log("FILE LOADED", e, file.name);
            console.log(e.target.result.slice(0, 100));
          }
          reader.readAsDataURL(f);
        }, errorHandler)
      }


      var fileSel = d3.select("#gallery")
        .selectAll("img.file")
        .data(files);
      fileSel
        .enter()
        .append("img")
        .classed("file", true);
      console.log("sel", fileSel);
      fileSel
        .each(function(fileEntry) {
          console.log("FE", fileEntry);
          (function(element, entry) {
            //files.forEach(function(fileEntry) {
            entry.file(function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                //console.log("read", entry.name);
                element.src = e.target.result;
                //console.log("grrr", e.target.result.toString().slice(0, 40));
                if(entry.name === "2013-01-29 16:14:10_1359504850569.png") {
                //if(this.result.indexOf("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD") >= 0) {
                }
              };
              reader.readAsDataURL(file);
            })
          })(this, fileEntry);
        })

    })
  })

}
