//this code gets executed when someone clicks on the plugin icon and the popup
//shows up
//we use localStorage to serialize the list of domains we are taking
//screenshots of

//on popup load we render domains that we are watching
var domains = getDomains();
var existing = d3.select("#existing").select("table");
domains.forEach(function(domain) {
  renderDomain(existing, domain);
})

var format = d3.format(",3g");
var MB = 1024*1024;
window.webkitStorageInfo.queryUsageAndQuota(
  webkitStorageInfo.PERSISTENT,
  function(usage) {
    console.log("usage", usage);
    var mb = format((usage/MB).toFixed(2));
    d3.select(".using").text(mb);
  },
  function(err) { console.log("error", err) });

//default new domain to current tab
initNewDomain(function(newDomain) {
  //fill in the new domain info
  var newdiv = d3.select("#new").select(".inputs").datum(newDomain);
  newdiv.select("input.name").attr("value", function(d) { return d.name; })
  newdiv.select("input.host").attr("value", function(d) { return d.host; })
  newdiv.select("input.delay").attr("value", function(d) { return d.delay; })
})

function initNewDomain(callback) {
  chrome.tabs.getSelected(null, function(tab) {
    var link = getLink(tab.url);
    var host = link.hostname;
    var port = link.port;
    if(port !== 80) {
      host += ":" + port;
    }
    var newDomain = {
      host: host,
      name: host.split(".")[0],
      delay: 0
    }
    callback(newDomain);
  });
}

function getLink(url) {
  var l = document.createElement("a");
  l.href = url;
  return l;
}

d3.select("button.add").on("click", function() {
  //add new domain to the list of domains
  newdiv = d3.select("#new");
  var newDomain = {};
  newDomain.name = newdiv.select("input.name").node().value;
  newDomain.host = newdiv.select("input.host").node().value;
  newDomain.delay = newdiv.select("input.delay").node().value;

  newdiv.select("input.name").attr("value", "");
  newdiv.select("input.host").attr("value", "");
  newdiv.select("input.delay").attr("value", 0);

  var domains = getDomains();
  domains.push(newDomain);

  setDomains(domains);

  var existing = d3.select("#existing");
  renderDomain(existing, newDomain);
})

function renderDomain(g, domain) {
  var row = g.append("tr").classed("log", true)
    .datum(domain)

  row.append("td")
    .append("a").attr("href", function(d) { return "/gallery.html#" + d.name }).attr("target", "_blank")
    .text(function(d) { return "" + d.name; }).classed("name", true)
  row.append("td")
    .append("a").attr("href", function(d) { return "/gallery.html#" + d.name }).attr("target", "_blank")
    .text(function(d) { return "" + d.host; }).classed("host", true)
  row.append("td")
    .append("a").attr("href", function(d) { return "/gallery.html#" + d.name }).attr("target", "_blank")
    .text(function(d) { return "" + d.delay + "ms"; }).classed("delay", true)
  row.append("td")
    .append("a").attr("href", function(d) { return "/gallery.html#" + d.name }).attr("target", "_blank")
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
