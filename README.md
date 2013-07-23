# cmdrslog
This extension allows you to save screenshots whenever you refresh a tab for URLs you specify.  

You may want to do this for projects you are developing, 
setting the urls to something like localhost:8000 or your live server.   
You can specify separate folders for your projects, 
as well as a delay in miliseconds before taking the screenshot.  


# development
I'm using the FileSystem API as described here:  
http://www.html5rocks.com/en/tutorials/file/filesystem/

The layout is all done with [d3.js](http://d3js.org)

Getting the stored images out of the local FileSystem is the biggest item on the TODO list right now.
