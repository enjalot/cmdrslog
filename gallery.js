var skipNumber = 100;

function onUsage(usage) {
  console.log("usage", usage);
  var mb = format((usage/MB).toFixed(2));
  d3.select("span.size").text(mb);
}

function onInitFs(fs) {
  console.log("FS", fs);

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
    d3.select("a.first").on("click", function() { skip = location.hash = 0; getDirectory(fs, directory, showThumbs) })
    d3.select("a.prev").on("click", function() {
      skip = (skip || 0) - skipNumber;
      if(skip < 0) skip = 0;
      location.hash = skip;
      getDirectory(fs, directory, showThumbs)
    })
    d3.select("a.next").on("click", function() {
      skip = (skip || 0) + skipNumber;
      console.log("skip", skip, domain.count)
      if(skip >= domain.count) return skip -= skipNumber;
      location.hash = skip;
      getDirectory(fs, directory, showThumbs)
    })
    d3.select("a.last").on("click", function() {
      skip = domain.count - skipNumber;
      if(skip < 0) skip = 0;
      location.hash = skip;
      getDirectory(fs, directory, showThumbs)
    })

    getDirectory(fs, directory, showThumbs);
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


