
var EventUtils = new function(){

    this.eventInInputElement = function(event){
        return event.target.nodeName in {'INPUT':1, 'TEXTAREA':1} || event.target.isContentEditable;
    }

}