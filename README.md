# cmdrslog
This extension allows you to save screenshots whenever you refresh a tab for URLs you specify.  

You may want to do this for projects you are developing, setting the urls to something like localhost:8000 or your live server.
You can specify separate folders for your projects, as well as a delay in miliseconds before taking the screenshot. 


# development
Right now if you want to try this you need to run chrome with special flags:  
```/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files --unlimited-quota-for-files```

I'm using the FileSystem API as described here:
http://www.html5rocks.com/en/tutorials/file/filesystem/  

##TODO:

✓ implement ui for choosing urls and directories  
* style and add tooltips for explaining url choosing ui  
* link to gallery (based on name) for each domain  

* implement ui for browsing directories  
* implement ui for browsing thumbnails  
* figure out Blob API to save images as proper images, not just data urls in text form.  

* write export node script that will copy the files from sandbox to filesystem  
    this could work by having the node script run locally and accept post
    requests of files + file names and writes them to disk. then have a special
    script in the plugin that posts all the images
    from the FileSystem to the node script

