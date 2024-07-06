

function IconCollection(iconLoader){

    let _currentDomainIndexes = []
    let _activeEngines = []

    this.setSearchEngines = function(engines){
        _activeEngines = engines
        _currentDomainIndexes = _getDefinedIconUrls(engines)
        _currentDomainIndexes = _currentDomainIndexes.map(
            (it,i) => it == "CURRENT_DOMAIN" ? i : -1
        ).filter(value => value !== -1)
    }

    this.getIconUrls = async function(){
        return await iconLoader.getAllIconURLs(_activeEngines)
    }

    this.needsCurrentDomain = function(){
        return _currentDomainIndexes.length > 0
    }

    this.getCurrentDomainIndexes = function(){
        return _currentDomainIndexes
    }

    function _getDefinedIconUrls(engines){
        return engines.flatMap((en) => {
            if(en.is_separator){
                return []
            }
            else if(en.is_submenu){
                return [en.icon_url, ..._getDefinedIconUrls(en.engines)]
            }
            return en.icon_url
        })
    }

}



function IconLoader(){

    let _currentDomainCache = new LRU(5)


    this.getAllIconURLs = async function (engines){
        return await getAllIconURLs(engines)
    }

    this.getCurrentDomainIcon = async function(tab){
        if(!tab || !tab.url){
            return null
        }

        let urlParts = urlparse.urlsplit(tab.url);

        if(!urlParts.hostname){
            return null
        }

        let cached = _currentDomainCache.get(urlParts.hostname)
        if(cached){
            return cached
        }

        let iconUrl = await (new AutoImageLoader(tab)).fetchIconUrl()
        _currentDomainCache.set(urlParts.hostname, iconUrl)
        return iconUrl
    }

    this.setSearchEngines = async function (engines){
        await fetchAllIcons(engines)
    }

    function getIconLoader(en){
        if(en.is_separator){
            return
        }
        else if(en.icon_url !== undefined){
            return new IconUrlLoader(en)
        }
        else if(en.is_submenu && (!en.url || en.url === "Submenu")){
            return new StaticImageLoader(chrome.runtime.getURL('img/folder.svg'))
        }
        else if(en.url == 'COPY'){
            return new StaticImageLoader(chrome.runtime.getURL('img/copy.svg'))
        }
        else{
            return new AutoImageLoader(en)
        }
    }

    function StaticImageLoader(imageUrl){

        this.fetchIcon = async function(){
            // We just return the url, so nothing to fetch
            return this
        }

        this.getIconUrl = async function(){
            return imageUrl
        }

    }

    function IconUrlLoader(en){

        let iconUrl = en.icon_url
        let iconKey = `i-u-${iconUrl}`
        let _isCurrentDomainUrl = iconUrl == "CURRENT_DOMAIN"

        this.fetchIcon = async function(){

            if(_isCurrentDomainUrl){
                return this
            }

            if(await getIconFromStorage(iconKey)){
                return this
            }

            let data = await fetchIconData(iconUrl)

            if(data !== null){
                await saveIconToStorage(iconKey, data)
            }
            return this
        }

        this.getIconUrl = async function(){

            if(_isCurrentDomainUrl){
                return await generateFallbackImage(getFallbackText(en))
            }

            return await getIconUrlFromStorageWithFallback(iconKey, en)
        }

    }

    function AutoImageLoader(en){

        const urlParts = urlparse.urlsplit(en.url);
        const hostname = urlParts.hostname.trim()

        let iconKey = `i-a-${hostname}`

        this.fetchIconUrl = async function(){
            let sources = [
                `https://s2.googleusercontent.com/s2/favicons?sz=32&domain_url=${urlParts.scheme}://${hostname}`,
                `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
                `https://api.faviconkit.com/${hostname}/32`,
            ]
            for(let i=0; i < sources.length; i++){

                let sourceUrl = sources[i]
                let data = await fetchIconData(sourceUrl)
                if(data !== null){
                    return data
                }
            }
        }

        this.fetchIcon = async function(){
            if(hostname.length === 0){
                return this
            }

            if(await getIconFromStorage(iconKey)){
                return this
            }

            let data = await this.fetchIconUrl()

            if(data !== null){
                await saveIconToStorage(iconKey, data)
            }
            return this
        }

        this.getIconUrl = async function(){
            return await getIconUrlFromStorageWithFallback(iconKey, en)
        }
    }

    async function saveIconToStorage(iconKey, data){
        try{
            await chrome.storage.session.set({[iconKey]: data})
        }catch(err){
            console.warn("Failed to save icon", err)
            if(err.message.indexOf("quota bytes exceeded") !== -1){
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/img/icon48.png',
                    title: 'Failed to store search engine icon',
                    message: 'Some search engine icons may not show properly. A restart of the browser may help to free up old data from memory. If not please report the issue.'
                });
            }
        }
    }

    async function getIconFromStorage(iconKey){
        let result = await chrome.storage.session.get(iconKey)
        if(result[iconKey]){
            return result[iconKey]
        }
    }

    async function getIconUrlFromStorageWithFallback(iconKey, en){
        let iconUrl = await getIconFromStorage(iconKey)
        if(iconUrl){
            return iconUrl
        }

        let fallbackText = getFallbackText(en)

        return await generateFallbackImage(fallbackText)
    }

    function getFallbackText(en){
        let fallbackText = "?"
        if(en.name){
            fallbackText = en.name.slice(0, 2)
        } else {
            let urlParts = urlparse.urlsplit(en.url)
            if(urlParts.hostname){
                if(urlParts.hostname.startsWith("www.")){
                    fallbackText = urlParts.hostname.slice(4, 6)
                } else{
                    fallbackText = urlParts.hostname.slice(0, 2)
                }
            } else {
                if(en.url.startsWith("www.")){
                    fallbackText = en.url.slice(4, 6)
                }else{
                    fallbackText = en.url.slice(0, 2)
                }

            }
        }
        return fallbackText
    }

    async function getAllIconURLs(engines){
        let icons = engines.flatMap(function(en){
            let loader = getIconLoader(en)
            if(!loader){
                return []
            }
            if(!en.is_submenu){
                return loader.getIconUrl()
            }
            return [loader.getIconUrl(), getAllIconURLs(en.engines)]
        })
        return (await Promise.all(icons)).flat(1)
    }

    async function fetchAllIcons(engines){
        let loaders = engines.flatMap(function(en){
            let loader = getIconLoader(en)
            if(!loader){
                return []
            }
            if(!en.is_submenu){
                return loader.fetchIcon()
            }
            return [loader.fetchIcon(), fetchAllIcons(en.engines)]
        })
        return (await Promise.all(loaders)).flat(1)
    }


    async function fetchIconData(iconUrl){
        try{
            let resp = await fetch(iconUrl)

            if(!resp.ok){
                return null
            }

            let blob = await resp.blob()

            return await convertBlobToBase64(blob)
        }catch{
            console.warn(`Failed to fetch icon ${iconUrl}`)
        }
    }

    async function generateFallbackImage(text){

        let svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <g>
        <rect fill="lightgray" height="64" width="64" y="0" x="0"/>
        <text text-anchor="middle" alignment-baseline="middle" font-family="Sans-serif"
        font-size="40" font-weight="bold" y="50%" x="50%" fill="#333333">${text}</text>
    </g>
</svg>`

        const blob = new Blob([svg], {type: 'image/svg+xml'});

        return await convertBlobToBase64(blob)
    }

    function convertBlobToBase64(blob){
        return new Promise((resolve, reject) => {
            const reader = new FileReader;
            reader.onerror = reject;
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        })
    }

}



// https://stackoverflow.com/a/46432113/183921
class LRU {
    constructor(max = 5) {
        this.max = max;
        this.cache = new Map();
    }
    get(key) {
        let item = this.cache.get(key);
        if (item) {
            // refresh key
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }
    set(key, val) {
        // refresh key
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // evict oldest
        else if (this.cache.size == this.max){
            this.cache.delete(this.first());
        }
        this.cache.set(key, val);
    }

    first() {
        return this.cache.keys().next().value;
    }
}
