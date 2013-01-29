# cmdrslog
This extension allows you to save screenshots whenever you refresh a tab for URLs you specify.  

You may want to do this for projects you are developing, setting the urls to something like localhost:8000 or your live server.
You can specify separate folders for your projects  


# development
Right now if you want to try this you need to run chrome with special flags:  
```/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files --unlimited-quota-for-files```

I'm using the FileSystem API as described here:
http://www.html5rocks.com/en/tutorials/file/filesystem/  

##TODO:

* implement ui for choosing urls and directories
* implement ui for browsing thumbnails
* write export node script that will copy the files from sandbox to filesystem

