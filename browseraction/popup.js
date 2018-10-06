/**
 * The popup works like this:
 * 
 * All search engines that are not disabled for the toolbar popup is loaded into 
 * the search engine list. Separators are currently not added to the toolbar popup.
 * 
 * Then the icons are loaded and inserted into each search engine.
 * 
 * The engines are initially hidden from the popup. Depending on if a sub menu or the
 * top level menue is active, the relevant search engines are shown.
 * 
 * The initial hiding of the engines is done to make it easier to match the correct icon 
 * with the correct search engine, because the icons and the search engine will have the same
 * index in their respective lists.
 * 
 */


/**
 * Used to match a search engine with a DOM element.
 */
function EngineNode(engine, node, children){
    this.engine = engine;
    this.node = node;
    this.children = children;
}

// Hide all the items in the menu
function clearMenu(){
    searchEngines.querySelectorAll('.node').forEach(node => {
        node.style.display = 'none'
    })
}

function showElement(el){
    el.style.display = 'block';
}

function hideElement(el){
    el.style.display = 'none';
}
function showItem(selector){
    showElement(document.querySelector(selector));
}

function hideItem(selector){
    hideElement(document.querySelector(selector));
}


function showEngines(engineNodes, show_back_button, add_back_focus){

    clearMenu()

    if(show_back_button){
        showItem('.back-link')
    }else{
        hideItem('.back-link')
    }


    engineNodes.forEach((engineNode) => {
        showElement(engineNode.node);
    });

    if(show_back_button){
        // We only want back button focus if sub menu was activated by keyboard enter key
        if(add_back_focus){
            document.querySelector('.back-link a').focus();
        }
    }else{
        document.querySelector('.search-input').focus();
    }
}
function createEngineListNode(label){

    let tpl = engineTemplate.content.cloneNode(true);

    let labelNode = tpl.querySelector('.engine-name')
    labelNode.innerText = label

    let anchor = tpl.querySelector('.engine-link')
    anchor.title = label

    let engineNode = tpl.firstElementChild

    searchEngines.appendChild(tpl)

    return engineNode
}

function createEngineNode(label){
    let node = createEngineListNode(label)
    node.classList.add('engine')
    return node
}

function createBackNode(label){
    let node = createEngineListNode(label)
    node.classList.add('back-link')
    node.querySelector('.engine-img').src = '/img/back.png'
    return node
}

function getQuery(){
    return document.querySelector('.search-input').value.trim();
}

function setQuery(query){
    return document.querySelector('.search-input').value = query;
}

function hasQuery(){
    return getQuery().length > 0
}

function highlightQueryBox(){
    return document.querySelector('.search-input').focus();
}

function createEngineNodes(engines, options, in_submenu){

    let engineNodes = []


    // Only create a single back button when we create the engines for the top level menu
    if(!in_submenu){
        let backNode = createBackNode('Back')
        let a = backNode.querySelector('.engine-link')
        a.addEventListener('click', () => {
            showEngines(engineNodes, in_submenu);
        });
    }


    engines.forEach(en => {

        if(en.is_separator || (options.separate_menus && en.hide_in_toolbar)){
            return;
        }


        let node = createEngineNode(en.name)
        let a = node.querySelector('.engine-link')

        a.addEventListener('mouseenter', () => {
            a.href = utils.createSearchUrl(en, getQuery())
        })

        if(en.is_submenu){
            let engineNode = new EngineNode(en, node, createEngineNodes(en.engines, options, true))
            a.addEventListener('click', (e) => {
                e.stopPropagation()
                e.preventDefault()
                if(en.openall && hasQuery()){
                    utils.openAllInSubmenu(en, getQuery());
                    if(en.hide_on_click){
                        window.close();
                    }
                }else{
                    showEngines(engineNode.children, true, e.x === 0 && e.y === 0); // if click is activated by enter key e.x = e.y = 0 seems to be true
                }
            });
            engineNodes.push(engineNode)
        }else{
            engineNodes.push(new EngineNode(en, node, []))
            a.addEventListener('click', (e) => {
                if(hasQuery()){
                    utils.openEngine(en, getQuery());
                    if(en.hide_on_click){
                        window.close();
                    }
                }else{
                    e.preventDefault()
                    e.stopPropagation()
                    highlightQueryBox();
                }
            })
        }

        // Middle click
        a.addEventListener('auxclick', (e) => {
            if(!hasQuery()){
                e.preventDefault()
                e.stopPropagation()
                highlightQueryBox();
            }
        })

    });

    return engineNodes
}


// Used by the SearchEngineHotKeys
function SelectionUtil(){

    this.getSelection = function(){
        return getQuery();
    }

    this.hasSelection = function(){
        return hasQuery();
    }

}



let engineTemplate = document.getElementById('search-engine-template')
let suggestionTemplate = document.getElementById('suggestion-template')
let searchEngines = document.querySelector('.search-engines')
let suggestions = document.querySelector('.suggestions')
let utils = new ToolbarMenuActionUtils()



// Load the selected text, if any, from the current active tab and place
// it into the search query input when the popup loads.
chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
    if(tabs.length == 1 && tabs[0].id != undefined){

        utils.addVariables(tabs[0].url);

        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelection"}, {frameId: 0}, function(response){
            if(response !== undefined && response.selection !== undefined){
                setQuery(response.selection);
            }
        });
    }
})


function openFirstSearch(){
    document.querySelector('.engine a').click();
}


chrome.runtime.sendMessage({action:"getContentScriptData"}, function(response){

    if(response.options.toolbar_popup_style === 'icons-only'){
        document.querySelector('.search-engines').classList.add('icons-only');
    }

    if(response.options.toolbar_popup_hotkeys){
        SearchEngineHotKeys(response.engines, response.options, utils);
    }

    let engineNodes = createEngineNodes(response.engines, response.options, false)


    chrome.runtime.sendMessage({action:"getToolbarIcons"}, function(response){
        var images = document.querySelectorAll(".engine .engine-img");
        response.icons.forEach((iconUrl, index) => {
            images[index].src = iconUrl
        });
    });

    chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
        if(tabs.length == 1 && tabs[0].id != undefined){
            chrome.runtime.sendMessage({action: "getCurrentDomainIconToolbar", url: tabs[0].url}, function(response){
                if(response !== undefined && response.indexes.length > 0){
                    var images = document.querySelectorAll(".engine .engine-img");
                    response.indexes.forEach((iconIndex) => {
                        images[iconIndex].src = response.icon;
                    })

                }
            });
        }
    })

    hideSuggestions();
    // Show top level menu
    showEngines(engineNodes, false);


    if(response.options.toolbar_popup_suggestions){
        setupSuggestions();
    }

    document.querySelector('.search-input').addEventListener('keydown', e => {
        if(e.code === 'Tab' && isSuggestionsActive()){
            hideSuggestions();
        }
    })

    document.querySelector('.search-input').addEventListener('keyup', e => {

        if(e.code == 'Enter' && hasQuery()){
            if(!isSuggestionsActive() || !hasActiveSuggestion()){
                openFirstSearch();
                window.close();
                return;
            }
        }else if(!isSuggestionsActive() || !response.options.toolbar_popup_suggestions){
            return;
        } 

        if(e.code === 'ArrowDown'){
            nextSuggestions();
        }
        else if(e.code === 'ArrowUp'){
            previousSuggestion();
        }else if(e.code === 'Enter'){
            setActiveSuggestion();
        }
    })


})


