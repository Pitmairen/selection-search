// ==UserScript==
// @name         Selection Search for crackwatch.com
// @namespace    https://github.com/Pitmairen/selection-search
// @version      0.1
// @description  Use search url: https://crackwatch.com/search#_selectionsearch_=%s
// @author       Pitmairen
// @license      GPL-3.0
// @match        https://crackwatch.com/search*
// @homepageURL  https://chrome.google.com/webstore/detail/selection-search/gipnlpdeieaidmmeaichnddnmjmcakoe
// @supportURL   https://github.com/Pitmairen/selection-search/issues
// @grant none
// ==/UserScript==
(function() {
    'use strict';
    var separator = '_selectionsearch_=';
    if(location.hash.indexOf(separator) !== -1){
        setTimeout(function(){
            var query = decodeURIComponent(location.hash.split(separator)[1]);

            var searchInput = document.querySelector('.bar-grid .bar-search');

            // Trigger events in react:
            // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-onchange-event-in-react-js
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(searchInput, query);
          
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("input", { bubbles: true});
            searchInput.dispatchEvent(evt);
        }, 250);
    }
})();
