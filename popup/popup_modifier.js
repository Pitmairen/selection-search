
function PopupModifier(){

}

PopupModifier.prototype.searchEnginesUpdated = function(engines){
}

PopupModifier.prototype.modifyForPreview = function(node){
}

PopupModifier.prototype.modifyShowPosition = function(x, y){
    return {x: x, y: y}
}

PopupModifier.prototype.modifySubmenuPosition = function(menuNode, anchor, x, y){
    return {x: x, y: y}
}
