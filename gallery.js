//TODO: allow browsing of whatever directories the user has created with this
//plugin

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;


var requestSize = 5000*1024*1024;
localStorage.setItem("requestSize", requestSize);
window.requestFileSystem(PERSISTENT, requestSize, onInitFs, errorHandler);

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
  console.log("domains", domains)
  var hash;
  console.log("hash", location.hash)
  if(hash = location.hash) {
    hash = hash.slice(1);
    directory = hash
  }
  console.log("directory", directory)

  getDirectory(directory, showThumbs);
  function showThumbs(error, dirEntry) {
    console.log("dir!", dirEntry);
    var dirReader = dirEntry.createReader();
    dirReader.readEntries(function(results) {


      var files = toArray(results);
      console.log(files.length, "files");
      //update count
      for(var i = 0; i < domains.length; i++) {
        if(domains[i].name === directory) {
          domains[i].count = files.length;
          localStorage.setItem("domains", JSON.stringify(domains));
        }
      }

      if(files.length > 100) {
        files = files.slice(0, 100)
      }

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
        .classed("log", true)
      fileDiv
        .append("img")
        .attr({
          width: "300px",
        })
        .classed("file", true);
      fileDiv
        .append("span").classed("name", true)
        .text(function(d) { return d.name });

        
      fileSel.select("img")
        .each(function(fileEntry) {
          //console.log(fileEntry, fileEntry.toURL());
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
