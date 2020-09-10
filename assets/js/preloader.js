(function() {
    function disable_scroll(e) {
        e.stopImmediatePropagation();
        return false;
    }
    function onready() {
        document.body.classList.add('js-loaded');
        setTimeout(function() {
            var splash = document.getElementsByClassName('splash')[0];
            splash.parentElement.removeChild(splash);
        }, 500);
        removeEventListener(window, 'load', onready);
        removeEventListener(document, 'scroll', disable_scroll);
        removeEventListener(document, 'touchstart', disable_scroll);
    }
    function addEventListener(obj, event, handler) {
        obj.addEventListener(event, handler, false);
    }
    function removeEventListener(obj, event, handler) {
        obj.removeEventListener(event, handler, false);
    }
    addEventListener(window, 'load', onready);
    addEventListener(document, 'scroll', disable_scroll);
    addEventListener(document, 'touchstart', disable_scroll);
})();
