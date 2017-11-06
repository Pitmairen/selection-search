// ==UserScript==
// @name         Selection Search for woerterbuchnetz.de
// @namespace    https://github.com/Pitmairen/selection-search
// @version      0.5
// @description  Use search url: http://woerterbuchnetz.de/cgi-bin/WBNetz/wbgui_py?sigle=DWB#_selectionsearch_=%s
// @author       Pitmairen
// @license      GPL-3.0
// @match        http://woerterbuchnetz.de/cgi-bin/WBNetz/wbgui_py*
// @homepageURL  https://chrome.google.com/webstore/detail/selection-search/gipnlpdeieaidmmeaichnddnmjmcakoe
// @supportURL   https://github.com/Pitmairen/selection-search/issues
// @grant none
// ==/UserScript==
(function() {
    'use strict';
    var separator = '_selectionsearch_=';
    if(location.hash.indexOf(separator) !== -1){
        setTimeout(function(){
            var query = location.hash.split(separator)[1];
            var input = document.querySelector('#lemmasearchform input');
            input.value = decodeURIComponent(query);
            var submit = document.querySelector('#lemmasearchform .imgsubmit');
            submit.click();
        }, 250);
    }
})();
