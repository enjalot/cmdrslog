//this code gets executed when someone clicks on the plugin icon and the popup
//shows up
//we use localStorage to serialize the list of domains we are taking
//screenshots of

var defaultDelay = 1000;

//on popup load we render domains that we are watching
var domains = getDomains();
var existing = d3.select("#existing").select("table");
renderDomains(existing, domains);

/*
var format = d3.format(",3g");
var MB = 1024*1024;
navigator.webkitPersistentStorage.queryUsageAndQuota(
  function(usage) {
    console.log("usage", usage);
    var mb = format((usage/MB).toFixed(2));
    d3.select(".using").text(mb);
  },
  function(err) { console.log("error", err) });
*/
function onUsage(usage) {
  console.log("usage", usage);
  var mb = format((usage/MB).toFixed(2));
  d3.select(".using").text(mb);
}

function onInitFs(fs) {
  console.log("FS", fs);

  var domains = getDomains();
  domains.forEach(function(domain) {
    //TODO: change to domain.host
    getDirectory(fs, domain.name, showFirstThumb);
  });
}

function showFirstThumb(error, dirEntry, dirName) {
  var dirReader = dirEntry.createReader();
  dirReader.readEntries(function(results) {
    var files = toArray(results);
    var latest = files[0];
    // TODO: change d.name to d.host
    d3.selectAll("tr.log").filter(function(d) { console.log(d.name, dirName); return d.name === dirName })
    .append("td")
    .append("a").attr("href", function(d) { return "/gallery.html?" + d.name }).attr("target", "_blank")
    .append("img")
    .each(function() {
      var element = this;
      latest.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
          element.src = e.target.result;
        };
        reader.readAsText(file)
      });
    })
    .text(function(d) {
      return "" + (d.count ? d.count : 0);
      //getDirectory(directory, showThumbs);
    }).classed("count", true)

  });
}


function initNewDomain(callback) {
  chrome.tabs.getSelected(null, function(tab) {
    var link = getLink(tab.url);
    var host = link.hostname;
    var port = link.port;
    if(port && port !== 80) {
      host += ":" + port;
    }
    var newDomain = {
      host: host,
      //name: host.split(".")[0],
      name: host,
      delay: defaultDelay
    }
    console.log("NEW DOMAIN", newDomain)
    callback(null, newDomain);
  });
}
function getLink(url) {
  var l = document.createElement("a");
  l.href = url;
  return l;
}

d3.select("span.add").on("click", function() {
  //add new domain to the list of domains

  initNewDomain(function(err, newDomain) {
    //if(!newDomain) return;

    var newdiv = d3.select(".editing").datum(newDomain);
    newdiv.select("input.host").attr("value", function(d) { return d.name; })
    newdiv.select("input.delay").attr("value", function(d) { return d.delay; })

    d3.select(".editing").classed("hidden", false)
    d3.select(".addnew").classed("hidden", true)
    d3.select("span.save").on("click", function() {
      var newDomain = {};
      newDomain.name = newDomain.host = newdiv.select("input.host").node().value;
      newDomain.delay = newdiv.select("input.delay").node().value;
      var domains = getDomains();
      domains.push(newDomain);
      setDomains(domains);
      renderDomains(existing, domains)
    });
  });
})

function renderDomains(g, domains) {
  console.log("DOMAINS", domains)
  var rows = g.selectAll("tr.log")
    .data(domains, function(d) { return d.host })

  rows.exit().remove();
  var row = rows.enter();
  row = row.append("tr").classed("log", true)


  row.append("td")
    .append("a").attr("href", function(d) { return "/gallery.html?" + d.name }).attr("target", "_blank")
    .text(function(d) { return "" + d.host; }).classed("host", true)
  row.append("td")
    .append("a").attr("href", function(d) { return "/gallery.html?" + d.name }).attr("target", "_blank")
    .text(function(d) { return "" + (d.count ? d.count : 0); }).classed("count", true)
}

function getDomains() {
  var domains = localStorage.getItem("domains");
  if(!domains || domains === "") domains = "[]";
  domains = JSON.parse(domains);
  return domains;
}
function setDomains(domains) {
  localStorage.setItem("domains", JSON.stringify(domains));
}
