

chrome.tabs.getSelected(null, function(tab) {
  //console.log("TAB", tab.id, tab.url);
  var hostname = tab.url;

  document.querySelector('#snap').addEventListener('click', function(event) {
    //console.log("HEY");
    //takeScreenshot();
  })
})


