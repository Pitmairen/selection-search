// ==UserScript==
// @name         Selection Search for betaseries.com
// @namespace    https://github.com/Pitmairen/selection-search
// @version      0.1
// @description  Use search url: https://www.betaseries.com/#_selectionsearch_=%s
// @author       Pitmairen
// @license      GPLv3
// @match        https://www.betaseries.com/*
// @homepageURL  https://chrome.google.com/webstore/detail/selection-search/gipnlpdeieaidmmeaichnddnmjmcakoe
// @supportURL   https://github.com/Pitmairen/selection-search/issues
// @run-at       document-idle
// @grant none
// ==/UserScript==
(function() {
    'use strict';
    var separator = '_selectionsearch_=';
    if(location.hash.indexOf(separator) !== -1){

        setTimeout(function(){

            var query = decodeURIComponent(location.hash.split(separator)[1]);

            document.querySelector('#reactjs-header-search button').click();

            setTimeout(function(){

                var searchInput = document.querySelector('#reactjs-header-search form input');

                searchInput.value = query;

                var evt = new Event('input', { bubbles: true});
                evt.simulated = true;
                searchInput.dispatchEvent(evt);
            }, 100);

        }, 250);

    }
})();
