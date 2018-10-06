
// Some global variables defined in the popup.js file is used in some of these functions
// eg suggestions, suggestionTemplate

function createSuggestion(label){

    let tpl = suggestionTemplate.content.cloneNode(true);

    let labelNode = tpl.querySelector('a')
    labelNode.innerHTML = label; //.replace(getQuery(), '<b>' + getQuery() + '</b>');

    labelNode.addEventListener('click', () => {
        setQuery(label);
        highlightQueryBox();
        hideSuggestions();
    })
    labelNode.tabIndex = -1;

    let node = tpl.firstElementChild

    suggestions.appendChild(tpl)

    return node
}


function clearSuggestions(){
    var node = document.querySelector('.suggestions');
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function hideSuggestions(){
    suggestions.style.display = 'none';
    searchEngines.classList.remove('with-suggestions')
}

function showSuggestions(){
    suggestions.style.display = 'block';
    searchEngines.classList.add('with-suggestions')
}

function isSuggestionsActive(){
    return suggestions.style.display === 'block';
}


// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function nextSuggestions(){
    var current = document.querySelector('.suggestions li.active');
    var next;
    if(current === null){
        next = document.querySelector('.suggestions li');
    }else{
        current.classList.remove('active');
        next = current.nextElementSibling;
        if(next === null){
            nextSuggestions(); // Activates the first suggestions, because no suggestion is currently active
            return;
        }
    }
    next.classList.add('active');
}

function previousSuggestion(){
    var current = document.querySelector('.suggestions li.active');
    var next;
    if(current !== null){
        current.classList.remove('active');
        next = current.previousElementSibling;
        if(next !== null){
            next.classList.add('active');
        }
    }

}

function setActiveSuggestion(){
    var current = document.querySelector('.suggestions li.active a');
    if(current !== null){
        setQuery(current.innerText);
        hideSuggestions();
    }
}
function hasActiveSuggestion(){
    return document.querySelector('.suggestions li.active') !== null;
}

function searchInputHasFocus(){
    return document.activeElement === document.querySelector('.search-input');
}

function setupSuggestions(){


    document.querySelector('.search-input').addEventListener('click', () => {
        if(isSuggestionsActive()){
            hideSuggestions();
        }
    })

    document.querySelector('.search-input').addEventListener('input', debounce(e => {

        if(!searchInputHasFocus()){
            hideSuggestions();
            return;
        }

        var query = getQuery();
        if(query.length == 0){
            hideSuggestions();
            return;
        }

        fetch('https://suggestqueries.google.com/complete/search?output=chrome&hl=en&q=' + encodeURIComponent(query))
        .then(resp => resp.json())
        .then(data => {
            if(!searchInputHasFocus()){
                hideSuggestions();
                return;
            }
            clearSuggestions();
            data[1].slice(0, 6).forEach(el => {
                createSuggestion(el);
            })
            showSuggestions();
        })
        .catch(err => console.log(err));

    }, 270));


}