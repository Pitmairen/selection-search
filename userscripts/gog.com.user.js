// ==UserScript==
// @name         Selection Search for gog.com
// @namespace    https://github.com/Pitmairen/selection-search
// @version      0.2
// @description  Use search url: https://www.gog.com/#_selectionsearch_=%s
// @author       Pitmairen
// @license      GPLv3
// @match        https://www.gog.com/*
// @homepageURL  https://chrome.google.com/webstore/detail/selection-search/gipnlpdeieaidmmeaichnddnmjmcakoe
// @supportURL   https://github.com/Pitmairen/selection-search/issues
// @grant none
// ==/UserScript==
(function() {
    'use strict';
    var separator = '_selectionsearch_=';
    if(location.hash.indexOf(separator) !== -1){
        var query = decodeURIComponent(location.hash.split(separator)[1]);

        document.querySelector('.js-menu-search .menu-link--search').click();

        var searchInput = document.querySelector('.menu-search-input input');

        searchInput.value = query;

        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        searchInput.dispatchEvent(evt);
    }
})();
