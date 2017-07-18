

/**
 * Enables auto hide for an popup element
 * @param {*} domNode the dom node that represents the element in the html
 * @param {*} popupObject the object that represents the popup. Must have the "show" and "hide" methods.
 * @param {*} hideDelay the delay in milliseconds before the popup is hidden
 */
function EnableAutoHide(domNode, popupObject, hideDelay){

    var timer = null;

    function _startTimer(){
        timer = setTimeout(popupObject.hide, hideDelay);
    }
    function _clearTimer(){
        if(timer != null){
            clearTimeout(timer);
            timer = null;
        }
    }

    // Wraps the original show and hide methods of the popup object so that
    // we can start/clear the hide timer when the popup is shown/hidden.
    function _wrapShowMethod(){
        var _original_show = popupObject.show;
        var _original_hide = popupObject.hide;
        popupObject.show = function(){
            // Call the original method and pass on the arguments
            _original_show.apply(popupObject, arguments);
            _startTimer();
        }
        popupObject.hide = function(){
            _clearTimer();
            _original_hide.apply(popupObject, arguments);
        }
    }

    domNode.addEventListener('mouseenter', _clearTimer);
    domNode.addEventListener('mouseleave', _startTimer);
    _wrapShowMethod();
}