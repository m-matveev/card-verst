var Masker = (function (modules) {
    var installedModules = {};

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId])
            return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {exports: {}, id: moduleId, loaded: false};
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }

    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";
    return __webpack_require__(0);
})
([function (module, exports, __webpack_require__) {
    module.exports = __webpack_require__(1);
}, function (module, exports, __webpack_require__) {
    var Generator = __webpack_require__(2);
    var Masker = Generator.generate(function Masker(masks, filter) {
        var _ = this;
        _.masks = [];
        for (var i = 0; i < masks.length; i++) {
            _.masks.push({length: masks[i].replace(/[^_]/g, '').length, mask: masks[i]});
        }
        _._filter = filter;
        _.masks.sort(function (a, b) {
            return a - b;
        });
        _.focusListener = _._focusListener();
        _.blurListener = _._blurListener();
        _.keydownListener = _._keydownListener();
    });
    Masker.definePrototype({
        mask: function mask(val, selectionStart, selectionEnd, maskBlank) {
            var _ = this;
            var rule = _.unmask(val, selectionStart, selectionEnd);
            val = rule.text;
            selectionStart = rule.selectionStart;
            selectionEnd = rule.selectionEnd;
            var s = selectionStart;
            var e = selectionEnd;
            if (!maskBlank && !val.length) {
                return {text: '', selectionStart: selectionStart};
            }
            var mask = _.getMask(val.length);
            var text = '';
            for (var i = 0, j = 0; j <= val.length && i < mask.length; i++) {
                var mText = mask[i];
                var tText = val[j];
                if (mText === '_' && j < val.length) {
                    text += tText;
                    j++;
                } else if (mText !== '_' && j <= val.length) {
                    text += mText;
                    if (j <= s) {
                        selectionStart++;
                    }
                    if (j <= e) {
                        selectionEnd++;
                    }
                } else {
                    break;
                }
            }
            return {
                text: text,
                selectionStart: selectionStart,
                selectionEnd: selectionEnd,
                selectionDirection: selectionStart <= selectionEnd ? 'forward' : 'backward'
            };
        }, unmask: function unmask(val, selectionStart, selectionEnd) {
            var _ = this;
            var text = '';
            var s = selectionStart;
            var e = selectionEnd;
            for (var i = 0; i < val.length; i++) {
                if (_.filter(val[i])) {
                    text += val[i];
                } else {
                    if (i < s) {
                        selectionStart--;
                    }
                    if (i < e) {
                        selectionEnd--;
                    }
                }
            }
            return {
                text: text,
                selectionStart: selectionStart,
                selectionEnd: selectionEnd,
                selectionDirection: selectionStart <= selectionEnd ? 'forward' : 'backward'
            };
        }, filter: function filter(ch) {
            var _ = this;
            if (typeof _._filter === 'function') {
                return _._filter(ch);
            } else if (_._filter instanceof RegExp) {
                return _._filter.test(ch);
            }
            return true;
        }, getMask: function getMask(length) {
            var _ = this;
            for (var i = 0; i < _.masks.length; i++) {
                if (_.masks[i].length >= length) {
                    return _.masks[i].mask;
                }
            }
            return _.masks[_.masks.length - 1].mask;
        }, _keydownListener: function _keydownListener() {
            var masker = this;
            return function EVENTS_KEYDOWN(evt) {
                var keyCode = evt.keyCode || evt.which;
                var el = evt.target, rule;
                var start = el.selectionStart, end = el.selectionEnd, val = el.value;
                if (keyCode === 8) {
                    evt.preventDefault();
                    
                    console.log('key 8');
                    rule = masker.unmask(val, start, end);
                    start = rule.selectionStart;
                    end = rule.selectionEnd;
                    val = rule.text;
                    if (start === end) {
                        start = Math.max(start - 1, 0);
                        end = Math.max(end, start);
                    }
                    val = val.slice(0, start) + val.slice(end);
                    end = start;
                    evt.preventDefault();
                } else if (isDigitKeyCode(keyCode)) {
                    evt.preventDefault();
                    console.log('main code');
                    rule = masker.unmask(val, start, end);
                    if (rule.text.length < masker.masks[masker.masks.length - 1].length || rule.selectionStart !== rule.selectionEnd) {
                        start = rule.selectionStart;
                        end = rule.selectionEnd;
                        val = rule.text;
                        start = Math.max(start, 0);
                        end = Math.max(end, start);
                        val = val.slice(0, start) +
                            evt.key +
                            val.slice(end);
                        start = Math.min(start + 1, val.length);
                        end = start;
                    }
                    
                } else if (keyCode === 38 || (evt.metaKey && keyCode === 37)) {
                    console.log('key 38 or 37');
                    if (evt.shiftKey) {
                        return;
                    }
                    start = 0;
                    end = start;
                    evt.preventDefault();
                } else if (keyCode === 40 || (evt.metaKey && keyCode === 39)) {
                    console.log('key 40 39');
                    if (evt.shiftKey) {
                        return;
                    }
                    start = val.length;
                    end = start;
                    evt.preventDefault();
                } else if (keyCode === 37) {
                    console.log('key 37');
                    if (evt.shiftKey) {
                        return;
                    }
                    rule = masker.unmask(val, start, end);
                    start = rule.selectionStart;
                    end = rule.selectionEnd;
                    val = rule.text;
                    if (start === end) {
                        start = Math.max(start - 1, 0);
                        end = start;
                    } else {
                        start = Math.max(0, Math.min(start, end));
                        end = start;
                    }
                    evt.preventDefault();
                } else if (keyCode === 39) {
                    console.log('key 39');
                    if (evt.shiftKey) {
                        return;
                    }
                    rule = masker.unmask(val, start, end);
                    start = rule.selectionStart;
                    end = rule.selectionEnd;
                    val = rule.text;
                    if (start === end) {
                        start = Math.min(start + 1, val.length);
                        end = start;
                    } else {
                        start = Math.min(val.length, Math.max(start, end));
                        end = start;
                    }
                    evt.preventDefault();
                } 
                
                else if (evt.metaKey || evt.ctrlKey || keyCode === 9 || keyCode === 13) {
                    console.log('key enter');
                    return true;
                }
                 else {
                     evt.preventDefault();
                     return;
                }
                rule = masker.mask(val, start, end, true);
                el.value = rule.text;

                // safari fix
                el.style.display = 'none';
                el.style.display = 'initial';

                el.setSelectionRange(rule.selectionStart, rule.selectionEnd, rule.selectionDirection);
            };
        }, _blurListener: function _blurListener() {
            var masker = this;
            return function EVENTS_BLUR(evt) {
                var el = evt.target;
                var rule = masker.mask(el.value, el.selectionStart, el.selectionEnd);
                el.value = rule.text;
                el.setSelectionRange(rule.selectionStart, rule.selectionEnd);
            };
        }, _focusListener: function _focusListener() {
            var masker = this;
            return function EVENTS_FOCUS(evt) {
                var el = evt.target;
                var rule = masker.mask(el.value, el.selectionStart, el.selectionEnd, true);
                el.value = rule.text;
                el.setSelectionRange(rule.selectionStart, rule.selectionEnd);
            };
        }, bind: function bind(el) {
            var _ = this;
            el.addEventListener('focus', _.focusListener, false);
            // el.addEventListener('blur', _.blurListener, false);
            el.addEventListener('keypress', _.keydownListener, false);
        }, unbind: function unbind(el) {
            var _ = this;
            el.removeEventListener('focus', _.focusListener, false);
            el.removeEventListener('blur', _.blurListener, false);
            el.removeEventListener('keydown', _.keydownListener, false);
        }
    });
    module.exports = Masker;
}, function (module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function GeneratorScope() {
        function assertError(condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        }

        function assertTypeError(test, type) {
            if (typeof test !== type) {
                throw new TypeError('Expected \'' + type +
                    '\' but instead found \'' +
                    typeof test + '\'');
            }
        }

        function getFunctionName(func) {
            if (func.name !== void(0)) {
                return func.name;
            }
            var funcNameMatch = func.toString().match(/function\s*([^\s]*)\s*\(/);
            func.name = (funcNameMatch && funcNameMatch[1]) || '';
            return func.name;
        }

        function isGetSet(obj) {
            var keys, length;
            if (obj && typeof obj === 'object') {
                keys = Object.getOwnPropertyNames(obj).sort();
                length = keys.length;
                if ((length === 1 && (keys[0] === 'get' && typeof obj.get === 'function' || keys[0] === 'set' && typeof obj.set === 'function')) || (length === 2 && (keys[0] === 'get' && typeof obj.get === 'function' && keys[1] === 'set' && typeof obj.set === 'function'))) {
                    return true;
                }
            }
            return false;
        }

        function defineObjectProperties(obj, descriptor, properties) {
            var setProperties = {}, i, keys, length, p = properties || descriptor, d = properties && descriptor;
            properties = (p && typeof p === 'object') ? p : {};
            descriptor = (d && typeof d === 'object') ? d : {};
            keys = Object.getOwnPropertyNames(properties);
            length = keys.length;
            for (i = 0; i < length; i++) {
                if (isGetSet(properties[keys[i]])) {
                    setProperties[keys[i]] = {
                        configurable: !!descriptor.configurable,
                        enumerable: !!descriptor.enumerable,
                        get: properties[keys[i]].get,
                        set: properties[keys[i]].set
                    };
                } else {
                    setProperties[keys[i]] = {
                        configurable: !!descriptor.configurable,
                        enumerable: !!descriptor.enumerable,
                        writable: !!descriptor.writable,
                        value: properties[keys[i]]
                    };
                }
            }
            Object.defineProperties(obj, setProperties);
            return obj;
        }

        var Creation = {
            defineProperties: function defineProperties(descriptor, properties) {
                defineObjectProperties(this, descriptor, properties);
                return this;
            }, getProto: function getProto() {
                return Object.getPrototypeOf(this);
            }, getSuper: function getSuper() {
                return Object.getPrototypeOf(this.constructor.prototype);
            }
        };
        var Generation = {
            isGeneration: function isGeneration(generator) {
                assertTypeError(generator, 'function');
                var _ = this;
                return _.prototype.isPrototypeOf(generator.prototype);
            }, isCreation: function isCreation(object) {
                var _ = this;
                return object instanceof _;
            }, generate: function generate(construct) {
                assertTypeError(construct, 'function');
                var _ = this;
                defineObjectProperties(construct, {
                    configurable: false,
                    enumerable: false,
                    writable: false
                }, {prototype: Object.create(_.prototype)});
                defineObjectProperties(construct, {
                    configurable: false,
                    enumerable: false,
                    writable: false
                }, Generation);
                defineObjectProperties(construct.prototype, {
                    configurable: false,
                    enumerable: false,
                    writable: false
                }, {constructor: construct, generator: construct,});
                return construct;
            }, definePrototype: function definePrototype(descriptor, properties) {
                defineObjectProperties(this.prototype, descriptor, properties);
                return this;
            }
        };

        function Generator() {
        }

        defineObjectProperties(Generator, {
            configurable: false,
            enumerable: false,
            writable: false
        }, {prototype: Generator.prototype});
        defineObjectProperties(Generator.prototype, {
            configurable: false,
            enumerable: false,
            writable: false
        }, Creation);
        defineObjectProperties(Generator, {configurable: false, enumerable: false, writable: false}, Generation);
        defineObjectProperties(Generator, {
            configurable: false,
            enumerable: false,
            writable: false
        }, {
            isGenerator: function isGenerator(generator) {
                return this.isGeneration(generator);
            }, toGenerator: function toGenerator(extendFrom, create) {
                console.warn('Generator.toGenerator is depreciated please use Generator.generateFrom');
                return this.generateFrom(extendFrom, create);
            }, generateFrom: function generateFrom(extendFrom, create) {
                assertTypeError(extendFrom, 'function');
                assertTypeError(create, 'function');
                defineObjectProperties(create, {
                    configurable: false,
                    enumerable: false,
                    writable: false
                }, {prototype: Object.create(extendFrom.prototype),});
                defineObjectProperties(create, {configurable: false, enumerable: false, writable: false}, Generation);
                defineObjectProperties(create.prototype, {
                    configurable: false,
                    enumerable: false,
                    writable: false
                }, {constructor: create, generator: create,});
                defineObjectProperties(create.prototype, {
                    configurable: false,
                    enumerable: false,
                    writable: false
                }, Creation);
                return create;
            }
        });
        Object.freeze(Generator);
        Object.freeze(Generator.prototype);
        if (true) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
                return Generator;
            }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else if (typeof module === 'object' && typeof exports === 'object') {
            module.exports = Generator;
        } else {
            window.Generator = Generator;
        }
    }());
}]);