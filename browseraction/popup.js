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
        hideElement(node);
    })
}

function showElement(el){
    el.classList.remove("is-hidden")
}

function hideElement(el){
    el.classList.add("is-hidden")
}
function showItem(selector){
    showElement(document.querySelector(selector));
}

function hideItem(selector){
    hideElement(document.querySelector(selector));
}


function showEngines(engineNodes, show_back_button, add_back_focus){

    clearMenu()

    engineNodes.forEach((engineNode) => {
        showElement(engineNode.node);
    });

    if(show_back_button){
        // We only want back button focus if sub menu was activated by keyboard enter key
        if(add_back_focus){
            document.querySelector('.back-link:not(.is-hidden) a').focus();
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

function createSeparatorNode(){
    let node = createEngineListNode("")
    node.classList.add('separator')
    node.querySelector(".engine-link").remove()
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

function isSpecialSearchEngine(en){
    // TODO: Replace with actions system like in the normal page popup
    return ['COPY'].indexOf(en.url) !== -1;
}

function replaceDomainSelection(query){
    // TODO: Replace with actions system like in the normal page popup
    if(!query.match(/^(https?|ftp):\/\//)){
        return 'http://' + query;
    }
    return query;
}

function isTriggeredByKeyboard(event){
    // if click is activated by enter key e.x = e.y = 0 seems to be true
    return event.x === 0 && event.y === 0;
}

function createEngineNodes(engines, options, in_submenu, backCallback){

    let engineNodes = []


    if(in_submenu){
        let backNode = createBackNode('Back')
        let a = backNode.querySelector('.engine-link')
        a.addEventListener('click', (e) => {
            if(isTriggeredByKeyboard(e)){
                backTriggeredByKeyboard = true;
            }
            backCallback()
        });
        engineNodes.push(
            new EngineNode(null, backNode, [])
        )
    }


    engines.forEach(en => {

        if(options.separate_menus && en.hide_in_toolbar){
            return;
        }

        if(en.is_separator){
            let node = createSeparatorNode()
            node.classList.add("separator")
            engineNodes.push(
                new EngineNode(en, node, [])
            )
            return
        }

        let node = createEngineNode(en.name)

        let a = node.querySelector('.engine-link')

        a.addEventListener('mouseenter', () => {
            if(en.url === '%s'){
                a.href = replaceDomainSelection(getQuery());
            }else{
                a.href = utils.createSearchUrl(en, getQuery())
            }
        })

        if(en.is_submenu){
            let engineNode = new EngineNode(en, node, createEngineNodes(en.engines, options, true, function(){
                showEngines(engineNodes, in_submenu, in_submenu);
            }))

            a.addEventListener('click', (e) => {
                e.stopPropagation()
                e.preventDefault()
                if(en.openall && hasQuery() && !en.openall_aux){
                    utils.openAllInSubmenu(en, getQuery());
                    if(en.hide_on_click){
                        window.close();
                    }
                }else{
                    showEngines(engineNode.children, true, isTriggeredByKeyboard(e));
                }
            });
            engineNodes.push(engineNode)
        }else{
            engineNodes.push(new EngineNode(en, node, []))
            a.addEventListener('click', (e) => {
                e.stopPropagation()
                e.preventDefault()
                if(hasQuery()){
                    utils.openEngine(en, getQuery());
                    if(en.hide_on_click){
                        window.close();
                    }
                }else{
                    highlightQueryBox();
                }
            })
        }

        // Middle click
        a.addEventListener('auxclick', (e) => {
            e.stopPropagation()
            if(!hasQuery()){
                e.preventDefault()
                highlightQueryBox();
            }else if(isSpecialSearchEngine(en)){
                e.preventDefault()
            }else if(en.is_submenu){
                e.stopPropagation()
                e.preventDefault()
                if(en.openall){
                    utils.openAllInSubmenu(en, getQuery());
                    if(en.hide_on_click){
                        window.close();
                    }
                }
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

// Keep track of if the back button was triggered using the keyboard.
// Used to prevent triggering the search input when the keyup event
// fires, after the click on the back button back to the root menu.
let backTriggeredByKeyboard = false;



// Load the selected text, if any, from the current active tab and place
// it into the search query input when the popup loads.
chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
    if(tabs.length == 1 && tabs[0].id != undefined){

        utils.addVariables(tabs[0].url);

        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelection"}, {frameId: 0}, function(response){

            if(BrowserSupport.hasLastError()){
                return
            }

            if(response !== undefined && response.selection !== undefined){
                setQuery(response.selection);
            }
        });
    }
})


function openFirstSearch(){
    document.querySelector('.engine a').click();
}

chrome.runtime.sendMessage({action:"getToolbarOptions"}, function(response){
    if(response.extra_style){
        let styleNode = document.createElement('style')
        styleNode.appendChild(document.createTextNode(response.extra_style));
        document.querySelector("head").appendChild(styleNode)
    }
})

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

        if (response.needsCurrentDomain){
            chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
                if(tabs.length == 1 && tabs[0].id != undefined){
                    chrome.runtime.sendMessage({action: "getCurrentDomainIconToolbar", url: tabs[0].url}, function(response){
                        if(response !== undefined && response.indexes.length > 0 && response.icon){
                            var images = document.querySelectorAll(".engine .engine-img");
                            response.indexes.forEach((iconIndex) => {
                                images[iconIndex].src = response.icon;
                            })

                        }
                    });
                }
            })
        }

    });


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

        if(backTriggeredByKeyboard){
            // When clicking the last back button that opens the root menu using the keyboard,
            // the search input gets focus before the enter button gets released. In this case
            // we don't want to open the first search engine, as that is probably not what
            // the user expects.
            backTriggeredByKeyboard = false;
            return
        }

        if(e.code == 'Enter' && hasQuery()){
            if(!isSuggestionsActive() || !hasActiveSuggestion()){
                openFirstSearch();
                setTimeout(window.close, 10)
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


