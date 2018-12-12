# common-mime2
common mimetype for upload and download image file.  It supports multi-tenant and can be used by multiple projects at the same time.

# dev env set up
1. Install and run mongo db 2.5+
2. Install nodejs version 4.3.1+
3. Install npm 2.15.10+
4. Native Image library set up
    * Follow this installation guide in http://www.imagemagick.org/ to install imagemagick on the machine, it is needed for process images.
5. update dev settings: conf_dev.json
6. DEV build: ./build_dev.sh
7. start service
    * node main.js -p 8080
8. api doc
    * http://localhost:8080/apidocs/index.html

# staging env
1. api doc
    * http://123.56.234.68:18093/apidocs/index.html