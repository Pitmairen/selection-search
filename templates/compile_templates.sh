#!/usr/bin sh

# doT templates is needed. (npm install)

./dot-packer -s options -d _compiled

cat _compiled/folder_end.js > options.js
cat _compiled/searchengine.js >> options.js
cat _compiled/separator.js >> options.js
