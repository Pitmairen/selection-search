# User scripts for sites that requires javascript to search

The scripts in this folder are used to make searches in selections earch work for sites that uses javascript to trigger search and show the search results. These sites does not use traditional techniques that let you specify the search query in the url, so a little bit of scripting is needed to make these sites work with selcetion search. 

## How to use

First you need to install **one** of the following extensions that let you add user scripts to Chrome.

* [Violentmonkey](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
* [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

I prefer Violentmonkey, as I think it looks a little bit nicer.  

Next you can install the scripts from the following url at openuserjs.org:
https://openuserjs.org/group/SelectionSearchExtension

Find the site you want in the list and click it, then click the install button at the script page.

Next go to selection search's [options page](chrome-extension://gipnlpdeieaidmmeaichnddnmjmcakoe/options/options.html) and add a new search url for the site.
Click the "Add New Search Engine" button and use the serch url that you find in the description of the user script, look for "Use search url: ..."


If you need script for other sites you can make a request in the [issue tracker](https://github.com/Pitmairen/selection-search/issues).
