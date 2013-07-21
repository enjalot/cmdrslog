var skipNumber = 100;
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

var requestSize = 5000*1024*1024;
localStorage.setItem("requestSize", requestSize);
window.requestFileSystem(PERSISTENT, requestSize, onInitFs, errorHandler);

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}
function getLink(url) {
  var l = document.createElement("a");
  l.href = url;
  return l;
}

var format = d3.format(",3g");
var MB = 1024*1024;
navigator.webkitPersistentStorage.queryUsageAndQuota(
  function(usage) {
    console.log("usage", usage);
    var mb = format((usage/MB).toFixed(2));
    d3.select("span.size").text(mb);
  },
  function(err) { console.log("error", err) });




function onInitFs(fs) {
  console.log("FS", fs);
  function getDirectory(dirname, callback) {
    fs.root.getDirectory(dirname, {create: true}, function(dirEntry) {
      callback(null, dirEntry);
    }, callback);
  };

  var domains = JSON.parse(localStorage.getItem("domains"));

  var directory
  var search, skip = 0;
  console.log("search", location.search)
  if(search = location.search) {
    search = search.slice(1);
    directory = search
  }
  console.log("domains", domains)
  if(hash = location.hash) {
    hash = hash.slice(1);
    skip = +hash || 0;
  }

  console.log("directory", directory)
  if(directory) {
    var domain;
    for(var i = 0; i < domains.length; i++) {
      //TODO: change this to host
      if(domains[i].name === directory) {
        domain = domains[i];
      }
    }
    if(!domain) return;

    // TODO: clean this code up a bit
    d3.select("#header").select("a.name").text(domain.host).attr("href", domain.host);
    d3.select(".editing").select("input.delay").attr("value", domain.delay)
      .on("keyup", function(e) {
        var delay = this.value;
        domain.delay = +delay;
        if(delay || delay === 0) {
          localStorage.setItem("domains", JSON.stringify(domains));
        }
      })
    d3.select("a.first").on("click", function() { skip = location.hash = 0; getDirectory(directory, showThumbs) })
    d3.select("a.prev").on("click", function() {
      skip = (skip || 0) - skipNumber;
      if(skip < 0) skip = 0;
      location.hash = skip;
      getDirectory(directory, showThumbs)
    })
    d3.select("a.next").on("click", function() {
      skip = (skip || 0) + skipNumber;
      console.log("skip", skip, domain.count)
      if(skip >= domain.count) return skip -= skipNumber;
      location.hash = skip;
      getDirectory(directory, showThumbs)
    })
    d3.select("a.last").on("click", function() {
      skip = domain.count - skipNumber;
      if(skip < 0) skip = 0;
      location.hash = skip;
      getDirectory(directory, showThumbs)
    })

    getDirectory(directory, showThumbs);
  }

  function showThumbs(error, dirEntry) {
    console.log("dir!", dirEntry);
    d3.select(".skip").text(skip)
    var dirReader = dirEntry.createReader();
    dirReader.readEntries(function(results) {
      var files = toArray(results);
      console.log(files.length, "files");
      //update count
      for(var i = 0; i < domains.length; i++) {
        // TODO: change this to .host
        if(domains[i].name === directory) {
          console.log("directory", domains[i].host, directory)
          domains[i].count = files.length;
          localStorage.setItem("domains", JSON.stringify(domains));
        }
      }

      d3.select("span.logs").text(files.length);
      if(files.length > 100) {
        files = files.slice(skip, skip+100)
      }

      function render() {
        //console.log("render", fileData)
        //  d3.select("body").text(fileData[fileData.length-1].data);
      }
      var fileSel = d3.select("#gallery")
        .selectAll("div.log")
        // TODO: change this to host
        .data(files, function(d) { return d.name });
      fileSel.exit().remove();
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
