//TODO: allow browsing of whatever directories the user has created with this
//plugin

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

  var domains = JSON.parse(localStorage.getItem("domains"));
  var directory = domains[0].name;

  getDirectory(directory, showThumbs);
  function showThumbs(error, dirEntry) {
    console.log("dir!", dirEntry);
    var dirReader = dirEntry.createReader();
    dirReader.readEntries(function(results) {


      var files = toArray(results);

      function render() {
        //console.log("render", fileData)
        //  d3.select("body").text(fileData[fileData.length-1].data);
      }
      var fileSel = d3.select("#gallery")
        .selectAll("img.file")
        .data(files);
      var fileDiv = fileSel
        .enter()
        .append("div")
      fileDiv
        .append("img")
        .attr({
          width: "300px",
        })
        .classed("file", true);
      fileDiv
        .append("span")
        .text(function(d) { return d.name });

        
      fileSel.select("img")
        .each(function(fileEntry) {
          console.log(fileEntry, fileEntry.toURL());
          (function(element, entry) {
            entry.file(function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                element.src = e.target.result;
              };
              reader.readAsText(file)
            })
          })(this, fileEntry);
        })

    })
  }

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
