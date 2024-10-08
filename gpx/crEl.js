(function(root, factory) {
if (typeof exports === 'object') {
    module.exports = factory();
} else if (typeof define === 'function' && define.amd) {
    define(factory);
} else {
    root.crEl = factory();
}
}(this, function() {
    return function() {
        'use strict';
        var i, l, k, x, dt, ii, ll,
            args = arguments,
            e = (typeof(args[1]) === 'object' && args[1] && args[1].nodeType != 1 && args[1].ns) ? document.createElementNS(args[1].ns, args[0]) : document.createElement(args[0] && typeof(args[0]) === 'string' ? args[0] : 'div');
        for (i = 0, l = args.length; i < l; i++) { // Перебираем аргументы
            if (i > 0 && typeof(args[i]) === 'string') {
                e.appendChild(document.createTextNode(args[i])); // если строка добавлем как текстовую ноду
            } else if (typeof(args[i]) === 'object' && Object.prototype.toString.call(args[i]) === '[object Array]') { // если аргумент массив - перебираем - добавляем
                for (var j = 0; j < args[i].length; j++) {
                    if (typeof args[i][j] === 'string') {
                        e.appendChild(document.createTextNode(args[i][j]));
                    } else if (args[i][j].nodeType === 1) {
                        e.appendChild(args[i][j]);
                    }
                }
            } else if (typeof(args[i]) === 'object' && args[i] && args[i].nodeType === 1) { // если аргумент это DOM нода - добавляем
                e.appendChild(args[i]);
            } else if (typeof(args[i]) === 'object') {
                for (k in args[i]) {
                if (k === 'ns') { // Если прилетает аттрибут ns считаем что это элемент с xml namespace 
                       // e.setAttribute('xmlns', args[i][k]);
                } else if (k === 'e' || k === 'events' || k === 'event') { // Если прилетает аттрибут e, events или event проставляем обработчики событий как событие:действие
                    for (x in args[i][k]) {
                        e['on' + x] = args[i][k][x];
                    }
                } else if (/^on[a-zA-Z]+/.test(k)) { // Если ключ аттрибута начинается на on... вешаем как событие
                    if (typeof args[i][k] === 'function') {
                        e[k] = (function(func) {
                            return function() {
                                func.apply(e, arguments);
                            }
                        })(args[i][k])
                    } else {
                        e[k] = args[i][k];
                    }
                } else if ((k === 'd' || k === 'data') && Object.prototype.toString.call(args[i][k]) === '[object Object]') { // data-... аттрибуты
                    for (x in args[i][k]) {
                        if ('dataset' in e) {
                            e.dataset[x] = args[i][k][x];
                        } else {
                            e.setAttribute('data-' + (x.replace(/([A-Z])/g, function(string) {
                                return '-' + string.toLowerCase();
                            })), args[i][k][x]);
                        }
                    }
                } else if (k === 'c' || k === 'class') { // Классы 
                    if ('classList' in e) { // если поддерживается classList то разбираем строку и вешаем классы (так быстрее)
                        var classes = args[i][k].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').split(' ');
                        for (ii = 0, ll = classes.length; ii < ll; ii++) {
                            if (classes[ii].length) {
                                e.classList.add(classes[ii]);
                            }
                        }
                    } else { // если нет classList то пихаем с аттрибут class
                        e.className = args[i][k];
                    }
                } else if (k === 's' || k === 'style') { // стили можем обрабатывать и как строку и как обьект {cssCвойство:значение}
                    if (typeof args[i][k] === 'object') {
                        for (x in args[i][k]) {
                            if (x in e.style) {
                                e.style[x] = args[i][k][x];
                            }
                        }
                    } else {
                        e.style.cssText = args[i][k];
                    }
                } else {
                    if (typeof args[i][k] === 'boolean') {
                        e[k] = args[i][k];
                    } else {
                        e.setAttribute(k, args[i][k]);
                    }

                }
            }
        }
    }
    return e;
};
}));