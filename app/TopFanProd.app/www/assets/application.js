/* Zepto v1.1.2 - zepto event detect fx ajax form touch - zeptojs.com/license */



var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = (text === undefined) ? '' : ''+text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0];
        if(element) computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var $$ = $.zepto.qsa, _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE ([\d.]+)/),
      safari = webkit && ua.match(/Mobile\//) && !chrome,
      webview = ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/) && !chrome,
      ie = ua.match(/MSIE\s([\d.]+)/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (ua.match(/Safari/) || !!os.ios)) browser.safari = true
    if (webview) browser.webview = true
    if (ie) browser.ie = true, browser.version = ie[1]

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/=\?/, '=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data)
    return {
      url:      url,
      data:     hasData  ? data : undefined,
      success:  !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData  ? dataType || success : success
    }
  }

  $.get = function(url, data, success, dataType){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(url, data, success, dataType){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(url, data, success){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(window)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)
;
//     Zepto.js
//     (c) 2010-2013 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var document = window.document, docElem = document.documentElement,
    origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = { opacity: opacity }
    if (scale) {
      props.scale = scale
      el.css($.fx.cssPrefix + 'transform-origin', '0 0')
    }
    return el.animate(props, speed, null, callback)
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function(){
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.show = function(speed, callback) {
    origShow.call(this)
    if (speed === undefined) speed = 0
    else this.css('opacity', 0)
    return anim(this, speed, 1, '1,1', callback)
  }

  $.fn.hide = function(speed, callback) {
    if (speed === undefined) return origHide.call(this)
    else return hide(this, speed, '0,0', callback)
  }

  $.fn.toggle = function(speed, callback) {
    if (speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this, speed)
    else return this.each(function(){
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    })
  }

  $.fn.fadeTo = function(speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback)
  }

  $.fn.fadeIn = function(speed, callback) {
    var target = this.css('opacity')
    if (target > 0) this.css('opacity', 0)
    else target = 1
    return origShow.call(this).fadeTo(speed, target, callback)
  }

  $.fn.fadeOut = function(speed, callback) {
    return hide(this, speed, null, callback)
  }

  $.fn.fadeToggle = function(speed, callback) {
    return this.each(function(){
      var el = $(this)
      el[
        (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
      ](speed, callback)
    })
  }

})(Zepto)
;
// moment.js
// version : 2.1.0
// author : Tim Wood
// license : MIT
// momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.1.0",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        // preliminary iso regex
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            w : 'week',
            M : 'month',
            y : 'year'
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return this.weekYear();
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return this.isoWeekYear();
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return ~~(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(~~(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(10 * a / 6), 4);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            }
        };

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var years = duration.years || duration.year || duration.y || 0,
            months = duration.months || duration.month || duration.M || 0,
            weeks = duration.weeks || duration.week || duration.w || 0,
            days = duration.days || duration.day || duration.d || 0,
            hours = duration.hours || duration.hour || duration.h || 0,
            minutes = duration.minutes || duration.minute || duration.m || 0,
            seconds = duration.seconds || duration.second || duration.s || 0,
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

        // store reference to input for deterministic cloning
        this._input = duration;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;

        this._data = {};

        this._bubble();
    }


    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months,
            minutes,
            hours,
            currentDate;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        // store the minutes and hours so we can restore them
        if (days || months) {
            minutes = mom.minute();
            hours = mom.hour();
        }
        if (days) {
            mom.date(mom.date() + days * isAdding);
        }
        if (months) {
            mom.month(mom.month() + months * isAdding);
        }
        if (milliseconds && !ignoreUpdateOffset) {
            moment.updateOffset(mom);
        }
        // restore the minutes and hours after possibly changing dst
        if (days || months) {
            mom.minute(minutes);
            mom.hour(hours);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        return units ? unitAliases[units] || units.toLowerCase().replace(/(.)s$/, '$1') : units;
    }


    /************************************
        Languages
    ************************************/


    Language.prototype = {
        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            return ((input + '').toLowerCase()[0] === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },
        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    };

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        if (!key) {
            return moment.fn._lang;
        }
        if (!languages[key] && hasModule) {
            try {
                require('./lang/' + key);
            } catch (e) {
                // call with no params to set to default
                return moment.fn._lang;
            }
        }
        return languages[key];
    }


    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[.*\]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return m.lang().longDateFormat(input) || input;
        }

        while (i-- && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'YYYYY':
            return parseTokenSixDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return getLangDefinition(config._l)._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    function timezoneMinutesFromString(string) {
        var tzchunk = (parseTokenTimezone.exec(string) || [])[0],
            parts = (tzchunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + ~~parts[2];

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[1] = a;
            } else {
                config._isValid = false;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
            break;
        case 'YYYY' :
        case 'YYYYY' :
            datePartArray[0] = ~~input;
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        }

        // if the input is null, the date is not valid
        if (input == null) {
            config._isValid = false;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(config) {
        var i, date, input = [];

        if (config._d) {
            return;
        }

        for (i = 0; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[3] += ~~((config._tzm || 0) / 60);
        input[4] += ~~((config._tzm || 0) % 60);

        date = new Date(0);

        if (config._useUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }

        config._d = date;
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var tokens = config._f.match(formattingTokens),
            string = config._i,
            i, parsedInput;

        config._a = [];

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i], config).exec(string) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            }
            // don't parse if its not a known token
            if (formatTokenFunctions[tokens[i]]) {
                addTimeToArrayFromToken(tokens[i], parsedInput, config);
            }
        }

        // add remaining unparsed input to the string
        if (string) {
            config._il = string;
        }

        // handle am pm
        if (config._isPm && config._a[3] < 12) {
            config._a[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[3] === 12) {
            config._a[3] = 0;
        }
        // return
        dateFromArray(config);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            tempMoment,
            bestMoment,

            scoreToBeat = 99,
            i,
            currentScore;

        for (i = 0; i < config._f.length; i++) {
            tempConfig = extend({}, config);
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);
            tempMoment = new Moment(tempConfig);

            currentScore = compareArrays(tempConfig._a, tempMoment.toArray());

            // if there is any input that was not parsed
            // add a penalty for that format
            if (tempMoment._il) {
                currentScore += tempMoment._il.length;
            }

            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempMoment;
            }
        }

        extend(config, bestMoment);
    }

    // date from iso format
    function makeDateFromString(config) {
        var i,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            // match[2] should be "T" or undefined
            config._f = 'YYYY-MM-DD' + (match[2] || " ");
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (parseTokenTimezone.exec(string)) {
                config._f += " Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._d = new Date(string);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromArray(config);
        } else {
            config._d = input instanceof Date ? new Date(+input) : new Date(input);
        }
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }


    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null || input === '') {
            return null;
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = extend({}, input);
            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang) {
        return makeMoment({
            _i : input,
            _f : format,
            _l : lang,
            _isUTC : false
        });
    };

    // creating with utc
    moment.utc = function (input, format, lang) {
        return makeMoment({
            _useUTC : true,
            _isUTC : true,
            _l : lang,
            _i : input,
            _f : format
        });
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._input : (isNumber ? {} : input)),
            matched = aspNetTimeSpanJsonRegex.exec(input),
            sign,
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (matched) {
            sign = (matched[1] === "-") ? -1 : 1;
            duration = {
                y: 0,
                d: ~~matched[2] * sign,
                h: ~~matched[3] * sign,
                m: ~~matched[4] * sign,
                s: ~~matched[5] * sign,
                ms: ~~matched[6] * sign
            };
        }

        ret = new Duration(duration);

        if (isDuration && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(key, values);
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            if (this._isValid == null) {
                if (this._a) {
                    this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
                } else {
                    this._isValid = !isNaN(this._d.getTime());
                }
            }
            return !!this._isValid;
        },

        utc : function () {
            return this.zone(0);
        },

        local : function () {
            this.zone(0);
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().startOf('day'), 'days', true),
                format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                if (typeof input === 'string') {
                    input = this.lang().weekdaysParse(input);
                    if (typeof input !== 'number') {
                        return this;
                    }
                }
                return this.add({ d : input - day });
            } else {
                return day;
            }
        },

        month : function (input) {
            var utc = this._isUTC ? 'UTC' : '',
                dayOfMonth,
                daysInMonth;

            if (input != null) {
                if (typeof input === 'string') {
                    input = this.lang().monthsParse(input);
                    if (typeof input !== 'number') {
                        return this;
                    }
                }

                dayOfMonth = this.date();
                this.date(1);
                this._d['set' + utc + 'Month'](input);
                this.date(Math.min(dayOfMonth, this.daysInMonth()));

                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + 'Month']();
            }
        },

        startOf: function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            }

            return this;
        },

        endOf: function (units) {
            return this.startOf(units).add(units, 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) === +moment(input).startOf(units);
        },

        min: function (other) {
            other = moment.apply(null, arguments);
            return other < this ? this : other;
        },

        max: function (other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },

        zone : function (input) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? "UTC" : "";
        },

        zoneName : function () {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", (input - year));
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", (input - year));
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        weekday : function (input) {
            var weekday = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + 's'] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);
            data.days = days % 30;

            months += absRound(days / 30);
            data.months = months % 12;

            years = absRound(months / 12);
            data.years = years;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              ~~(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            units = normalizeUnits(units);
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function () {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });


    /************************************
        Exposing Moment
    ************************************/


    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['moment'] = moment;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
}).call(this);
//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
/*
Copyright (c) 2008 Fred Palmer fred.palmer_at_gmail.com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

function StringBuffer()
{
    this.buffer = [];
}

StringBuffer.prototype.append = function append(string)
{
    this.buffer.push(string);
    return this;
};

StringBuffer.prototype.toString = function toString()
{
    return this.buffer.join("");
};

var Base64 =
{
    codex : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    encode : function (input)
    {
        var output = new StringBuffer();

        var enumerator = new Utf8EncodeEnumerator(input);
        while (enumerator.moveNext())
        {
            var chr1 = enumerator.current;

            enumerator.moveNext();
            var chr2 = enumerator.current;

            enumerator.moveNext();
            var chr3 = enumerator.current;

            var enc1 = chr1 >> 2;
            var enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            var enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            var enc4 = chr3 & 63;

            if (isNaN(chr2))
            {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3))
            {
                enc4 = 64;
            }

            output.append(this.codex.charAt(enc1) + this.codex.charAt(enc2) + this.codex.charAt(enc3) + this.codex.charAt(enc4));
        }

        return output.toString();
    },

    decode : function (input)
    {
        var output = new StringBuffer();

        var enumerator = new Base64DecodeEnumerator(input);
        while (enumerator.moveNext())
        {
            var charCode = enumerator.current;

            if (charCode < 128)
                output.append(String.fromCharCode(charCode));
            else if ((charCode > 191) && (charCode < 224))
            {
                enumerator.moveNext();
                var charCode2 = enumerator.current;

                output.append(String.fromCharCode(((charCode & 31) << 6) | (charCode2 & 63)));
            }
            else
            {
                enumerator.moveNext();
                var charCode2 = enumerator.current;

                enumerator.moveNext();
                var charCode3 = enumerator.current;

                output.append(String.fromCharCode(((charCode & 15) << 12) | ((charCode2 & 63) << 6) | (charCode3 & 63)));
            }
        }

        return output.toString();
    }
}


function Utf8EncodeEnumerator(input)
{
    this._input = input;
    this._index = -1;
    this._buffer = [];
}

Utf8EncodeEnumerator.prototype =
{
    current: Number.NaN,

    moveNext: function()
    {
        if (this._buffer.length > 0)
        {
            this.current = this._buffer.shift();
            return true;
        }
        else if (this._index >= (this._input.length - 1))
        {
            this.current = Number.NaN;
            return false;
        }
        else
        {
            var charCode = this._input.charCodeAt(++this._index);

            // "\r\n" -> "\n"
            //
            if ((charCode == 13) && (this._input.charCodeAt(this._index + 1) == 10))
            {
                charCode = 10;
                this._index += 2;
            }

            if (charCode < 128)
            {
                this.current = charCode;
            }
            else if ((charCode > 127) && (charCode < 2048))
            {
                this.current = (charCode >> 6) | 192;
                this._buffer.push((charCode & 63) | 128);
            }
            else
            {
                this.current = (charCode >> 12) | 224;
                this._buffer.push(((charCode >> 6) & 63) | 128);
                this._buffer.push((charCode & 63) | 128);
            }

            return true;
        }
    }
}

function Base64DecodeEnumerator(input)
{
    this._input = input;
    this._index = -1;
    this._buffer = [];
}

Base64DecodeEnumerator.prototype =
{
    current: 64,

    moveNext: function()
    {
        if (this._buffer.length > 0)
        {
            this.current = this._buffer.shift();
            return true;
        }
        else if (this._index >= (this._input.length - 1))
        {
            this.current = 64;
            return false;
        }
        else
        {
            var enc1 = Base64.codex.indexOf(this._input.charAt(++this._index));
            var enc2 = Base64.codex.indexOf(this._input.charAt(++this._index));
            var enc3 = Base64.codex.indexOf(this._input.charAt(++this._index));
            var enc4 = Base64.codex.indexOf(this._input.charAt(++this._index));

            var chr1 = (enc1 << 2) | (enc2 >> 4);
            var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            var chr3 = ((enc3 & 3) << 6) | enc4;

            this.current = chr1;

            if (enc3 != 64)
                this._buffer.push(chr2);

            if (enc4 != 64)
                this._buffer.push(chr3);

            return true;
        }
    }
};
/*!
 * LiquidMetal
 * Copyright (c) 2009, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */

var LiquidMetal=function(){var l=0.0;var m=1.0;var n=0.8;var o=0.9;var p=0.85;return{score:function(a,b){if(b.length==0)return n;if(b.length>a.length)return l;var c=this.buildScoreArray(a,b);var d=0.0;for(var i=0;i<c.length;i++){d+=c[i]}return(d/c.length)},buildScoreArray:function(a,b){var d=new Array(a.length);var e=a.toLowerCase();var f=b.toLowerCase().split("");var g=-1;var h=false;for(var i=0;i<f.length;i++){var c=f[i];var j=e.indexOf(c,g+1);if(j<0)return fillArray(d,l);if(j==0)h=true;if(isNewWord(a,j)){d[j-1]=1;fillArray(d,p,g+1,j-1)}else if(isUpperCase(a,j)){fillArray(d,p,g+1,j)}else{fillArray(d,l,g+1,j)}d[j]=m;g=j}var k=h?o:n;fillArray(d,k,g+1);return d}};function isUpperCase(a,b){var c=a.charAt(b);return("A"<=c&&c<="Z")}function isNewWord(a,b){var c=a.charAt(b-1);return(c==" "||c=="\t")}function fillArray(a,b,c,d){c=Math.max(c||0,0);d=Math.min(d||a.length,a.length);for(var i=c;i<d;i++){a[i]=b}return a}}();

(function() {
  var $, Controller, Events, Log, Model, Module, Spine, isArray, isBlank, makeArray, moduleKeywords,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Events = {
    bind: function(ev, callback) {
      var calls, evs, name, _i, _len;
      evs = ev.split(' ');
      calls = this.hasOwnProperty('_callbacks') && this._callbacks || (this._callbacks = {});
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        calls[name] || (calls[name] = []);
        calls[name].push(callback);
      }
      return this;
    },
    one: function(ev, callback) {
      return this.bind(ev, function() {
        this.unbind(ev, arguments.callee);
        return callback.apply(this, arguments);
      });
    },
    trigger: function() {
      var args, callback, ev, list, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ev = args.shift();
      list = this.hasOwnProperty('_callbacks') && ((_ref = this._callbacks) != null ? _ref[ev] : void 0);
      if (!list) {
        return;
      }
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        callback = list[_i];
        if (callback.apply(this, args) === false) {
          break;
        }
      }
      return true;
    },
    unbind: function(ev, callback) {
      var cb, i, list, _i, _len, _ref;
      if (!ev) {
        this._callbacks = {};
        return this;
      }
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) {
        return this;
      }
      if (!callback) {
        delete this._callbacks[ev];
        return this;
      }
      for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
        cb = list[i];
        if (!(cb === callback)) {
          continue;
        }
        list = list.slice();
        list.splice(i, 1);
        this._callbacks[ev] = list;
        break;
      }
      return this;
    }
  };

  Log = {
    trace: true,
    logPrefix: null,
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (this.logPrefix) {
        args.unshift(this.logPrefix);
      }
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.log === "function") {
          console.log.apply(console, args);
        }
      }
      return this;
    }
  };

  moduleKeywords = ['included', 'extended'];

  Module = (function() {

    Module.include = function(obj) {
      var key, value, _ref;
      if (!obj) {
        throw 'include(obj) requires obj';
      }
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((_ref = obj.included) != null) {
        _ref.apply(this);
      }
      return this;
    };

    Module.extend = function(obj) {
      var key, value, _ref;
      if (!obj) {
        throw 'extend(obj) requires obj';
      }
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((_ref = obj.extended) != null) {
        _ref.apply(this);
      }
      return this;
    };

    Module.proxy = function(func) {
      var _this = this;
      return function() {
        return func.apply(_this, arguments);
      };
    };

    Module.prototype.proxy = function(func) {
      var _this = this;
      return function() {
        return func.apply(_this, arguments);
      };
    };

    function Module() {
      if (typeof this.init === "function") {
        this.init.apply(this, arguments);
      }
    }

    return Module;

  })();

  Model = (function(_super) {

    __extends(Model, _super);

    Model.extend(Events);

    Model.records = {};

    Model.crecords = {};

    Model.attributes = [];

    Model.configure = function() {
      var attributes, name;
      name = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.className = name;
      this.records = {};
      this.crecords = {};
      if (attributes.length) {
        this.attributes = attributes;
      }
      this.attributes && (this.attributes = makeArray(this.attributes));
      this.attributes || (this.attributes = []);
      this.unbind();
      return this;
    };

    Model.toString = function() {
      return "" + this.className + "(" + (this.attributes.join(", ")) + ")";
    };

    Model.find = function(id) {
      var record;
      record = this.records[id];
      if (!record && ("" + id).match(/c-\d+/)) {
        return this.findCID(id);
      }
      if (!record) {
        throw 'Unknown record';
      }
      return record.clone();
    };

    Model.findCID = function(cid) {
      var record;
      record = this.crecords[cid];
      if (!record) {
        throw 'Unknown record';
      }
      return record.clone();
    };

    Model.exists = function(id) {
      try {
        return this.find(id);
      } catch (e) {
        return false;
      }
    };

    Model.refresh = function(values, options) {
      var record, records, _i, _len;
      if (options == null) {
        options = {};
      }
      if (options.clear) {
        this.records = {};
        this.crecords = {};
      }
      records = this.fromJSON(values);
      if (!isArray(records)) {
        records = [records];
      }
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        record.id || (record.id = record.cid);
        this.records[record.id] = record;
        this.crecords[record.cid] = record;
      }
      this.trigger('refresh', !options.clear && this.cloneArray(records));
      return this;
    };

    Model.select = function(callback) {
      var id, record, result;
      result = (function() {
        var _ref, _results;
        _ref = this.records;
        _results = [];
        for (id in _ref) {
          record = _ref[id];
          if (callback(record)) {
            _results.push(record);
          }
        }
        return _results;
      }).call(this);
      return this.cloneArray(result);
    };

    Model.findByAttribute = function(name, value) {
      var id, record, _ref;
      _ref = this.records;
      for (id in _ref) {
        record = _ref[id];
        if (record[name] === value) {
          return record.clone();
        }
      }
      return null;
    };

    Model.findAllByAttribute = function(name, value) {
      return this.select(function(item) {
        return item[name] === value;
      });
    };

    Model.each = function(callback) {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(callback(value.clone()));
      }
      return _results;
    };

    Model.all = function() {
      return this.cloneArray(this.recordsValues());
    };

    Model.first = function() {
      var record;
      record = this.recordsValues()[0];
      return record != null ? record.clone() : void 0;
    };

    Model.last = function() {
      var record, values;
      values = this.recordsValues();
      record = values[values.length - 1];
      return record != null ? record.clone() : void 0;
    };

    Model.count = function() {
      return this.recordsValues().length;
    };

    Model.deleteAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(delete this.records[key]);
      }
      return _results;
    };

    Model.destroyAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this.records[key].destroy());
      }
      return _results;
    };

    Model.update = function(id, atts, options) {
      return this.find(id).updateAttributes(atts, options);
    };

    Model.create = function(atts, options) {
      var record;
      record = new this(atts);
      return record.save(options);
    };

    Model.destroy = function(id, options) {
      return this.find(id).destroy(options);
    };

    Model.change = function(callbackOrParams) {
      if (typeof callbackOrParams === 'function') {
        return this.bind('change', callbackOrParams);
      } else {
        return this.trigger('change', callbackOrParams);
      }
    };

    Model.fetch = function(callbackOrParams) {
      if (typeof callbackOrParams === 'function') {
        return this.bind('fetch', callbackOrParams);
      } else {
        return this.trigger('fetch', callbackOrParams);
      }
    };

    Model.toJSON = function() {
      return this.recordsValues();
    };

    Model.fromJSON = function(objects) {
      var value, _i, _len, _results;
      if (!objects) {
        return;
      }
      if (typeof objects === 'string') {
        objects = JSON.parse(objects);
      }
      if (isArray(objects)) {
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          value = objects[_i];
          _results.push(new this(value));
        }
        return _results;
      } else {
        return new this(objects);
      }
    };

    Model.fromForm = function() {
      var _ref;
      return (_ref = new this).fromForm.apply(_ref, arguments);
    };

    Model.recordsValues = function() {
      var key, result, value, _ref;
      result = [];
      _ref = this.records;
      for (key in _ref) {
        value = _ref[key];
        result.push(value);
      }
      return result;
    };

    Model.cloneArray = function(array) {
      var value, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        value = array[_i];
        _results.push(value.clone());
      }
      return _results;
    };

    Model.idCounter = 0;

    Model.uid = function() {
      return this.idCounter++;
    };

    function Model(atts) {
      Model.__super__.constructor.apply(this, arguments);
      if (atts) {
        this.load(atts);
      }
      this.cid || (this.cid = 'c-' + this.constructor.uid());
    }

    Model.prototype.isNew = function() {
      return !this.exists();
    };

    Model.prototype.isValid = function() {
      return !this.validate();
    };

    Model.prototype.validate = function() {};

    Model.prototype.load = function(atts) {
      var key, value;
      for (key in atts) {
        value = atts[key];
        if (typeof this[key] === 'function') {
          this[key](value);
        } else {
          this[key] = value;
        }
      }
      return this;
    };

    Model.prototype.attributes = function() {
      var key, result, _i, _len, _ref;
      result = {};
      _ref = this.constructor.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (key in this) {
          if (typeof this[key] === 'function') {
            result[key] = this[key]();
          } else {
            result[key] = this[key];
          }
        }
      }
      if (this.id) {
        result.id = this.id;
      }
      return result;
    };

    Model.prototype.eql = function(rec) {
      return !!(rec && rec.constructor === this.constructor && (rec.cid === this.cid) || (rec.id && rec.id === this.id));
    };

    Model.prototype.save = function(options) {
      var error, record;
      if (options == null) {
        options = {};
      }
      if (options.validate !== false) {
        error = this.validate();
        if (error) {
          this.trigger('error', error);
          return false;
        }
      }
      this.trigger('beforeSave', options);
      record = this.isNew() ? this.create(options) : this.update(options);
      this.trigger('save', options);
      return record;
    };

    Model.prototype.updateAttribute = function(name, value) {
      this[name] = value;
      return this.save();
    };

    Model.prototype.updateAttributes = function(atts, options) {
      this.load(atts);
      return this.save(options);
    };

    Model.prototype.changeID = function(id) {
      var records;
      records = this.constructor.records;
      records[id] = records[this.id];
      delete records[this.id];
      this.id = id;
      return this.save();
    };

    Model.prototype.destroy = function(options) {
      if (options == null) {
        options = {};
      }
      this.trigger('beforeDestroy', options);
      delete this.constructor.records[this.id];
      delete this.constructor.crecords[this.cid];
      this.destroyed = true;
      this.trigger('destroy', options);
      this.trigger('change', 'destroy', options);
      this.unbind();
      return this;
    };

    Model.prototype.dup = function(newRecord) {
      var result;
      result = new this.constructor(this.attributes());
      if (newRecord === false) {
        result.cid = this.cid;
      } else {
        delete result.id;
      }
      return result;
    };

    Model.prototype.clone = function() {
      return Object.create(this);
    };

    Model.prototype.reload = function() {
      var original;
      if (this.isNew()) {
        return this;
      }
      original = this.constructor.find(this.id);
      this.load(original.attributes());
      return original;
    };

    Model.prototype.toJSON = function() {
      return this.attributes();
    };

    Model.prototype.toString = function() {
      return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
    };

    Model.prototype.fromForm = function(form) {
      var key, result, _i, _len, _ref;
      result = {};
      _ref = $(form).serializeArray();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        result[key.name] = key.value;
      }
      return this.load(result);
    };

    Model.prototype.exists = function() {
      return this.id && this.id in this.constructor.records;
    };

    Model.prototype.update = function(options) {
      var clone, records;
      this.trigger('beforeUpdate', options);
      records = this.constructor.records;
      records[this.id].load(this.attributes());
      clone = records[this.id].clone();
      clone.trigger('update', options);
      clone.trigger('change', 'update', options);
      return clone;
    };

    Model.prototype.create = function(options) {
      var clone, record;
      this.trigger('beforeCreate', options);
      if (!this.id) {
        this.id = this.cid;
      }
      record = this.dup(false);
      this.constructor.records[this.id] = record;
      this.constructor.crecords[this.cid] = record;
      clone = record.clone();
      clone.trigger('create', options);
      clone.trigger('change', 'create', options);
      return clone;
    };

    Model.prototype.bind = function(events, callback) {
      var binder, unbinder,
        _this = this;
      this.constructor.bind(events, binder = function(record) {
        if (record && _this.eql(record)) {
          return callback.apply(_this, arguments);
        }
      });
      this.constructor.bind('unbind', unbinder = function(record) {
        if (record && _this.eql(record)) {
          _this.constructor.unbind(events, binder);
          return _this.constructor.unbind('unbind', unbinder);
        }
      });
      return binder;
    };

    Model.prototype.one = function(events, callback) {
      var binder,
        _this = this;
      return binder = this.bind(events, function() {
        _this.constructor.unbind(events, binder);
        return callback.apply(_this);
      });
    };

    Model.prototype.trigger = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.splice(1, 0, this);
      return (_ref = this.constructor).trigger.apply(_ref, args);
    };

    Model.prototype.unbind = function() {
      return this.trigger('unbind');
    };

    return Model;

  })(Module);

  Controller = (function(_super) {

    __extends(Controller, _super);

    Controller.include(Events);

    Controller.include(Log);

    Controller.prototype.eventSplitter = /^(\S+)\s*(.*)$/;

    Controller.prototype.tag = 'div';

    function Controller(options) {
      this.release = __bind(this.release, this);

      var key, value, _ref;
      this.options = options;
      _ref = this.options;
      for (key in _ref) {
        value = _ref[key];
        this[key] = value;
      }
      if (!this.el) {
        this.el = document.createElement(this.tag);
      }
      this.el = $(this.el);
      if (this.className) {
        this.el.addClass(this.className);
      }
      if (this.attributes) {
        this.el.attr(this.attributes);
      }
      this.release(function() {
        return this.el.remove();
      });
      if (!this.events) {
        this.events = this.constructor.events;
      }
      if (!this.elements) {
        this.elements = this.constructor.elements;
      }
      if (this.events) {
        this.delegateEvents(this.events);
      }
      if (this.elements) {
        this.refreshElements();
      }
      Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.release = function(callback) {
      if (typeof callback === 'function') {
        return this.bind('release', callback);
      } else {
        return this.trigger('release');
      }
    };

    Controller.prototype.$ = function(selector) {
      return $(selector, this.el);
    };

    Controller.prototype.delegateEvents = function(events) {
      var eventName, key, match, method, selector, _results;
      _results = [];
      for (key in events) {
        method = events[key];
        if (typeof method !== 'function') {
          method = this.proxy(this[method]);
        }
        match = key.match(this.eventSplitter);
        eventName = match[1];
        selector = match[2];
        if (selector === '') {
          _results.push(this.el.bind(eventName, method));
        } else {
          _results.push(this.el.delegate(selector, eventName, method));
        }
      }
      return _results;
    };

    Controller.prototype.refreshElements = function() {
      var key, value, _ref, _results;
      _ref = this.elements;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this[value] = this.$(key));
      }
      return _results;
    };

    Controller.prototype.delay = function(func, timeout) {
      return setTimeout(this.proxy(func), timeout || 0);
    };

    Controller.prototype.html = function(element) {
      this.el.html(element.el || element);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.append = function() {
      var e, elements, _ref;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          e = elements[_i];
          _results.push(e.el || e);
        }
        return _results;
      })();
      (_ref = this.el).append.apply(_ref, elements);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.appendTo = function(element) {
      this.el.appendTo(element.el || element);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.prepend = function() {
      var e, elements, _ref;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          e = elements[_i];
          _results.push(e.el || e);
        }
        return _results;
      })();
      (_ref = this.el).prepend.apply(_ref, elements);
      this.refreshElements();
      return this.el;
    };

    Controller.prototype.replace = function(element) {
      var previous, _ref;
      _ref = [this.el, $(element.el || element)], previous = _ref[0], this.el = _ref[1];
      previous.replaceWith(this.el);
      this.delegateEvents(this.events);
      this.refreshElements();
      return this.el;
    };

    return Controller;

  })(Module);

  $ = (typeof window !== "undefined" && window !== null ? window.jQuery : void 0) || (typeof window !== "undefined" && window !== null ? window.Zepto : void 0) || function(element) {
    return element;
  };

  if (typeof Object.create !== 'function') {
    Object.create = function(o) {
      var Func;
      Func = function() {};
      Func.prototype = o;
      return new Func();
    };
  }

  isArray = function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };

  isBlank = function(value) {
    var key;
    if (!value) {
      return true;
    }
    for (key in value) {
      return false;
    }
    return true;
  };

  makeArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };

  Spine = this.Spine = {};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine;
  }

  Spine.version = '1.0.6';

  Spine.isArray = isArray;

  Spine.isBlank = isBlank;

  Spine.$ = $;

  Spine.Events = Events;

  Spine.Log = Log;

  Spine.Module = Module;

  Spine.Controller = Controller;

  Spine.Model = Model;

  Module.extend.call(Spine, Events);

  Module.create = Module.sub = Controller.create = Controller.sub = Model.sub = function(instances, statics) {
    var result;
    result = (function(_super) {

      __extends(result, _super);

      function result() {
        return result.__super__.constructor.apply(this, arguments);
      }

      return result;

    })(this);
    if (instances) {
      result.include(instances);
    }
    if (statics) {
      result.extend(statics);
    }
    if (typeof result.unbind === "function") {
      result.unbind();
    }
    return result;
  };

  Model.setup = function(name, attributes) {
    var Instance;
    if (attributes == null) {
      attributes = [];
    }
    Instance = (function(_super) {

      __extends(Instance, _super);

      function Instance() {
        return Instance.__super__.constructor.apply(this, arguments);
      }

      return Instance;

    })(this);
    Instance.configure.apply(Instance, [name].concat(__slice.call(attributes)));
    return Instance;
  };

  Module.init = Controller.init = Model.init = function(a1, a2, a3, a4, a5) {
    return new this(a1, a2, a3, a4, a5);
  };

  Spine.Class = Module;

}).call(this);
(function() {
  var $, Spine, escapeRegExp, hashStrip, namedParam, splatParam,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Spine = this.Spine || require('spine');

  $ = Spine.$;

  hashStrip = /^#*/;

  namedParam = /:([\w\d]+)/g;

  splatParam = /\*([\w\d]+)/g;

  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

  Spine.Route = (function(_super) {
    var _ref;

    __extends(Route, _super);

    Route.extend(Spine.Events);

    Route.historySupport = ((_ref = window.history) != null ? _ref.pushState : void 0) != null;

    Route.routes = [];

    Route.options = {
      trigger: true,
      history: false,
      shim: false
    };

    Route.add = function(path, callback) {
      var key, value, _results;
      if (typeof path === 'object' && !(path instanceof RegExp)) {
        _results = [];
        for (key in path) {
          value = path[key];
          _results.push(this.add(key, value));
        }
        return _results;
      } else {
        return this.routes.push(new this(path, callback));
      }
    };

    Route.setup = function(options) {
      if (options == null) {
        options = {};
      }
      this.options = $.extend({}, this.options, options);
      if (this.options.history) {
        this.history = this.historySupport && this.options.history;
      }
      if (this.options.shim) {
        return;
      }
      if (this.history) {
        $(window).bind('popstate', this.change);
      } else {
        $(window).bind('hashchange', this.change);
      }
      return this.change();
    };

    Route.unbind = function() {
      if (this.history) {
        return $(window).unbind('popstate', this.change);
      } else {
        return $(window).unbind('hashchange', this.change);
      }
    };

    Route.navigate = function() {
      var args, lastArg, options, path;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = {};
      lastArg = args[args.length - 1];
      if (typeof lastArg === 'object') {
        options = args.pop();
      } else if (typeof lastArg === 'boolean') {
        options.trigger = args.pop();
      }
      options = $.extend({}, this.options, options);
      path = args.join('/');
      if (this.path === path) {
        return;
      }
      this.path = path;
      this.trigger('navigate', this.path);
      if (options.trigger) {
        this.matchRoute(this.path, options);
      }
      if (options.shim) {
        return;
      }
      if (this.history) {
        return history.pushState({}, document.title, this.path);
      } else {
        return window.location.hash = this.path;
      }
    };

    Route.getPath = function() {
      var path;
      path = window.location.pathname;
      if (path.substr(0, 1) !== '/') {
        path = '/' + path;
      }
      return path;
    };

    Route.getHash = function() {
      return window.location.hash;
    };

    Route.getFragment = function() {
      return this.getHash().replace(hashStrip, '');
    };

    Route.getHost = function() {
      return (document.location + '').replace(this.getPath() + this.getHash(), '');
    };

    Route.change = function() {
      var path;
      path = this.getFragment() !== '' ? this.getFragment() : this.getPath();
      if (path === this.path) {
        return;
      }
      this.path = path;
      return this.matchRoute(this.path);
    };

    Route.matchRoute = function(path, options) {
      var route, _i, _len, _ref1;
      _ref1 = this.routes;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        route = _ref1[_i];
        if (route.match(path, options)) {
          this.trigger('change', route, path);
          return route;
        }
      }
    };

    function Route(path, callback) {
      var match;
      this.path = path;
      this.callback = callback;
      this.names = [];
      if (typeof path === 'string') {
        namedParam.lastIndex = 0;
        while ((match = namedParam.exec(path)) !== null) {
          this.names.push(match[1]);
        }
        path = path.replace(escapeRegExp, '\\$&').replace(namedParam, '([^\/]*)').replace(splatParam, '(.*?)');
        this.route = new RegExp('^' + path + '$');
      } else {
        this.route = path;
      }
    }

    Route.prototype.match = function(path, options) {
      var i, match, param, params, _i, _len;
      if (options == null) {
        options = {};
      }
      match = this.route.exec(path);
      if (!match) {
        return false;
      }
      options.match = match;
      params = match.slice(1);
      if (this.names.length) {
        for (i = _i = 0, _len = params.length; _i < _len; i = ++_i) {
          param = params[i];
          options[this.names[i]] = param;
        }
      }
      return this.callback.call(null, options) !== false;
    };

    return Route;

  })(Spine.Module);

  Spine.Route.change = Spine.Route.proxy(Spine.Route.change);

  Spine.Controller.include({
    route: function(path, callback) {
      return Spine.Route.add(path, this.proxy(callback));
    },
    routes: function(routes) {
      var key, value, _results;
      _results = [];
      for (key in routes) {
        value = routes[key];
        _results.push(this.route(key, value));
      }
      return _results;
    },
    navigate: function() {
      return Spine.Route.navigate.apply(Spine.Route, arguments);
    }
  });

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Route;
  }

}).call(this);
(function() {
  var $, Spine,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Spine = this.Spine || require('spine');

  $ = Spine.$;

  Spine.Manager = (function(_super) {

    __extends(Manager, _super);

    Manager.include(Spine.Events);

    function Manager() {
      this.controllers = [];
      this.bind('change', this.change);
      this.add.apply(this, arguments);
    }

    Manager.prototype.add = function() {
      var cont, controllers, _i, _len, _results;
      controllers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = controllers.length; _i < _len; _i++) {
        cont = controllers[_i];
        _results.push(this.addOne(cont));
      }
      return _results;
    };

    Manager.prototype.addOne = function(controller) {
      var _this = this;
      controller.bind('active', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.trigger.apply(_this, ['change', controller].concat(__slice.call(args)));
      });
      controller.bind('release', function() {
        return _this.controllers.splice(_this.controllers.indexOf(controller), 1);
      });
      return this.controllers.push(controller);
    };

    Manager.prototype.deactivate = function() {
      return this.trigger.apply(this, ['change', false].concat(__slice.call(arguments)));
    };

    Manager.prototype.change = function() {
      var args, cont, current, _i, _len, _ref, _results;
      current = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this.controllers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cont = _ref[_i];
        if (cont === current) {
          _results.push(cont.activate.apply(cont, args));
        } else {
          _results.push(cont.deactivate.apply(cont, args));
        }
      }
      return _results;
    };

    return Manager;

  })(Spine.Module);

  Spine.Controller.include({
    active: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof args[0] === 'function') {
        this.bind('active', args[0]);
      } else {
        args.unshift('active');
        this.trigger.apply(this, args);
      }
      return this;
    },
    isActive: function() {
      return this.el.hasClass('active');
    },
    activate: function() {
      this.el.addClass('active');
      return this;
    },
    deactivate: function() {
      this.el.removeClass('active');
      return this;
    }
  });

  Spine.Stack = (function(_super) {

    __extends(Stack, _super);

    Stack.prototype.controllers = {};

    Stack.prototype.routes = {};

    Stack.prototype.className = 'spine stack';

    function Stack() {
      var key, value, _fn, _ref, _ref1,
        _this = this;
      Stack.__super__.constructor.apply(this, arguments);
      this.manager = new Spine.Manager;
      this.manager.bind('change', function() {
        var args, controller;
        controller = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (controller) {
          return _this.active.apply(_this, args);
        }
      });
      _ref = this.controllers;
      for (key in _ref) {
        value = _ref[key];
        this[key] = new value({
          stack: this
        });
        this.add(this[key]);
      }
      _ref1 = this.routes;
      _fn = function(key, value) {
        var callback;
        if (typeof value === 'function') {
          callback = value;
        }
        callback || (callback = function() {
          var _ref2;
          return (_ref2 = _this[value]).active.apply(_ref2, arguments);
        });
        return _this.route(key, callback);
      };
      for (key in _ref1) {
        value = _ref1[key];
        _fn(key, value);
      }
      if (this["default"]) {
        this[this["default"]].active();
      }
    }

    Stack.prototype.add = function(controller) {
      this.manager.add(controller);
      return this.append(controller);
    };

    return Stack;

  })(Spine.Controller);

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Manager;
  }

}).call(this);
(function() {
  var Collection, Instance, Singleton, Spine, isArray, require, singularize, underscore,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Spine = this.Spine || require('spine');

  isArray = Spine.isArray;

  require = this.require || (function(value) {
    return eval(value);
  });

  Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Collection.prototype.all = function() {
      var _this = this;
      return this.model.select(function(rec) {
        return _this.associated(rec);
      });
    };

    Collection.prototype.first = function() {
      return this.all()[0];
    };

    Collection.prototype.last = function() {
      var values;
      values = this.all();
      return values[values.length - 1];
    };

    Collection.prototype.find = function(id) {
      var records,
        _this = this;
      records = this.select(function(rec) {
        return rec.id + '' === id + '';
      });
      if (!records[0]) {
        throw 'Unknown record';
      }
      return records[0];
    };

    Collection.prototype.findAllByAttribute = function(name, value) {
      var _this = this;
      return this.model.select(function(rec) {
        return rec[name] === value;
      });
    };

    Collection.prototype.findByAttribute = function(name, value) {
      return this.findAllByAttribute(name, value)[0];
    };

    Collection.prototype.select = function(cb) {
      var _this = this;
      return this.model.select(function(rec) {
        return _this.associated(rec) && cb(rec);
      });
    };

    Collection.prototype.refresh = function(values) {
      var record, records, _i, _j, _len, _len1, _ref;
      _ref = this.all();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        record = _ref[_i];
        delete this.model.records[record.id];
      }
      records = this.model.fromJSON(values);
      if (!isArray(records)) {
        records = [records];
      }
      for (_j = 0, _len1 = records.length; _j < _len1; _j++) {
        record = records[_j];
        record.newRecord = false;
        record[this.fkey] = this.record.id;
        this.model.records[record.id] = record;
      }
      return this.model.trigger('refresh', records);
    };

    Collection.prototype.create = function(record) {
      record[this.fkey] = this.record.id;
      return this.model.create(record);
    };

    Collection.prototype.associated = function(record) {
      return record[this.fkey] === this.record.id;
    };

    return Collection;

  })(Spine.Module);

  Instance = (function(_super) {

    __extends(Instance, _super);

    function Instance(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Instance.prototype.exists = function() {
      return this.record[this.fkey] && this.model.exists(this.record[this.fkey]);
    };

    Instance.prototype.update = function(value) {
      if (!(value instanceof this.model)) {
        value = new this.model(value);
      }
      if (value.isNew()) {
        value.save();
      }
      return this.record[this.fkey] = value && value.id;
    };

    return Instance;

  })(Spine.Module);

  Singleton = (function(_super) {

    __extends(Singleton, _super);

    function Singleton(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Singleton.prototype.find = function() {
      return this.record.id && this.model.findByAttribute(this.fkey, this.record.id);
    };

    Singleton.prototype.update = function(value) {
      if (!(value instanceof this.model)) {
        value = this.model.fromJSON(value);
      }
      value[this.fkey] = this.record.id;
      return value.save();
    };

    return Singleton;

  })(Spine.Module);

  singularize = function(str) {
    return str.replace(/s$/, '');
  };

  underscore = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
  };

  Spine.Model.extend({
    hasMany: function(name, model, fkey) {
      var association;
      if (fkey == null) {
        fkey = "" + (underscore(this.className)) + "_id";
      }
      association = function(record) {
        if (typeof model === 'string') {
          model = require(model);
        }
        return new Collection({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      return this.prototype[name] = function(value) {
        if (value != null) {
          association(this).refresh(value);
        }
        return association(this);
      };
    },
    belongsTo: function(name, model, fkey) {
      var association;
      if (fkey == null) {
        fkey = "" + (singularize(name)) + "_id";
      }
      association = function(record) {
        if (typeof model === 'string') {
          model = require(model);
        }
        return new Instance({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      this.prototype[name] = function(value) {
        if (value != null) {
          association(this).update(value);
        }
        return association(this).exists();
      };
      return this.attributes.push(fkey);
    },
    hasOne: function(name, model, fkey) {
      var association;
      if (fkey == null) {
        fkey = "" + (underscore(this.className)) + "_id";
      }
      association = function(record) {
        if (typeof model === 'string') {
          model = require(model);
        }
        return new Singleton({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      return this.prototype[name] = function(value) {
        if (value != null) {
          association(this).update(value);
        }
        return association(this).find();
      };
    }
  });

}).call(this);
(function() {
  var Spine;

  Spine = this.Spine || require('spine');

  Spine.Model.Local = {
    extended: function() {
      this.change(this.saveLocal);
      return this.fetch(this.loadLocal);
    },
    saveLocal: function() {
      var result;
      try {
        result = JSON.stringify(this);
        return localStorage[this.className] = result;
      } catch (error) {
        if (typeof console !== "undefined" && console !== null) {
          console.log("Error saving " + this.className + " to localstorage");
        }
        return typeof console !== "undefined" && console !== null ? console.log(error) : void 0;
      }
    },
    loadLocal: function() {
      var result;
      try {
        result = localStorage[this.className];
        return this.refresh(result || [], {
          clear: true
        });
      } catch (error) {
        if (typeof console !== "undefined" && console !== null) {
          console.log("Error loading " + this.className + " from localstorage");
        }
        return typeof console !== "undefined" && console !== null ? console.log(error) : void 0;
      }
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Model.Local;
  }

}).call(this);
(function() {
  var $, Ajax, Base, Collection, Extend, Include, Model, Singleton, Spine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Spine = this.Spine || require('spine');

  $ = Spine.$;

  Model = Spine.Model;

  Ajax = {
    getURL: function(object) {
      return object && (typeof object.url === "function" ? object.url() : void 0) || object.url;
    },
    enabled: true,
    pending: false,
    requests: [],
    disable: function(callback) {
      if (this.enabled) {
        this.enabled = false;
        callback();
        return this.enabled = true;
      } else {
        return callback();
      }
    },
    requestNext: function() {
      var next;
      next = this.requests.shift();
      if (next) {
        return this.request(next);
      } else {
        return this.pending = false;
      }
    },
    request: function(callback) {
      var _this = this;
      return (callback()).complete(function() {
        return _this.requestNext();
      });
    },
    queue: function(callback) {
      if (!this.enabled) {
        return;
      }
      if (this.pending) {
        this.requests.push(callback);
      } else {
        this.pending = true;
        this.request(callback);
      }
      return callback;
    }
  };

  Base = (function() {

    function Base() {}

    Base.prototype.defaults = {
      contentType: 'application/json',
      dataType: 'json',
      processData: false,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    Base.prototype.ajax = function(params, defaults) {
      return $.ajax($.extend({}, this.defaults, defaults, params));
    };

    Base.prototype.queue = function(callback) {
      return Ajax.queue(callback);
    };

    return Base;

  })();

  Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection(model) {
      this.model = model;
      this.errorResponse = __bind(this.errorResponse, this);

      this.recordsResponse = __bind(this.recordsResponse, this);

    }

    Collection.prototype.find = function(id, params) {
      var record;
      record = new this.model({
        id: id
      });
      return this.ajax(params, {
        type: 'GET',
        url: Ajax.getURL(record)
      }).success(this.recordsResponse).error(this.errorResponse);
    };

    Collection.prototype.all = function(params) {
      return this.ajax(params, {
        type: 'GET',
        url: Ajax.getURL(this.model)
      }).success(this.recordsResponse).error(this.errorResponse);
    };

    Collection.prototype.fetch = function(params, options) {
      var id,
        _this = this;
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      if (id = params.id) {
        delete params.id;
        return this.find(id, params).success(function(record) {
          return _this.model.refresh(record, options);
        });
      } else {
        return this.all(params).success(function(records) {
          return _this.model.refresh(records, options);
        });
      }
    };

    Collection.prototype.recordsResponse = function(data, status, xhr) {
      return this.model.trigger('ajaxSuccess', null, status, xhr);
    };

    Collection.prototype.errorResponse = function(xhr, statusText, error) {
      return this.model.trigger('ajaxError', null, xhr, statusText, error);
    };

    return Collection;

  })(Base);

  Singleton = (function(_super) {

    __extends(Singleton, _super);

    function Singleton(record) {
      this.record = record;
      this.errorResponse = __bind(this.errorResponse, this);

      this.recordResponse = __bind(this.recordResponse, this);

      this.model = this.record.constructor;
    }

    Singleton.prototype.reload = function(params, options) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'GET',
          url: Ajax.getURL(_this.record)
        }).success(_this.recordResponse(options)).error(_this.errorResponse(options));
      });
    };

    Singleton.prototype.create = function(params, options) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'POST',
          data: JSON.stringify(_this.record),
          url: Ajax.getURL(_this.model)
        }).success(_this.recordResponse(options)).error(_this.errorResponse(options));
      });
    };

    Singleton.prototype.update = function(params, options) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'PUT',
          data: JSON.stringify(_this.record),
          url: Ajax.getURL(_this.record)
        }).success(_this.recordResponse(options)).error(_this.errorResponse(options));
      });
    };

    Singleton.prototype.destroy = function(params, options) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'DELETE',
          url: Ajax.getURL(_this.record)
        }).success(_this.recordResponse(options)).error(_this.errorResponse(options));
      });
    };

    Singleton.prototype.recordResponse = function(options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      return function(data, status, xhr) {
        var _ref;
        if (Spine.isBlank(data)) {
          data = false;
        } else {
          data = _this.model.fromJSON(data);
        }
        Ajax.disable(function() {
          if (data) {
            if (data.id && _this.record.id !== data.id) {
              _this.record.changeID(data.id);
            }
            return _this.record.updateAttributes(data.attributes());
          }
        });
        _this.record.trigger('ajaxSuccess', data, status, xhr);
        return (_ref = options.success) != null ? _ref.apply(_this.record) : void 0;
      };
    };

    Singleton.prototype.errorResponse = function(options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      return function(xhr, statusText, error) {
        var _ref;
        _this.record.trigger('ajaxError', xhr, statusText, error);
        return (_ref = options.error) != null ? _ref.apply(_this.record) : void 0;
      };
    };

    return Singleton;

  })(Base);

  Model.host = '';

  Include = {
    ajax: function() {
      return new Singleton(this);
    },
    url: function() {
      var args, url;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      url = Ajax.getURL(this.constructor);
      if (url.charAt(url.length - 1) !== '/') {
        url += '/';
      }
      url += encodeURIComponent(this.id);
      args.unshift(url);
      return args.join('/');
    }
  };

  Extend = {
    ajax: function() {
      return new Collection(this);
    },
    url: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift(this.className.toLowerCase() + 's');
      args.unshift(Model.host);
      return args.join('/');
    }
  };

  Model.Ajax = {
    extended: function() {
      this.fetch(this.ajaxFetch);
      this.change(this.ajaxChange);
      this.extend(Extend);
      return this.include(Include);
    },
    ajaxFetch: function() {
      var _ref;
      return (_ref = this.ajax()).fetch.apply(_ref, arguments);
    },
    ajaxChange: function(record, type, options) {
      if (options == null) {
        options = {};
      }
      if (options.ajax === false) {
        return;
      }
      return record.ajax()[type](options.ajax, options);
    }
  };

  Model.Ajax.Methods = {
    extended: function() {
      this.extend(Extend);
      return this.include(Include);
    }
  };

  Ajax.defaults = Base.prototype.defaults;

  Spine.Ajax = Ajax;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Ajax;
  }

}).call(this);
(function() {
  var $,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  $ = Spine.$;

  Spine.Mobile || (Spine.Mobile = {});

  Spine.Mobile.globalManager = new Spine.Manager;

  Spine.Mobile.Stage = (function(_super) {

    __extends(Stage, _super);

    Stage.globalManager = function() {
      return Spine.Mobile.globalManager;
    };

    Stage.globalStage = function() {
      return this.globalManager().controllers[0];
    };

    Stage.prototype.effectDefaults = {
      duration: 250,
      easing: 'ease-in-out'
    };

    Stage.prototype.effectOptions = function(options) {
      if (options == null) {
        options = {};
      }
      return $.extend({}, this.effectDefaults, options);
    };

    Stage.prototype.viewport = true;

    Stage.prototype.elements = {
      'header': 'header',
      'article': 'content',
      'footer': 'footer'
    };

    function Stage() {
      this.getManager = __bind(this.getManager, this);
      Stage.__super__.constructor.apply(this, arguments);
      this.el.addClass('stage');
      if (this.global) {
        this.header = $('<header />');
        this.content = $('<article />');
        this.footer = $('<footer />');
        if (this.viewport) {
          this.content.addClass('viewport');
        }
        this.el.append(this.header);
        this.el.append(this.content);
        this.el.append(this.footer);
        Spine.Mobile.globalManager.add(this);
      }
    }

    Stage.prototype.append = function() {
      var e, elements, _i, _len, _results;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        e = elements[_i];
        _results.push(this.content.append(e.el || e));
      }
      return _results;
    };

    Stage.prototype.html = function() {
      this.el.html.apply(this.el, arguments);
      this.refreshElements();
      return this.el;
    };

    Stage.prototype.add = function() {
      var panels, _ref;
      panels = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref = this.getManager()).add.apply(_ref, panels);
      return this.append.apply(this, panels);
    };

    Stage.prototype.getManager = function() {
      return this.manager || (this.manager = new Spine.Manager);
    };

    Stage.prototype.activate = function(params) {
      var effect;
      if (params == null) {
        params = {};
      }
      effect = params.transition || params.trans || 'appear';
      if (effect) {
        return this.effects[effect].apply(this);
      } else {
        this.el.addClass('active');
        return this.trigger('activated');
      }
    };

    Stage.prototype.deactivate = function(params) {
      var effect;
      if (params == null) {
        params = {};
      }
      if (!this.isActive()) {
        return;
      }
      effect = params.transition || params.trans;
      if (effect) {
        return this.reverseEffects[effect].apply(this);
      } else {
        this.el.removeClass('active');
        return this.trigger('deactivated');
      }
    };

    Stage.prototype.isActive = function() {
      return this.el.hasClass('active');
    };

    Stage.prototype.effects = {
      appear: function() {
        var animation, opts,
          _this = this;
        this.el.addClass('active');
        this.el.addClass('transitioning');
        opts = this.effectOptions();
        animation = function() {
          return _this.el.animate({
            translate3d: '0, 0, 0'
          }, 0, null, function() {
            _this.el.removeClass('transitioning');
            return _this.trigger('activated');
          });
        };
        return setTimeout(animation, 0);
      },
      left: function() {
        var animation, opts,
          _this = this;
        this.el.addClass('active');
        this.el.addClass('transitioning');
        opts = this.effectOptions();
        animation = function() {
          return _this.el.animate({
            translate3d: '100%, 0, 0'
          }, 0, null, function() {
            return _this.el.animate({
              translate3d: '0, 0, 0'
            }, opts.duration, opts.easing, function() {
              _this.el.removeClass('transitioning');
              return _this.trigger('activated');
            });
          });
        };
        return setTimeout(animation, 0);
      },
      right: function() {
        var animation, opts,
          _this = this;
        this.el.addClass('active');
        this.el.addClass('transitioning');
        opts = this.effectOptions();
        animation = function() {
          return _this.el.animate({
            translate3d: '-100%, 0, 0'
          }, 0, null, function() {
            return _this.el.animate({
              translate3d: '0, 0, 0'
            }, opts.duration, opts.easing, function() {
              _this.el.removeClass('transitioning');
              return _this.trigger('activated');
            });
          });
        };
        return setTimeout(animation, 0);
      }
    };

    Stage.prototype.reverseEffects = {
      left: function() {
        var animation, opts,
          _this = this;
        opts = this.effectOptions();
        this.el.addClass('transitioning');
        animation = function() {
          return _this.el.animate({
            translate3d: '0, 0, 0'
          }, 0, null, function() {
            return _this.el.animate({
              translate3d: '-100%, 0, 0'
            }, opts.duration, opts.easing, function() {
              _this.el.removeClass('active');
              _this.el.removeClass('transitioning');
              return _this.trigger('deactivated');
            });
          });
        };
        return setTimeout(animation, 0);
      },
      right: function() {
        var animation, opts,
          _this = this;
        opts = this.effectOptions();
        this.el.addClass('transitioning');
        animation = function() {
          return _this.el.animate({
            translate3d: '0, 0, 0'
          }, 0, null, function() {
            return _this.el.animate({
              translate3d: '100%, 0, 0'
            }, opts.duration, opts.easing, function() {
              _this.el.removeClass('active');
              _this.el.removeClass('transitioning');
              return _this.trigger('deactivated');
            });
          });
        };
        return setTimeout(animation, 0);
      }
    };

    return Stage;

  })(Spine.Controller);

  Spine.Mobile.Stage.Global = (function(_super) {

    __extends(Global, _super);

    function Global() {
      return Global.__super__.constructor.apply(this, arguments);
    }

    Global.prototype.global = true;

    return Global;

  })(Spine.Mobile.Stage);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Spine.Mobile.Panel = (function(_super) {

    __extends(Panel, _super);

    Panel.prototype.tag = 'section';

    Panel.prototype.viewport = false;

    function Panel() {
      var _ref, _ref1;
      Panel.__super__.constructor.apply(this, arguments);
      this.el.removeClass('stage').addClass('panel');
      if ((_ref = this.stage) == null) {
        this.stage = Spine.Mobile.Stage.globalStage();
      }
      if ((_ref1 = this.stage) != null) {
        _ref1.add(this);
      }
    }

    return Panel;

  })(Spine.Mobile.Stage);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Spine.AjaxProxy = (function(_super) {

    __extends(AjaxProxy, _super);

    AjaxProxy.include(Spine.Events);

    AjaxProxy.setup = function(parentObject) {
      if (Spine.AjaxProxy.parentObject) {
        throw "ERROR: Can't set up another proxy when one's already set";
      }
      Spine.AjaxProxy.parentObject = parentObject;
      Spine.AjaxProxy.originalAjax = parentObject.ajax;
      return parentObject.ajax = Spine.AjaxProxy.proxiedAjax;
    };

    AjaxProxy.teardown = function() {
      if (Spine.AjaxProxy.parentObject) {
        Spine.AjaxProxy.parentObject.ajax = Spine.AjaxProxy.originalAjax;
        Spine.AjaxProxy.originalAjax = null;
        return Spine.AjaxProxy.parentObject = null;
      }
    };

    AjaxProxy.proxiedAjax = function(opts) {
      return new Spine.AjaxProxy(opts);
    };

    function AjaxProxy(opts) {
      this.complete = __bind(this.complete, this);

      this.error = __bind(this.error, this);

      this.success = __bind(this.success, this);

      this.completeResponse = __bind(this.completeResponse, this);

      this.errorResponse = __bind(this.errorResponse, this);

      this.successResponse = __bind(this.successResponse, this);

      var complete, error, success;
      this.opts = opts;
      success = opts.success;
      if (success) {
        this.bind('success', success);
      }
      opts.success = this.successResponse;
      error = opts.error;
      if (error) {
        if (error) {
          this.bind('error', error);
        }
      }
      opts.error = this.errorResponse;
      complete = opts.complete;
      if (complete) {
        if (error) {
          this.bind('complete', complete);
        }
      }
      opts.complete = this.completeResponse;
      this.request = Spine.AjaxProxy.originalAjax(opts);
    }

    AjaxProxy.prototype.successResponse = function(data, status, xhr) {
      return this.trigger('success', data, status, xhr);
    };

    AjaxProxy.prototype.errorResponse = function(xhr, statusText, error) {
      return this.trigger('error', xhr, statusText, error);
    };

    AjaxProxy.prototype.completeResponse = function(xhr, status) {
      return this.trigger('complete', xhr, status);
    };

    AjaxProxy.prototype.success = function(callback) {
      var _this = this;
      this.bind('success', function() {
        callback.apply(_this, arguments);
        return true;
      });
      return this;
    };

    AjaxProxy.prototype.error = function(callback) {
      var _this = this;
      this.bind('error', function() {
        callback.apply(_this, arguments);
        return true;
      });
      return this;
    };

    AjaxProxy.prototype.complete = function(callback) {
      var _this = this;
      this.bind('complete', function() {
        callback.apply(_this, arguments);
        return true;
      });
      return this;
    };

    return AjaxProxy;

  })(Spine.Module);

  Spine.AjaxProxy.setup($);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Spine.Singleton = (function(_super) {

    __extends(Singleton, _super);

    function Singleton() {
      return Singleton.__super__.constructor.apply(this, arguments);
    }

    Singleton.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    return Singleton;

  })(Spine.Module);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Spine.Request = (function(_super) {

    __extends(Request, _super);

    Request.include(Spine.Log);

    Request.include(Spine.Events);

    Request.timeout = 15000;

    Request.defaultHost = 'localhost';

    Request.apiVersion = '1';

    Request.getProtocol = function() {
      return location.protocol;
    };

    function Request(options) {
      var _base, _base1, _base2, _base3, _base4;
      this.options = options != null ? options : {};
      (_base = this.options)['dataType'] || (_base['dataType'] = 'json');
      this.options['url'] = this.urlForPath(this.options.url);
      (_base1 = this.options)['headers'] || (_base1['headers'] = {});
      (_base2 = this.options['headers'])['Accept'] || (_base2['Accept'] = 'application/json');
      (_base3 = this.options)['contentType'] || (_base3['contentType'] = 'application/json');
      (_base4 = this.options)['timeout'] || (_base4['timeout'] = this.constructor.timeout);
    }

    Request.prototype.urlForPath = function(path) {
      return "http" + (this.constructor.getProtocol().match(/(https|file)/) && !this.constructor.defaultHost.match(/local|dev|:3000|10\.0\./) ? 's' : '') + "://" + this.constructor.defaultHost + "/api/v" + this.constructor.apiVersion + path;
    };

    Request.prototype.perform = function() {
      return this.ajax = $.ajax(this.options);
    };

    return Request;

  })(Spine.Module);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Spine.Observer = (function(_super) {

    __extends(Observer, _super);

    function Observer() {
      return Observer.__super__.constructor.apply(this, arguments);
    }

    Observer.include(Spine.Log);

    Observer.setup = function() {
      this.instance = new this;
      return this.instance.bindEventHandlers();
    };

    Observer.teardown = function() {
      this.instance.unbindEventHandlers();
      return delete this.instance;
    };

    Observer.getInstance = function() {
      if (!this.instance) {
        this.setup();
      }
      return this.instance;
    };

    Observer.prototype.bindEventHandlers = function() {
      return this.log('Binding observer event handlers');
    };

    Observer.prototype.unbindEventHandlers = function() {
      return this.log('Unbinding observer event handlers');
    };

    return Observer;

  })(Spine.Module);

}).call(this);
(function() {
  var __slice = [].slice;

  Spine.Log.logError = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (!this.trace) {
      return;
    }
    if (this.logPrefix) {
      args.unshift(this.logPrefix);
    }
    if (typeof console !== "undefined" && console !== null ? console.error : void 0) {
      console.error.apply(console, args);
    } else if (typeof console !== "undefined" && console !== null ? console.log : void 0) {
      console.log.apply(console, args);
    }
    return this;
  };

  Spine.Log.logWarn = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (!this.trace) {
      return;
    }
    if (this.logPrefix) {
      args.unshift(this.logPrefix);
    }
    if (typeof console !== "undefined" && console !== null ? console.warn : void 0) {
      console.warn.apply(console, args);
    } else if (typeof console !== "undefined" && console !== null ? console.log : void 0) {
      console.log.apply(console, args);
    }
    return this;
  };

}).call(this);
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
(function() {
  var __slice = [].slice;

  window.HAML = (function() {

    function HAML() {}

    HAML.escape = function(text) {
      return ("" + text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\//g, "&#47;");
    };

    HAML.cleanValue = function(text) {
      switch (text) {
        case null:
        case void 0:
          return '';
        case true:
        case false:
          return '\u0093' + text;
        default:
          return text;
      }
    };

    HAML.extend = function() {
      var key, obj, source, sources, val, _i, _len;
      obj = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        for (key in source) {
          val = source[key];
          obj[key] = val;
        }
      }
      return obj;
    };

    HAML.globals = function() {
      return {};
    };

    HAML.context = function(locals) {
      return this.extend({}, HAML.globals(), locals);
    };

    HAML.preserve = function(text) {
      return text.replace(/\n/g, '&#x000A;');
    };

    HAML.findAndPreserve = function(text) {
      var tags;
      tags = 'textarea,pre'.split(',').join('|');
      return text = text.replace(/\r/g, '').replace(RegExp("<(" + tags + ")>([\\s\\S]*?)<\\/\\1>", "g"), function(str, tag, content) {
        return "<" + tag + ">" + (window.HAML.preserve(content)) + "</" + tag + ">";
      });
    };

    HAML.surround = function(start, end, fn) {
      var _ref;
      return start + ((_ref = fn.call(this)) != null ? _ref.replace(/^\s+|\s+$/g, '') : void 0) + end;
    };

    HAML.succeed = function(end, fn) {
      var _ref;
      return ((_ref = fn.call(this)) != null ? _ref.replace(/\s+$/g, '') : void 0) + end;
    };

    HAML.precede = function(start, fn) {
      var _ref;
      return start + ((_ref = fn.call(this)) != null ? _ref.replace(/^\s+/g, '') : void 0);
    };

    HAML.reference = function(object, prefix) {
      var id, name, result, _ref;
      name = prefix ? prefix + '_' : '';
      if (typeof object.hamlObjectRef === 'function') {
        name += object.hamlObjectRef();
      } else {
        name += (((_ref = object.constructor) != null ? _ref.name : void 0) || 'object').replace(/\W+/g, '_').replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase();
      }
      id = typeof object.to_key === 'function' ? object.to_key() : typeof object.id === 'function' ? object.id() : object.id ? object.id : object;
      result = "class='" + name + "'";
      if (id) {
        return result += " id='" + name + "_" + id + "'";
      }
    };

    return HAML;

  })();

}).call(this);
//
// showdown.js -- A javascript port of Markdown.
//
// Copyright (c) 2007 John Fraser.
//
// Original Markdown Copyright (c) 2004-2005 John Gruber
//   <http://daringfireball.net/projects/markdown/>
//
// Redistributable under a BSD-style open source license.
// See license.txt for more information.
//
// The full source distribution is at:
//
//        A A L
//        T C A
//        T K B
//
//   <http://www.attacklab.net/>
//

//
// Wherever possible, Showdown is a straight, line-by-line port
// of the Perl version of Markdown.
//
// This is not a normal parser design; it's basically just a
// series of string substitutions.  It's hard to read and
// maintain this way,  but keeping Showdown close to the original
// design makes it easier to port new features.
//
// More importantly, Showdown behaves like markdown.pl in most
// edge cases.  So web applications can do client-side preview
// in Javascript, and then build identical HTML on the server.
//
// This port needs the new RegExp functionality of ECMA 262,
// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
// should do fine.  Even with the new regular expression features,
// We do a lot of work to emulate Perl's regex functionality.
// The tricky changes in this file mostly have the "attacklab:"
// label.  Major or self-explanatory changes don't.
//
// Smart diff tools like Araxis Merge will be able to match up
// this file with markdown.pl in a useful way.  A little tweaking
// helps: in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "text".  Be sure to ignore whitespace
// and line endings.
//


//
// Showdown usage:
//
//   var text = "Markdown *rocks*.";
//
//   var converter = new Showdown.converter();
//   var html = converter.makeHtml(text);
//
//   alert(html);
//
// Note: move the sample code to the bottom of this
// file before uncommenting it.
//


// **************************************************
// GitHub Flavored Markdown modifications by Tekkub
// http://github.github.com/github-flavored-markdown/
//
// Modifications are tagged with "GFM"
// **************************************************

//
// Showdown namespace
//
var Showdown = {};

//
// converter
//
// Wraps all "globals" so that the only thing
// exposed is makeHtml().
//
Showdown.converter = function() {

  // Global hashes, used by various utility routines
  var g_urls;
  var g_titles;
  var g_html_blocks;

  // Used to track when we're inside an ordered or unordered list
  // (see _ProcessListItems() for details):
  var g_list_level = 0;

  // Main function. The order in which other subs are called here is
  // essential. Link and image substitutions need to happen before
  // _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
  // and <img> tags get encoded.
  this.makeHtml = function(text) {

    // Clear the global hashes. If we don't clear these, you get conflicts
    // from other articles when generating a page which contains more than
    // one article (e.g. an index page that shows the N most recent
    // articles):
    g_urls = new Array();
    g_titles = new Array();
    g_html_blocks = new Array();

    // attacklab: Replace ~ with ~T
    // This lets us use tilde as an escape char to avoid md5 hashes
    // The choice of character is arbitray; anything that isn't
    // magic in Markdown will work.
    text = text.replace(/~/g, "~T");

    // attacklab: Replace $ with ~D
    // RegExp interprets $ as a special character
    // when it's in a replacement string
    text = text.replace(/\$/g, "~D");

    // Standardize line endings
    text = text.replace(/\r\n/g, "\n"); // DOS to Unix
    text = text.replace(/\r/g, "\n"); // Mac to Unix

    // Make sure text begins and ends with a couple of newlines:
    text = "\n\n" + text + "\n\n";

    // Convert all tabs to spaces.
    text = _Detab(text);

    // Strip any lines consisting only of spaces and tabs.
    // This makes subsequent regexen easier to write, because we can
    // match consecutive blank lines with /\n+/ instead of something
    // contorted like /[ \t]*\n+/ .
    text = text.replace(/^[ \t]+$/mg, "");

    // Turn block-level HTML blocks into hash entries
    text = _HashHTMLBlocks(text);

    // Strip link definitions, store in hashes.
    text = _StripLinkDefinitions(text);

    text = _RunBlockGamut(text);

    text = _UnescapeSpecialChars(text);

    // attacklab: Restore dollar signs
    text = text.replace(/~D/g, "$$");

    // attacklab: Restore tildes
    text = text.replace(/~T/g, "~");

    // ** GFM **  Auto-link URLs and emails
    text = text.replace(/https?\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!]/g, function(wholeMatch, matchIndex) {
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/<[^>]+$/) && right.match(/^[^>]*>/)) {
        return wholeMatch
      }
      var href = wholeMatch.replace(/^http:\/\/github.com\//, "https://github.com/");
      return "<a href='" + href + "'>" + wholeMatch + "</a>";
    });
    text = text.replace(/[a-z0-9_\-+=.]+@[a-z0-9\-]+(\.[a-z0-9-]+)+/ig, function(wholeMatch) {
      return "<a href='mailto:" + wholeMatch + "'>" + wholeMatch + "</a>";
    });

    // ** GFM ** Auto-link sha1 if GitHub.nameWithOwner is defined
    text = text.replace(/[a-f0-9]{40}/ig, function(wholeMatch, matchIndex) {
      if (typeof(GitHub) == "undefined" || typeof(GitHub.nameWithOwner) == "undefined") {
        return wholeMatch;
      }
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/@$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) {
        return wholeMatch;
      }
      return "<a href='http://github.com/" + GitHub.nameWithOwner + "/commit/" + wholeMatch + "'>" + wholeMatch.substring(0, 7) + "</a>";
    });

    // ** GFM ** Auto-link user@sha1 if GitHub.nameWithOwner is defined
    text = text.replace(/([a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function(wholeMatch, username, sha, matchIndex) {
      if (typeof(GitHub) == "undefined" || typeof(GitHub.nameWithOwner) == "undefined") {
        return wholeMatch;
      }
      GitHub.repoName = GitHub.repoName || _GetRepoName();
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/\/$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) {
        return wholeMatch;
      }
      return "<a href='http://github.com/" + username + "/" + GitHub.repoName + "/commit/" + sha + "'>" + username + "@" + sha.substring(0, 7) + "</a>";
    });

    // ** GFM ** Auto-link user/repo@sha1
    text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function(wholeMatch, repo, sha) {
      return "<a href='http://github.com/" + repo + "/commit/" + sha + "'>" + repo + "@" + sha.substring(0, 7) + "</a>";
    });

    // ** GFM ** Auto-link #issue if GitHub.nameWithOwner is defined
    text = text.replace(/#([0-9]+)/ig, function(wholeMatch, issue, matchIndex) {
      if (typeof(GitHub) == "undefined" || typeof(GitHub.nameWithOwner) == "undefined") {
        return wholeMatch;
      }
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left == "" || left.match(/[a-z0-9_\-+=.]$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) {
        return wholeMatch;
      }
      return "<a href='http://github.com/" + GitHub.nameWithOwner + "/issues/#issue/" + issue + "'>" + wholeMatch + "</a>";
    });

    // ** GFM ** Auto-link user#issue if GitHub.nameWithOwner is defined
    text = text.replace(/([a-z0-9_\-+=.]+)#([0-9]+)/ig, function(wholeMatch, username, issue, matchIndex) {
      if (typeof(GitHub) == "undefined" || typeof(GitHub.nameWithOwner) == "undefined") {
        return wholeMatch;
      }
      GitHub.repoName = GitHub.repoName || _GetRepoName();
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/\/$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) {
        return wholeMatch;
      }
      return "<a href='http://github.com/" + username + "/" + GitHub.repoName + "/issues/#issue/" + issue + "'>" + wholeMatch + "</a>";
    });

    // ** GFM ** Auto-link user/repo#issue
    text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)#([0-9]+)/ig, function(wholeMatch, repo, issue) {
      return "<a href='http://github.com/" + repo + "/issues/#issue/" + issue + "'>" + wholeMatch + "</a>";
    });

    return text;
  };


  var _GetRepoName = function() {
    return GitHub.nameWithOwner.match(/^.+\/(.+)$/)[1]
  };

  //
  // Strips link definitions from text, stores the URLs and titles in
  // hash references.
  //
  var _StripLinkDefinitions = function(text) {

    // Link defs are in the form: ^[id]: url "optional title"

    /*
     var text = text.replace(/
     ^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
     [ \t]*
     \n?        // maybe *one* newline
     [ \t]*
     <?(\S+?)>?     // url = $2
     [ \t]*
     \n?        // maybe one newline
     [ \t]*
     (?:
     (\n*)        // any lines skipped = $3 attacklab: lookbehind removed
     ["(]
     (.+?)        // title = $4
     [")]
     [ \t]*
     )?         // title is optional
     (?:\n+|$)
     /gm,
     function(){...});
     */
    var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm, function (wholeMatch, m1, m2, m3, m4) {
      m1 = m1.toLowerCase();
      g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive
      if (m3) {
        // Oops, found blank lines, so it's not a title.
        // Put back the parenthetical statement we stole.
        return m3 + m4;
      } else if (m4) {
        g_titles[m1] = m4.replace(/"/g, "&quot;");
      }

      // Completely remove the definition from the text
      return "";
    });

    return text;
  };


  var _HashHTMLBlocks = function(text) {
    // attacklab: Double up blank lines to reduce lookaround
    text = text.replace(/\n/g, "\n\n");

    // Hashify HTML blocks:
    // We only want to do this for block-level HTML tags, such as headers,
    // lists, and tables. That's because we still want to wrap <p>s around
    // "paragraphs" that are wrapped in non-block-level tags, such as anchors,
    // phrase emphasis, and spans. The list of tags we're looking for is
    // hard-coded:
    var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
    var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

    // First, look for nested blocks, e.g.:
    //   <div>
    //     <div>
    //     tags for inner block must be indented.
    //     </div>
    //   </div>
    //
    // The outermost tags must start at the left margin for this to match, and
    // the inner nested divs must be indented.
    // We need to do this before the next, more liberal match, because the next
    // match will start at the first `<div>` and stop at the first `</div>`.

    // attacklab: This regex can be expensive when it fails.
    /*
     var text = text.replace(/
     (            // save in $1
     ^          // start of line  (with /m)
     <($block_tags_a) // start tag = $2
     \b         // word break
     // attacklab: hack around khtml/pcre bug...
     [^\r]*?\n      // any number of lines, minimally matching
     </\2>        // the matching end tag
     [ \t]*       // trailing spaces/tabs
     (?=\n+)        // followed by a newline
     )            // attacklab: there are sentinel newlines at end of document
     /gm,function(){...}};
     */
    text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashElement);

    //
    // Now match more liberally, simply from `\n<tag>` to `</tag>\n`
    //

    /*
     var text = text.replace(/
     (            // save in $1
     ^          // start of line  (with /m)
     <($block_tags_b) // start tag = $2
     \b         // word break
     // attacklab: hack around khtml/pcre bug...
     [^\r]*?        // any number of lines, minimally matching
     .*</\2>        // the matching end tag
     [ \t]*       // trailing spaces/tabs
     (?=\n+)        // followed by a newline
     )            // attacklab: there are sentinel newlines at end of document
     /gm,function(){...}};
     */
    text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, hashElement);

    // Special case just for <hr />. It was easier to make a special case than
    // to make the other regex more complicated.

    /*
     text = text.replace(/
     (            // save in $1
     \n\n       // Starting after a blank line
     [ ]{0,3}
     (<(hr)       // start tag = $2
     \b         // word break
     ([^<>])*?      //
     \/?>)        // the matching end tag
     [ \t]*
     (?=\n{2,})     // followed by a blank line
     )
     /g,hashElement);
     */
    text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement);

    // Special case for standalone HTML comments:

    /*
     text = text.replace(/
     (            // save in $1
     \n\n       // Starting after a blank line
     [ ]{0,3}     // attacklab: g_tab_width - 1
     <!
     (--[^\r]*?--\s*)+
     >
     [ \t]*
     (?=\n{2,})     // followed by a blank line
     )
     /g,hashElement);
     */
    text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, hashElement);

    // PHP and ASP-style processor instructions (<?...?> and <%...%>)

    /*
     text = text.replace(/
     (?:
     \n\n       // Starting after a blank line
     )
     (            // save in $1
     [ ]{0,3}     // attacklab: g_tab_width - 1
     (?:
     <([?%])      // $2
     [^\r]*?
     \2>
     )
     [ \t]*
     (?=\n{2,})     // followed by a blank line
     )
     /g,hashElement);
     */
    text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashElement);

    // attacklab: Undo double lines (see comment at top of this function)
    text = text.replace(/\n\n/g, "\n");
    return text;
  };

  var hashElement = function(wholeMatch, m1) {
    var blockText = m1;

    // Undo double lines
    blockText = blockText.replace(/\n\n/g, "\n");
    blockText = blockText.replace(/^\n/, "");

    // strip trailing blank lines
    blockText = blockText.replace(/\n+$/g, "");

    // Replace the element text with a marker ("~KxK" where x is its key)
    blockText = "\n\n~K" + (g_html_blocks.push(blockText) - 1) + "K\n\n";

    return blockText;
  };

  //
  // These are all the transformations that form block-level
  // tags like paragraphs, headers, and list items.
  //
  var _RunBlockGamut = function(text) {
    text = _DoHeaders(text);

    // Do Horizontal Rules:
    var key = hashBlock("<hr />");
    text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, key);
    text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, key);
    text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, key);

    text = _DoLists(text);
    text = _DoCodeBlocks(text);
    text = _DoBlockQuotes(text);

    // We already ran _HashHTMLBlocks() before, in Markdown(), but that
    // was to escape raw HTML in the original Markdown source. This time,
    // we're escaping the markup we've just created, so that we don't wrap
    // <p> tags around block-level tags.
    text = _HashHTMLBlocks(text);
    text = _FormParagraphs(text);

    return text;
  };

  //
  // These are all the transformations that occur *within* block-level
  // tags like paragraphs, headers, and list items.
  //
  var _RunSpanGamut = function(text) {

    text = _DoCodeSpans(text);
    text = _EscapeSpecialCharsWithinTagAttributes(text);
    text = _EncodeBackslashEscapes(text);

    // Process anchor and image tags. Images must come first,
    // because ![foo][f] looks like an anchor.
    text = _DoImages(text);
    text = _DoAnchors(text);

    // Make links out of things like `<http://example.com/>`
    // Must come after _DoAnchors(), because you can use < and >
    // delimiters in inline links like [this](<url>).
    text = _DoAutoLinks(text);
    text = _EncodeAmpsAndAngles(text);
    text = _DoItalicsAndBold(text);

    // Do hard breaks:
    text = text.replace(/  +\n/g, " <br />\n");

    return text;
  };

  //
  // Within tags -- meaning between < and > -- encode [\ ` * _] so they
  // don't conflict with their use in Markdown for code, italics and strong.
  //
  var _EscapeSpecialCharsWithinTagAttributes = function(text) {

    // Build a regex to find HTML tags and comments.  See Friedl's
    // "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
    var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

    text = text.replace(regex, function(wholeMatch) {
      var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
      tag = escapeCharacters(tag, "\\`*_");
      return tag;
    });

    return text;
  };

  //
  // Turn Markdown link shortcuts into XHTML <a> tags.
  //
  var _DoAnchors = function(text) {
    //
    // First, handle reference-style links: [link text] [id]
    //

    /*
     text = text.replace(/
     (              // wrap whole match in $1
     \[
     (
     (?:
     \[[^\]]*\]   // allow brackets nested one level
     |
     [^\[]      // or anything else
     )*
     )
     \]

     [ ]?         // one optional space
     (?:\n[ ]*)?        // one optional newline followed by spaces

     \[
     (.*?)          // id = $3
     \]
     )()()()()          // pad remaining backreferences
     /g,_DoAnchors_callback);
     */
    text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeAnchorTag);

    //
    // Next, inline-style links: [link text](url "optional title")
    //

    /*
     text = text.replace(/
     (            // wrap whole match in $1
     \[
     (
     (?:
     \[[^\]]*\] // allow brackets nested one level
     |
     [^\[\]]      // or anything else
     )
     )
     \]
     \(           // literal paren
     [ \t]*
     ()           // no id, so leave $3 empty
     <?(.*?)>?        // href = $4
     [ \t]*
     (            // $5
     (['"])       // quote char = $6
     (.*?)        // Title = $7
     \6         // matching quote
     [ \t]*       // ignore any spaces/tabs between closing quote and )
     )?           // title is optional
     \)
     )
     /g,writeAnchorTag);
     */
    text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeAnchorTag);

    //
    // Last, handle reference-style shortcuts: [link text]
    // These must come last in case you've also got [link test][1]
    // or [link test](/foo)
    //

    /*
     text = text.replace(/
     (              // wrap whole match in $1
     \[
     ([^\[\]]+)       // link text = $2; can't contain '[' or ']'
     \]
     )()()()()()          // pad rest of backreferences
     /g, writeAnchorTag);
     */
    text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

    return text;
  };

  var writeAnchorTag = function(wholeMatch, m1, m2, m3, m4, m5, m6, m7) {
    if (m7 == undefined) m7 = "";
    var whole_match = m1;
    var link_text = m2;
    var link_id = m3.toLowerCase();
    var url = m4;
    var title = m7;

    if (url == "") {
      if (link_id == "") {
        // lower-case and turn embedded newlines into spaces
        link_id = link_text.toLowerCase().replace(/ ?\n/g, " ");
      }
      url = "#" + link_id;

      if (g_urls[link_id] != undefined) {
        url = g_urls[link_id];
        if (g_titles[link_id] != undefined) {
          title = g_titles[link_id];
        }
      }
      else {
        if (whole_match.search(/\(\s*\)$/m) > -1) {
          // Special case for explicit empty url
          url = "";
        } else {
          return whole_match;
        }
      }
    }

    url = escapeCharacters(url, "*_");
    var result = "<a href=\"" + url + "\"";

    if (title != "") {
      title = title.replace(/"/g, "&quot;");
      title = escapeCharacters(title, "*_");
      result += " title=\"" + title + "\"";
    }

    result += ">" + link_text + "</a>";

    return result;
  };


  //
  // Turn Markdown image shortcuts into <img> tags.
  //
  var _DoImages = function(text) {
    //
    // First, handle reference-style labeled images: ![alt text][id]
    //

    /*
     text = text.replace(/
     (            // wrap whole match in $1
     !\[
     (.*?)        // alt text = $2
     \]

     [ ]?       // one optional space
     (?:\n[ ]*)?      // one optional newline followed by spaces

     \[
     (.*?)        // id = $3
     \]
     )()()()()        // pad rest of backreferences
     /g,writeImageTag);
     */
    text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeImageTag);

    //
    // Next, handle inline images:  ![alt text](url "optional title")
    // Don't forget: encode * and _

    /*
     text = text.replace(/
     (            // wrap whole match in $1
     !\[
     (.*?)        // alt text = $2
     \]
     \s?          // One optional whitespace character
     \(         // literal paren
     [ \t]*
     ()         // no id, so leave $3 empty
     <?(\S+?)>?     // src url = $4
     [ \t]*
     (          // $5
     (['"])     // quote char = $6
     (.*?)      // title = $7
     \6       // matching quote
     [ \t]*
     )?         // title is optional
     \)
     )
     /g,writeImageTag);
     */
    text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeImageTag);

    return text;
  };

  var writeImageTag = function(wholeMatch, m1, m2, m3, m4, m5, m6, m7) {
    var whole_match = m1;
    var alt_text = m2;
    var link_id = m3.toLowerCase();
    var url = m4;
    var title = m7;

    if (!title) title = "";

    if (url == "") {
      if (link_id == "") {
        // lower-case and turn embedded newlines into spaces
        link_id = alt_text.toLowerCase().replace(/ ?\n/g, " ");
      }
      url = "#" + link_id;

      if (g_urls[link_id] != undefined) {
        url = g_urls[link_id];
        if (g_titles[link_id] != undefined) {
          title = g_titles[link_id];
        }
      }
      else {
        return whole_match;
      }
    }

    alt_text = alt_text.replace(/"/g, "&quot;");
    url = escapeCharacters(url, "*_");
    var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

    // attacklab: Markdown.pl adds empty title attributes to images.
    // Replicate this bug.

    //if (title != "") {
    title = title.replace(/"/g, "&quot;");
    title = escapeCharacters(title, "*_");
    result += " title=\"" + title + "\"";
    //}

    result += " />";

    return result;
  };


  var _DoHeaders = function(text) {

    // Setext-style headers:
    //  Header 1
    //  ========
    //
    //  Header 2
    //  --------
    //
    text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
            function(wholeMatch, m1) {
              return hashBlock("<h1>" + _RunSpanGamut(m1) + "</h1>");
            });

    text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
            function(matchFound, m1) {
              return hashBlock("<h2>" + _RunSpanGamut(m1) + "</h2>");
            });

    // atx-style headers:
    //  # Header 1
    //  ## Header 2
    //  ## Header 2 with closing hashes ##
    //  ...
    //  ###### Header 6
    //

    /*
     text = text.replace(/
     ^(\#{1,6})       // $1 = string of #'s
     [ \t]*
     (.+?)          // $2 = Header text
     [ \t]*
     \#*            // optional closing #'s (not counted)
     \n+
     /gm, function() {...});
     */

    text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
            function(wholeMatch, m1, m2) {
              var h_level = m1.length;
              return hashBlock("<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">");
            });

    return text;
  };

  // This declaration keeps Dojo compressor from outputting garbage:
  var _ProcessListItems;

  //
  // Form HTML ordered (numbered) and unordered (bulleted) lists.
  //
  var _DoLists = function(text) {

    // attacklab: add sentinel to hack around khtml/safari bug:
    // http://bugs.webkit.org/show_bug.cgi?id=11231
    text += "~0";

    // Re-usable pattern to match any entirel ul or ol list:

    /*
     var whole_list = /
     (                  // $1 = whole list
     (                // $2
     [ ]{0,3}         // attacklab: g_tab_width - 1
     ([*+-]|\d+[.])       // $3 = first list item marker
     [ \t]+
     )
     [^\r]+?
     (                // $4
     ~0             // sentinel for workaround; should be $
     |
     \n{2,}
     (?=\S)
     (?!              // Negative lookahead for another list item marker
     [ \t]*
     (?:[*+-]|\d+[.])[ \t]+
     )
     )
     )/g
     */
    var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

    if (g_list_level) {
      text = text.replace(whole_list, function(wholeMatch, m1, m2) {
        var list = m1;
        var list_type = (m2.search(/[*+-]/g) > -1) ? "ul" : "ol";

        // Turn double returns into triple returns, so that we can make a
        // paragraph for the last item in a list, if necessary:
        list = list.replace(/\n{2,}/g, "\n\n\n");
        var result = _ProcessListItems(list);

        // Trim any trailing whitespace, to put the closing `</$list_type>`
        // up on the preceding line, to get it past the current stupid
        // HTML block parser. This is a hack to work around the terrible
        // hack that is the HTML block parser.
        result = result.replace(/\s+$/, "");
        result = "<" + list_type + ">" + result + "</" + list_type + ">\n";
        return result;
      });
    } else {
      whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
      text = text.replace(whole_list, function(wholeMatch, m1, m2, m3) {
        var runup = m1;
        var list = m2;

        var list_type = (m3.search(/[*+-]/g) > -1) ? "ul" : "ol";
        // Turn double returns into triple returns, so that we can make a
        // paragraph for the last item in a list, if necessary:
        var list = list.replace(/\n{2,}/g, "\n\n\n");
        var result = _ProcessListItems(list);
        result = runup + "<" + list_type + ">\n" + result + "</" + list_type + ">\n";
        return result;
      });
    }

    // attacklab: strip sentinel
    text = text.replace(/~0/, "");

    return text;
  };

  //
  //  Process the contents of a single ordered or unordered list, splitting it
  //  into individual list items.
  //
  _ProcessListItems = function(list_str) {
    // The $g_list_level global keeps track of when we're inside a list.
    // Each time we enter a list, we increment it; when we leave a list,
    // we decrement. If it's zero, we're not in a list anymore.
    //
    // We do this because when we're not inside a list, we want to treat
    // something like this:
    //
    //    I recommend upgrading to version
    //    8. Oops, now this line is treated
    //    as a sub-list.
    //
    // As a single paragraph, despite the fact that the second line starts
    // with a digit-period-space sequence.
    //
    // Whereas when we're inside a list (or sub-list), that line will be
    // treated as the start of a sub-list. What a kludge, huh? This is
    // an aspect of Markdown's syntax that's hard to parse perfectly
    // without resorting to mind-reading. Perhaps the solution is to
    // change the syntax rules such that sub-lists must start with a
    // starting cardinal number; e.g. "1." or "a.".

    g_list_level++;

    // trim trailing blank lines:
    list_str = list_str.replace(/\n{2,}$/, "\n");

    // attacklab: add sentinel to emulate \z
    list_str += "~0";

    /*
     list_str = list_str.replace(/
     (\n)?              // leading line = $1
     (^[ \t]*)            // leading whitespace = $2
     ([*+-]|\d+[.]) [ \t]+      // list marker = $3
     ([^\r]+?           // list item text   = $4
     (\n{1,2}))
     (?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
     /gm, function(){...});
     */
    list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
            function(wholeMatch, m1, m2, m3, m4) {
              var item = m4;
              var leading_line = m1;
              var leading_space = m2;

              if (leading_line || (item.search(/\n{2,}/) > -1)) {
                item = _RunBlockGamut(_Outdent(item));
              }
              else {
                // Recursion for sub-lists:
                item = _DoLists(_Outdent(item));
                item = item.replace(/\n$/, ""); // chomp(item)
                item = _RunSpanGamut(item);
              }

              return  "<li>" + item + "</li>\n";
            }
            );

    // attacklab: strip sentinel
    list_str = list_str.replace(/~0/g, "");

    g_list_level--;
    return list_str;
  };


  //
  //  Process Markdown `<pre><code>` blocks.
  //
  var _DoCodeBlocks = function(text) {

    /*
     text = text.replace(text,
     /(?:\n\n|^)
     (                // $1 = the code block -- one or more lines, starting with a space/tab
     (?:
     (?:[ ]{4}|\t)      // Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
     .*\n+
     )+
     )
     (\n*[ ]{0,3}[^ \t\n]|(?=~0)) // attacklab: g_tab_width
     /g,function(){...});
     */

    // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
    text += "~0";

    text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, function(wholeMatch, m1, m2) {
      var codeblock = m1;
      var nextChar = m2;

      codeblock = _EncodeCode(_Outdent(codeblock));
      codeblock = _Detab(codeblock);
      codeblock = codeblock.replace(/^\n+/g, ""); // trim leading newlines
      codeblock = codeblock.replace(/\n+$/g, ""); // trim trailing whitespace

      codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

      return hashBlock(codeblock) + nextChar;
    });

    // attacklab: strip sentinel
    text = text.replace(/~0/, "");

    return text;
  };

  var hashBlock = function(text) {
    text = text.replace(/(^\n+|\n+$)/g, "");
    return "\n\n~K" + (g_html_blocks.push(text) - 1) + "K\n\n";
  };


  //
  //   *  Backtick quotes are used for <code></code> spans.
  //
  //   *  You can use multiple backticks as the delimiters if you want to
  //   include literal backticks in the code span. So, this input:
  //
  //     Just type ``foo `bar` baz`` at the prompt.
  //
  //     Will translate to:
  //
  //     <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
  //
  //  There's no arbitrary limit to the number of backticks you
  //  can use as delimters. If you need three consecutive backticks
  //  in your code, use four for delimiters, etc.
  //
  //  *  You can use spaces to get literal backticks at the edges:
  //
  //     ... type `` `bar` `` ...
  //
  //     Turns to:
  //
  //     ... type <code>`bar`</code> ...
  //
  var _DoCodeSpans = function(text) {
    /*
     text = text.replace(/
     (^|[^\\])          // Character before opening ` can't be a backslash
     (`+)           // $2 = Opening run of `
     (              // $3 = The code block
     [^\r]*?
     [^`]         // attacklab: work around lack of lookbehind
     )
     \2             // Matching closer
     (?!`)
     /gm, function(){...});
     */

    text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
            function(wholeMatch, m1, m2, m3, m4) {
              var c = m3;
              c = c.replace(/^([ \t]*)/g, "");  // leading whitespace
              c = c.replace(/[ \t]*$/g, "");  // trailing whitespace
              c = _EncodeCode(c);
              return m1 + "<code>" + c + "</code>";
            });

    return text;
  };


  //
  // Encode/escape certain characters inside Markdown code runs.
  // The point is that in code, these characters are literals,
  // and lose their special Markdown meanings.
  //
  var _EncodeCode = function(text) {
    // Encode all ampersands; HTML entities are not
    // entities within a Markdown code span.
    text = text.replace(/&/g, "&amp;");

    // Do the angle bracket song and dance:
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");

    // Now, escape characters that are magic in Markdown:
    text = escapeCharacters(text, "\*_{}[]\\", false);

    return text;
  };


  var _DoItalicsAndBold = function(text) {

    // <strong> must go first:
    text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
            "<strong>$2</strong>");

    text = text.replace(/(\w)_(\w)/g, "$1~E95E$2"); // ** GFM **  "~E95E" == escaped "_"
    text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
            "<em>$2</em>");

    return text;
  };


  var _DoBlockQuotes = function(text) {

    /*
     text = text.replace(/
     (                // Wrap whole match in $1
     (
     ^[ \t]*>[ \t]?     // '>' at the start of a line
     .+\n         // rest of the first line
     (.+\n)*          // subsequent consecutive lines
     \n*            // blanks
     )+
     )
     /gm, function(){...});
     */

    text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
            function(wholeMatch, m1) {
              var bq = m1;

              // attacklab: hack around Konqueror 3.5.4 bug:
              // "----------bug".replace(/^-/g,"") == "bug"

              bq = bq.replace(/^[ \t]*>[ \t]?/gm, "~0");  // trim one level of quoting

              // attacklab: clean up hack
              bq = bq.replace(/~0/g, "");

              bq = bq.replace(/^[ \t]+$/gm, "");    // trim whitespace-only lines
              bq = _RunBlockGamut(bq);        // recurse

              bq = bq.replace(/(^|\n)/g, "$1  ");
              // These leading spaces screw with <pre> content, so we need to fix that:
              bq = bq.replace(
                      /(\s*<pre>[^\r]+?<\/pre>)/gm,
                      function(wholeMatch, m1) {
                        var pre = m1;
                        // attacklab: hack around Konqueror 3.5.4 bug:
                        pre = pre.replace(/^  /mg, "~0");
                        pre = pre.replace(/~0/g, "");
                        return pre;
                      });

              return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
            });
    return text;
  };


  //
  //  Params:
  //    $text - string to process with html <p> tags
  //
  var _FormParagraphs = function(text) {

    // Strip leading and trailing lines:
    text = text.replace(/^\n+/g, "");
    text = text.replace(/\n+$/g, "");

    var grafs = text.split(/\n{2,}/g);
    var grafsOut = new Array();

    //
    // Wrap <p> tags.
    //
    var end = grafs.length;
    for (var i = 0; i < end; i++) {
      var str = grafs[i];

      // if this is an HTML marker, copy it
      if (str.search(/~K(\d+)K/g) >= 0) {
        grafsOut.push(str);
      }
      else if (str.search(/\S/) >= 0) {
        str = _RunSpanGamut(str);
        str = str.replace(/\n/g, "<br />");  // ** GFM **
        str = str.replace(/^([ \t]*)/g, "<p>");
        str += "</p>";
        grafsOut.push(str);
      }

    }

    //
    // Unhashify HTML blocks
    //
    end = grafsOut.length;
    for (var i = 0; i < end; i++) {
      // if this is a marker for an html block...
      while (grafsOut[i].search(/~K(\d+)K/) >= 0) {
        var blockText = g_html_blocks[RegExp.$1];
        blockText = blockText.replace(/\$/g, "$$$$"); // Escape any dollar signs
        grafsOut[i] = grafsOut[i].replace(/~K\d+K/, blockText);
      }
    }

    return grafsOut.join("\n\n");
  };

  // Smart processing for ampersands and angle brackets that need to be encoded.
  var _EncodeAmpsAndAngles = function(text) {

    // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
    //   http://bumppo.net/projects/amputator/
    text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");

    // Encode naked <'s
    text = text.replace(/<(?![a-z\/?\$!])/gi, "&lt;");

    return text;
  };

  //
  //   Parameter:  String.
  //   Returns: The string, with after processing the following backslash
  //         escape sequences.
  //
  var _EncodeBackslashEscapes = function(text) {
    // attacklab: The polite way to do this is with the new
    // escapeCharacters() function:
    //
    //  text = escapeCharacters(text,"\\",true);
    //  text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
    //
    // ...but we're sidestepping its use of the (slow) RegExp constructor
    // as an optimization for Firefox.  This function gets called a LOT.

    text = text.replace(/\\(\\)/g, escapeCharacters_callback);
    text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g, escapeCharacters_callback);
    return text;
  };

  var _DoAutoLinks = function(text) {

    text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, "<a href=\"$1\">$1</a>");

    // Email addresses: <address@domain.foo>

    /*
     text = text.replace(/
     <
     (?:mailto:)?
     (
     [-.\w]+
     \@
     [-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
     )
     >
     /gi, _DoAutoLinks_callback());
     */
    text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, function(wholeMatch, m1) {
      return _EncodeEmailAddress(_UnescapeSpecialChars(m1));
    });

    return text;
  };

  //
  //  Input: an email address, e.g. "foo@example.com"
  //
  //  Output: the email address as a mailto link, with each character
  //  of the address encoded as either a decimal or hex entity, in
  //  the hopes of foiling most address harvesting spam bots. E.g.:
  //
  //  <a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
  //     x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
  //     &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
  //
  //  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
  //  mailing list: <http://tinyurl.com/yu7ue>
  //
  var _EncodeEmailAddress = function(addr) {

    // attacklab: why can't javascript speak hex?
    function char2hex(ch) {
      var hexDigits = '0123456789ABCDEF';
      var dec = ch.charCodeAt(0);
      return(hexDigits.charAt(dec >> 4) + hexDigits.charAt(dec & 15));
    }

    var encode = [
      function(ch) { return "&#" + ch.charCodeAt(0) + ";" },
      function(ch) { return "&#x" + char2hex(ch) + ";" },
      function(ch) { return ch }
    ];

    addr = "mailto:" + addr;

    addr = addr.replace(/./g, function(ch) {
      if (ch == "@") {
        // this *must* be encoded. I insist.
        ch = encode[Math.floor(Math.random() * 2)](ch);
      } else if (ch != ":") {
        // leave ':' alone (to spot mailto: later)
        var r = Math.random();
        // roughly 10% raw, 45% hex, 45% dec
        ch = (r > .9 ? encode[2](ch) : r > .45 ? encode[1](ch) : encode[0](ch));
      }
      return ch;
    });

    addr = "<a href=\"" + addr + "\">" + addr + "</a>";
    addr = addr.replace(/">.+:/g, "\">"); // strip the mailto: from the visible part

    return addr;
  };

  //
  // Swap back in all the special characters we've hidden.
  //
  var _UnescapeSpecialChars = function(text) {
    text = text.replace(/~E(\d+)E/g, function(wholeMatch, m1) {
      var charCodeToReplace = parseInt(m1);
      return String.fromCharCode(charCodeToReplace);
    });
    return text;
  };

  //
  // Remove one level of line-leading tabs or spaces
  //
  var _Outdent = function(text) {

    // attacklab: hack around Konqueror 3.5.4 bug:
    // "----------bug".replace(/^-/g,"") == "bug"

    text = text.replace(/^(\t|[ ]{1,4})/gm, "~0"); // attacklab: g_tab_width

    // attacklab: clean up hack
    text = text.replace(/~0/g, "");

    return text;
  };

  // attacklab: Detab's completely rewritten for speed.
  // In perl we could fix it by anchoring the regexp with \G.
  // In javascript we're less fortunate.
  var _Detab = function(text) {
    // expand first n-1 tabs
    text = text.replace(/\t(?=\t)/g, "    "); // attacklab: g_tab_width

    // replace the nth with two sentinels
    text = text.replace(/\t/g, "~A~B");

    // use the sentinel to anchor our regex so it doesn't explode
    text = text.replace(/~B(.+?)~A/g, function(wholeMatch, m1, m2) {
      var leadingText = m1;
      var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width

      // there *must* be a better way to do this:
      for (var i = 0; i < numSpaces; i++) leadingText += " ";

      return leadingText;
    });

    // clean up sentinels
    text = text.replace(/~A/g, "    ");  // attacklab: g_tab_width
    text = text.replace(/~B/g, "");

    return text;
  };


  //  attacklab: Utility functions
  var escapeCharacters = function(text, charsToEscape, afterBackslash) {
    // First we have to escape the escape characters so that
    // we can build a character class out of them
    var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g, "\\$1") + "])";

    if (afterBackslash) {
      regexString = "\\\\" + regexString;
    }

    var regex = new RegExp(regexString, "g");
    text = text.replace(regex, escapeCharacters_callback);

    return text;
  };


  var escapeCharacters_callback = function(wholeMatch, m1) {
    var charCodeToEscape = m1.charCodeAt(0);
    return "~E" + charCodeToEscape + "E";
  };

};
(function() {

  this.TopFan || (this.TopFan = {});

  this.TopFan.version = '0.0.1';

  this.TopFan.Models = {};

  this.TopFan.Panels = {};

  this.TopFan.Services = {};

  this.TopFan.Observers = {};

  this.TopFan.Managers = {};

  this.TopFan.Delegates = {};

  this.Constants || (this.Constants = {});

  this.Constants.MENU_OPEN = 'menu-open';

  this.Constants.DIVIDER = 'divider';

  this.Constants.DASHBOARD_PATH = '/dashboard';

  this.Constants.CHALLENGES_PATH = '/challenges';

  this.Constants.LOGIN_PATH = '/login';

  this.Constants.SIGNUP_PATH = '/signup';

  this.Constants.ACCOUNT_PATH = '/account';

  this.Constants.REWARDS_PATH = '/rewards';

  this.Constants.OTHER_APPS_PATH = '/other_apps';

  this.Constants.HELP_INFO_PATH = '/help_info';

  this.Constants.MUSIC_PLAYER_PATH = '/topfan_music';

  this.Constants.FAVORITES_PATH = '/favorites';

  this.Constants.SEARCH_PATH = '/search';

  this.Constants.ENTRY_ROUTE = '/entry/:id';

  this.Constants.ENTRY_PATH = '/entry';

  this.Constants.SOCIAL_FEED_PATH = '/social_feed';

  this.Constants.MOBILE_CONCIERGE_PATH = '/mobile_concierge';

  this.Constants.MOBILE_CONCIERGE_RESULTS_ROUTE = '/mobile_concierge_results/:ids';

  this.Constants.MOBILE_CONCIERGE_RESULTS_PATH = '/mobile_concierge_results';

  this.Constants.SOCIAL_FACEBOOK = 'facebook';

  this.Constants.SOCIAL_NEWS = 'news';

  this.Constants.SOCIAL_TWITTER = 'twitter';

  this.Constants.SOCIAL_TALKCHAIN = 'talkchain';

  this.Constants.ALL_CATEGORIES = 'All Categories';

  this.Constants.SHORT_DATE = 'MMM DD';

  this.Constants.LONG_DATE = 'dddd MMMM D, YYYY';

  this.Constants.GCM_SENDER_ID = '212268300745';

  this.Constants.MAP_MARKER_SVG = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n   width=\"23.721px\" height=\"40.034px\" viewBox=\"0 0 23.721 40.034\" enable-background=\"new 0 0 23.721 40.034\" xml:space=\"preserve\">\n  <g>\n    <g>\n      <path fill=\"#FFFFFF\" stroke=\"#FFFFFF\" stroke-width=\"4\" stroke-miterlimit=\"10\" d=\"M11.861,2.986\n        c-4.894,0-8.875,3.981-8.875,8.875c0,1.113,0.243,2.326,0.684,3.416c0.023,0.055,0.055,0.121,0.087,0.187l0.047,0.098\n        l8.057,17.375l8.054-17.368l0.05-0.105c0.031-0.066,0.064-0.131,0.092-0.199l0.016-0.047c0.444-1.095,0.663-2.214,0.663-3.356\n        C20.736,6.967,16.754,2.986,11.861,2.986z M11.861,15.805c-2.175,0-3.945-1.769-3.945-3.945s1.77-3.945,3.945-3.945\n        s3.945,1.77,3.945,3.945S14.036,15.805,11.861,15.805z\"/>\n    </g>\n    <g>\n      <path fill=\"FILL_COLOR\" stroke=\"#333333\" d=\"M12.119,2.986c-4.894,0-8.875,3.981-8.875,8.875c0,1.113,0.243,2.326,0.684,3.416\n        c0.023,0.055,0.055,0.121,0.087,0.187l0.047,0.098l8.057,17.375l8.054-17.368l0.05-0.105c0.031-0.066,0.064-0.131,0.092-0.199\n        l0.016-0.047c0.444-1.095,0.663-2.214,0.663-3.356C20.994,6.967,17.013,2.986,12.119,2.986z M12.119,15.805\n        c-2.175,0-3.945-1.769-3.945-3.945s1.77-3.945,3.945-3.945s3.945,1.77,3.945,3.945S14.294,15.805,12.119,15.805z\"/>\n    </g>\n  </g>\n</svg>";

  this.Constants.MAP_CLUSTER_MARKER_SVG = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n   width=\"SIZEpx\" height=\"SIZEpx\" viewBox=\"0 0 SIZE SIZE\" enable-background=\"new 0 0 SIZE SIZE\" xml:space=\"preserve\">\n  <circle fill=\"#FFFFFF\" cx=\"RADIUS\" cy=\"RADIUS\" r=\"RADIUS\"/>\n  <circle fill=\"FILL_COLOR\" stroke=\"#333333\" stroke-miterlimit=\"10\" cx=\"RADIUS\" cy=\"RADIUS\" r=\"FILL_RADIUS\"/>\n</svg>";

}).call(this);
(function() {
  var Bindable;

  Bindable = (function() {

    function Bindable(scope, dataKey) {
      this.scope = scope != null ? scope : $('body');
      this.dataKey = dataKey != null ? dataKey : 'bindable';
    }

    Bindable.prototype.bindAll = function() {
      var bindables, selector,
        _this = this;
      selector = "[data-" + this.dataKey + "]";
      bindables = $(selector, this.scope);
      this.refs || (this.refs = []);
      return _.each(bindables, function(el) {
        return _this.refs.push(Bindable.bind(el, _this.dataKey));
      });
    };

    Bindable.prototype.unbindAll = function() {
      if (!this.refs) {
        return;
      }
      _.each(this.refs, function(ref) {
        if (typeof ref.dispose === "function") {
          ref.dispose();
        }
        return ref = null;
      });
      this.refs.splice(0);
      return delete this.refs;
    };

    Bindable.getClass = function(key) {
      return Bindable.registry[key]["class"];
    };

    Bindable.register = function(key, klass) {
      var _ref;
      if ((_ref = this.registry) == null) {
        this.registry = {};
      }
      this.registry[key] = {
        'class': klass
      };
      return null;
    };

    Bindable.bind = function(el, dataKey) {
      var item, key;
      if (dataKey == null) {
        dataKey = 'bindable';
      }
      key = $(el).data(dataKey);
      item = Bindable.registry[key];
      return new item["class"](el);
    };

    return Bindable;

  })();

  this.Bindable = Bindable;

}).call(this);
(function() {
  var Disabler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Disabler = (function() {

    Disabler.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    function Disabler() {
      this.cancelAndTrigger = __bind(this.cancelAndTrigger, this);

      var styleOptions;
      this.el = $('<div>');
      styleOptions = {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: '.3',
        width: '100%',
        height: '100%'
      };
      this.el.css(styleOptions);
      this.el.on('click tap touchstart touchmove', this.cancelAndTrigger);
    }

    Disabler.prototype.cancelAndTrigger = function(e) {
      e.preventDefault();
      e.stopPropagation();
      return this.el.trigger('interaction');
    };

    Disabler.prototype.disable = function(disableEl, show) {
      if (show == null) {
        show = false;
      }
      if (!disableEl) {
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.error === "function") {
            console.error('Disabler Error: You must provide an element or selector to disable...');
          }
        }
        return;
      } else if (show) {
        this.el.css({
          backgroundColor: '#333'
        });
      } else {
        this.el.css({
          backgroundColor: 'transparent'
        });
      }
      this.disableEl = $(disableEl);
      this.el.css({
        zIndex: this.disableEl.css('zIndex') + 1,
        width: this.disableEl.width() || $(window).width(),
        height: this.disableEl.height() || $(window).height()
      });
      return this.disableEl.append(this.el);
    };

    Disabler.prototype.detach = function() {
      var _this = this;
      return setTimeout(function() {
        return _this.el.detach();
      }, 400);
    };

    return Disabler;

  })();

  this.Disabler = Disabler;

}).call(this);

(function() {
  this.JST || (this.JST = {});
  this.JST["app_menu/templates/app_menu"] = (function(context) {
    return (function() {
      var $c, $e, $o, section, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div id='menu_button'>\n  <div class='arrow'></div>\n</div>\n<div data-bindable='scrollable-content'>\n  <ul>");
  _ref = this.sections;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    section = _ref[_i];
    $o.push("    <li>");
    if (section[1] === Constants.DIVIDER) {
      $o.push("      <div class='divider'>" + ($e($c(section[0]))) + "</div>");
    } else {
      $o.push("      <div class='" + (['menu-item', "" + ($e($c(this.activePath === section[1] ? 'active' : '')))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' data-path='" + ($e($c(section[1]))) + "' data-external-link='" + ($e($c((_ref1 = section[2]) != null ? _ref1.external_link : void 0))) + "' data-open-externally-on-ios='" + ($e($c(((_ref2 = section[2]) != null ? _ref2.open_externally_on_ios : void 0) ? 'yes' : 'no'))) + "' data-open-externally-on-android='" + ($e($c(((_ref3 = section[2]) != null ? _ref3.open_externally_on_android : void 0) ? 'yes' : 'no'))) + "' data-use-restricted-internal-browser='" + ($e($c(((_ref4 = section[2]) != null ? _ref4.use_restricted_internal_browser : void 0) ? 'yes' : 'no'))) + "'>\n        <span class='icon " + (((_ref5 = section[2]) != null ? _ref5.icon : void 0) ? section[2].icon : '') + "'>" + ($c(section[0])) + "</span>");
      if (section[3] && section[3] > 0) {
        $o.push("        <span class='badge'>" + ($e($c(section[3]))) + "</span>");
      }
      $o.push("      </div>");
    }
    $o.push("    </li>");
      }
      $o.push("  </ul>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["app_menu/templates/vm_app_menu"] = (function(context) {
    return (function() {
      var $c, $e, $o, currentClient, list_section, section, _i, _j, _len, _len1, _ref, _ref1;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      currentClient = TopFan.Models.Client.currentClient();
  if (currentClient.color_palette_size === "3inRow") {
    $o.push("<div class='hide-menu toggle-menu'></div>\n<div data-bindable='scrollable-content'>\n  <div class='grid-list_sections_next' data-bindable='icon-grid'>\n    <div class='icon vm_dashboard' style='background-color: #43C7F4;' data-slug='dashboard'></div>");
    _ref = this.sections;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      list_section = _ref[_i];
      section = list_section[2];
      if (!section) {
        continue;
      }
      $o.push("    <div class='" + (['icon', "" + ($e($c(section.icon))) + " " + ($e($c(this.activePath === list_section[1] ? 'active' : '')))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(section.color))) + ";background-image:url(\"" + ($e($c(section.icon_path))) + "\") !important;' data-slug='" + ($e($c(section.slug))) + "' data-external-link='" + ($e($c(section.external_link))) + "' data-open-externally-on-ios='" + ($e($c(section.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-on-android='" + ($e($c(section.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-internal-browser='" + ($e($c(section.use_restricted_internal_browser ? 'yes' : 'no'))) + "'></div>");
    }
    $o.push("  </div>\n</div>");
  } else {
    $o.push("<div class='hide-menu toggle-menu'></div>\n<div data-bindable='scrollable-content'>\n  <div class='grid-list_sections' data-bindable='icon-grid'>\n    <div class='icon vm_dashboard' style='background-color: #43C7F4;' data-slug='dashboard'></div>");
    _ref1 = this.sections;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      list_section = _ref1[_j];
      section = list_section[2];
      if (!section) {
        continue;
      }
      $o.push("    <div class='" + (['icon', "" + ($e($c(section.icon))) + " " + ($e($c(this.activePath === list_section[1] ? 'active' : '')))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(section.color))) + ";background-image:url(\"" + ($e($c(section.icon_path))) + "\") !important;' data-slug='" + ($e($c(section.slug))) + "' data-external-link='" + ($e($c(section.external_link))) + "' data-open-externally-on-ios='" + ($e($c(section.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-on-android='" + ($e($c(section.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-internal-browser='" + ($e($c(section.use_restricted_internal_browser ? 'yes' : 'no'))) + "'></div>");
    }
    $o.push("  </div>\n</div>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.AppMenu = (function(_super) {

    __extends(AppMenu, _super);

    function AppMenu() {
      this.toggleMenu = __bind(this.toggleMenu, this);

      this.openMenu = __bind(this.openMenu, this);

      this.closeMenu = __bind(this.closeMenu, this);

      this.isMenuOpen = __bind(this.isMenuOpen, this);

      this.onTransitionEnd = __bind(this.onTransitionEnd, this);

      this.activateLinkForPath = __bind(this.activateLinkForPath, this);

      this.deactivateLinks = __bind(this.deactivateLinks, this);

      this.updateTalkChainBadge = __bind(this.updateTalkChainBadge, this);

      this.updateRewardsBadge = __bind(this.updateRewardsBadge, this);

      this.updateChallengesBadge = __bind(this.updateChallengesBadge, this);

      this.itemWasTapped = __bind(this.itemWasTapped, this);

      this.documentTouchEnd = __bind(this.documentTouchEnd, this);

      this.render = __bind(this.render, this);

      this.init = __bind(this.init, this);
      return AppMenu.__super__.constructor.apply(this, arguments);
    }

    AppMenu.prototype.el = 'nav#app_menu';

    AppMenu.prototype.events = {
      'tap li div': 'itemWasTapped',
      'tap .toggle-menu': 'toggleMenu'
    };

    AppMenu.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    AppMenu.prototype.init = function() {
      this.body = $(document.body);
      this.viewport = $('article.viewport');
      return $(window).on('touchend', this.documentTouchEnd);
    };

    AppMenu.prototype.render = function() {
      var _ref, _ref1;
      if ((_ref = this.bindable) == null) {
        this.bindable = new Bindable(this.el);
      }
      this.bindable.unbindAll();
      if (TopFan.AppState.getInstance().isTopFan()) {
        this.el.css({
          width: $(window).width() - 46
        });
        this.html(JST['app_menu/templates/app_menu']({
          sections: this.sectionsToRender(),
          activePath: this.currentPath
        }));
        this.disabler = Disabler.getInstance();
      } else {
        this.html(JST['app_menu/templates/vm_app_menu']({
          sections: this.sectionsToRender(),
          activePath: this.currentPath
        }));
        $('.toggle-menu.hide-menu').css({
          width: $(window).width() - 74
        });
        if ($('.floating-nav').length === 0) {
          $('#loader').after('<nav class="floating-nav">');
          new TopFan.FloatingNav($('.floating-nav'));
        }
      }
      this.refreshElements();
      this.bindable.bindAll();
      this.activateLinkForPath(Spine.Route.path);
      this.updateChallengesBadge();
      this.updateRewardsBadge();
      this.updateTalkChainBadge();
      return (_ref1 = this.el[0]) != null ? _ref1.addEventListener('webkitTransitionEnd', this.onTransitionEnd) : void 0;
    };

    AppMenu.prototype.documentTouchEnd = function(e) {
      if (TopFan.AppState.getInstance().isTopFan()) {
        if (!this.isMenuOpen() && e.changedTouches[0].clientY <= 44) {
          e.preventDefault();
          return this.openMenu();
        } else if (this.isMenuOpen() && e.changedTouches[0].clientX > $(window).width() - 46) {
          e.preventDefault();
          return this.closeMenu();
        }
      }
    };

    AppMenu.prototype.sectionWasChanged = function(newPath) {
      this.currentPath = newPath;
      this.deactivateLinks();
      this.activateLinkForPath(newPath);
      return this.closeMenu();
    };

    AppMenu.prototype.itemWasTapped = function(e) {
      var externalLink, itemEl, openExternallyAndroid, openExternallyIOS, path, useRestrictedBrowser;
      itemEl = $(e.target).closest('[data-path]');
      path = itemEl.data('path');
      externalLink = itemEl.data('external-link');
      if (!(path || externalLink)) {
        return;
      }
      if (path === Constants.SOCIAL_TALKCHAIN) {
        TalkChain.getInstance().presentUI();
      }
      if (externalLink) {
        openExternallyIOS = itemEl.data('open-externally-on-ios') === 'yes';
        openExternallyAndroid = itemEl.data('open-externally-on-android') === 'yes';
        useRestrictedBrowser = itemEl.data('use-restricted-internal-browser') === 'yes';
        return TopFan.ExternalLinkHelper.open(externalLink, openExternallyIOS, openExternallyAndroid, useRestrictedBrowser);
      } else {
        Spine.Route.path = '';
        this.navigate(path);
        return Spine.Route.change();
      }
    };

    AppMenu.prototype.updateChallengesBadge = function() {
      return this.addBadgeToPath(Constants.CHALLENGES_PATH, TopFan.Models.Challenge.count());
    };

    AppMenu.prototype.updateRewardsBadge = function() {
      return this.addBadgeToPath(Constants.REWARDS_PATH, TopFan.Models.Reward.count());
    };

    AppMenu.prototype.updateTalkChainBadge = function() {
      return this.addBadgeToPath(Constants.SOCIAL_TALKCHAIN, TalkChain.getInstance().badge);
    };

    AppMenu.prototype.deactivateLinks = function() {
      return this.el.find('[data-path]').removeClass('active');
    };

    AppMenu.prototype.activateLinkForPath = function(path) {
      var selectorStr;
      selectorStr = "[data-path='" + path + "']";
      return $(selectorStr).addClass('active');
    };

    AppMenu.prototype.onTransitionEnd = function(e) {
      if (this.body.hasClass(Constants.MENU_OPEN)) {
        return this.body.addClass('menu-opened');
      }
    };

    AppMenu.prototype.sectionsToRender = function() {
      return TopFan.Managers.ContentSectionManager.getInstance().sectionsForMenu();
    };

    AppMenu.prototype.isMenuOpen = function() {
      return this.body.hasClass('menu-opened') && this.body.hasClass(Constants.MENU_OPEN);
    };

    AppMenu.prototype.closeMenu = function() {
      var _ref, _ref1;
      if (this.isMenuOpen()) {
        if ((_ref = this.disabler) != null) {
          _ref.detach();
        }
        this.body.removeClass('menu-opened');
        this.body.removeClass(Constants.MENU_OPEN);
        if (((_ref1 = $.os) != null ? _ref1.android : void 0) != null) {
          return this.el.removeClass('activated-menu');
        }
      }
    };

    AppMenu.prototype.openMenu = function() {
      var _ref;
      if ((_ref = this.disabler) != null) {
        _ref.disable('.panel.active');
      }
      TopFan.SoftKeyboard.hide();
      document.activeElement.blur();
      this.el.addClass('activated-menu');
      return this.body.addClass(Constants.MENU_OPEN);
    };

    AppMenu.prototype.toggleMenu = function() {
      if (this.isMenuOpen()) {
        return this.closeMenu();
      } else {
        return this.openMenu();
      }
    };

    AppMenu.prototype.addBadgeToPath = function(path, count) {
      var badgeEl, divEl, selector;
      selector = "[data-path='" + path + "']";
      divEl = $(selector);
      badgeEl = $('.badge', divEl);
      if (count > 0 && badgeEl.length) {
        return badgeEl.html(count);
      } else if (count > 0 && divEl.length) {
        return divEl.append("<span class='badge'>" + count + "</span>");
      } else if (badgeEl) {
        return badgeEl.remove();
      }
    };

    return AppMenu;

  })(Spine.Controller);

}).call(this);
(function() {
  var ZeptoPlatformHelper;

  ZeptoPlatformHelper = (function() {

    function ZeptoPlatformHelper(el) {
      this.el = $(el);
      this.build();
    }

    ZeptoPlatformHelper.prototype.build = function() {
      if ($.os) {
        this.version = $.os.version;
        if ($.os.android) {
          this.buildAndroid();
        }
        if ($.os.blackberry) {
          this.buildBlackberry();
        }
        if ($.os.ios) {
          this.buildIOS();
        }
        if ($.os.ipad) {
          this.buildIPad();
        }
        if ($.os.iphone) {
          this.buildIPhone();
        }
        if ($.os.touchpad) {
          this.buildTouchPad();
        }
        if ($.os.webos) {
          return this.buildWebOS();
        }
      }
    };

    ZeptoPlatformHelper.prototype.buildAndroid = function() {};

    ZeptoPlatformHelper.prototype.buildBlackberry = function() {};

    ZeptoPlatformHelper.prototype.buildIOS = function() {};

    ZeptoPlatformHelper.prototype.buildIPad = function() {};

    ZeptoPlatformHelper.prototype.buildIPhone = function() {};

    ZeptoPlatformHelper.prototype.buildTouchPad = function() {};

    ZeptoPlatformHelper.prototype.buildWebOS = function() {};

    ZeptoPlatformHelper.prototype.dispose = function() {
      if ($.os) {
        if ($.os.android) {
          this.disposeAndroid();
        }
        if ($.os.blackberry) {
          this.disposeBlackberry();
        }
        if ($.os.ios) {
          this.disposeIOS();
        }
        if ($.os.ipad) {
          this.disposeIPad();
        }
        if ($.os.iphone) {
          this.disposeIPhone();
        }
        if ($.os.touchpad) {
          this.disposeTouchPad();
        }
        if ($.os.webos) {
          return this.disposeWebOS();
        }
      }
    };

    ZeptoPlatformHelper.prototype.disposeAndroid = function() {};

    ZeptoPlatformHelper.prototype.disposeBlackberry = function() {};

    ZeptoPlatformHelper.prototype.disposeIOS = function() {};

    ZeptoPlatformHelper.prototype.disposeIPad = function() {};

    ZeptoPlatformHelper.prototype.disposeIPhone = function() {};

    ZeptoPlatformHelper.prototype.disposeTouchPad = function() {};

    ZeptoPlatformHelper.prototype.disposeWebOS = function() {};

    return ZeptoPlatformHelper;

  })();

  this.ZeptoPlatformHelper = ZeptoPlatformHelper;

}).call(this);
(function() {
  var _ref;

  if ((_ref = window.utensils) == null) {
    window.utensils = {};
  }

}).call(this);

utensils.MouseAndTouchTracker = function( element, callback, isMouseUpTracking, disabledElements ) {
  var Point2d = function( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
  };

  // positioning / tracking coordinates
  this.container_position = new Point2d();
  this.touchstart = new Point2d();
  this.touchcurrent = new Point2d();
  this.touchmovedlast = new Point2d();
  this.touchmoved = new Point2d();
  this.touchspeed = new Point2d();

  // state flags
  this.is_touching = false;
  this.is_touch_capable = false;
  this.has_moved = false;
  this.touch_is_inside = false;  // helps with enter/leave events

  // store parameters
  this.container = element;
  this.callback = callback;
  this.is_mouseup_tracking = isMouseUpTracking;
  disabledElements = disabledElements || '';
  this.disabled_elements = disabledElements.split(' ') || [];
  this.findPosHelper = null;

  // add touch event listeners with scope for removal
  var self = this;
  this.startFunction = function(e){ self.onStart(e); };
  this.moveFunction = function(e){ self.onMove(e); if( navigator.userAgent.match(/MSIE/i) ) return false; };  // helps protect against disabled children in IE
  this.endFunction = function(e){ self.onEnd(e); };
  this.endDocumentFunction = function(e){ if( self.is_touching ) self.onEnd(e); };

  // add mouse event listeners
  if( this.container.attachEvent ) this.container.attachEvent( "onmousedown", this.startFunction ); else this.container.addEventListener( "mousedown", this.startFunction, false );
  if( this.container.attachEvent ) this.container.attachEvent( "onmouseup", this.endFunction ); else this.container.addEventListener( "mouseup", this.endFunction, false );
  if( document.attachEvent ) document.attachEvent( "onmouseup", this.endDocumentFunction ); else document.addEventListener( "mouseup", this.endDocumentFunction, false );
  if( document.attachEvent ) document.attachEvent( "onmousemove", this.moveFunction ); else document.addEventListener( "mousemove", this.moveFunction, false );

  // add touch listening (non-IE browsers)
  if( !this.container.attachEvent ) {
    this.container.addEventListener( "touchstart", this.startFunction, false );
    this.container.addEventListener( "touchend", this.endFunction, false );
    this.container.addEventListener( "touchcancel", this.endFunction, false );
    document.addEventListener( "touchmove", this.moveFunction, false );
    document.addEventListener( "touchend", this.endDocumentFunction, false );
  }

  // hmm...
  this.recurseDisableElements( this.container ); // !this.is_mouseup_tracking  // if(!navigator.userAgent.match(/Android/i))
}

// add static constants
utensils.MouseAndTouchTracker.state_start = 'TOUCH_START';
utensils.MouseAndTouchTracker.state_move = 'TOUCH_MOVE';
utensils.MouseAndTouchTracker.state_end = 'TOUCH_END';
utensils.MouseAndTouchTracker.state_enter = 'TOUCH_ENTER';
utensils.MouseAndTouchTracker.state_leave = 'TOUCH_LEAVE';

// prevent clicking/dragging on children from interfering with container's dragging
utensils.MouseAndTouchTracker.prototype.recurseDisableElements = function ( elem ) {
  if( elem ) {
    // disable clicking/dragging on selected element types
    if( elem.tagName && this.disabled_elements.indexOf( elem.tagName.toLowerCase() ) != -1 ) {  //  console.log('disabling: = '+elem.tagName.toLowerCase());
      try {
        elem.onmousedown = function(e){ return false; };
        elem.onselectstart = function(){ return false; };
      } catch(err) {}
    }
    // loop through children and do the same
    if( elem.childNodes.length > 0 ){
      for( var i=0; i < elem.childNodes.length; i++ ) {
        this.recurseDisableElements( elem.childNodes[i] );
      }
    }
  }
};

utensils.MouseAndTouchTracker.prototype.disposeTouchListeners = function () {
  this.container.removeEventListener( "touchstart", this.startFunction, false );
  this.container.removeEventListener( "touchend", this.endFunction, false );
  this.container.removeEventListener( "touchcancel", this.endFunction, false );
  document.removeEventListener( "touchmove", this.moveFunction, false );
  document.removeEventListener( "touchend", this.endDocumentFunction, false );
};

utensils.MouseAndTouchTracker.prototype.disposeMouseListeners = function () {
  if( this.container.attachEvent ) this.container.detachEvent( "onmousedown", this.startFunction ); else this.container.removeEventListener( "mousedown", this.startFunction, false );
  if( this.container.attachEvent ) this.container.detachEvent( "onmouseup", this.endFunction ); else this.container.removeEventListener( "mouseup", this.endFunction, false );
  if( document.attachEvent ) document.detachEvent( "onmouseup", this.endDocumentFunction ); else document.removeEventListener( "mouseup", this.endDocumentFunction, false );
  if( document.attachEvent ) document.detachEvent( "onmousemove", this.moveFunction ); else document.removeEventListener( "mousemove", this.moveFunction, false );
};

utensils.MouseAndTouchTracker.prototype.onStart = function ( touchEvent ) {
  if( navigator.userAgent.match(/Android/i) ) {
    var androidVersion = parseFloat( navigator.userAgent.match(/Android (\d+(?:\.\d+)+)/gi)[0].replace('Android ','') )
    if( androidVersion < 3 ) {
      // hack for Android 2.x - otherwise touchmove events don't fire. See: http://code.google.com/p/android/issues/detail?id=5491
      if( touchEvent.preventDefault ) {
        touchEvent.preventDefault();  // if( touchEvent.target.tagName.toLowerCase() != 'img' ) // potential fix for the Android image menu on tap & hold
      }
    }
  }

  // get page position of container for relative mouse/touch position
  this.findPos( this.container );

  // check for touch-capability
  if ( typeof touchEvent.touches !== 'undefined' ) {
    // set flag and remove mouse events
    this.is_touch_capable = true;
    this.disposeMouseListeners();
  }

  // get mouse/touch coordinates
  this.is_touching = true;
  this.touch_is_inside = true;
  if( !this.is_mouseup_tracking ) {
    this.touchstart.x = ( this.is_touch_capable ) ? touchEvent.touches[0].clientX : touchEvent.clientX;
    this.touchstart.y = ( this.is_touch_capable ) ? touchEvent.touches[0].clientY : touchEvent.clientY;
    this.touchstart.x -= this.container_position.x;
    this.touchstart.y -= this.container_position.y;
    this.touchcurrent.x = this.touchstart.x;
    this.touchcurrent.y = this.touchstart.y;
    this.touchmoved.x = 0;
    this.touchmoved.y = 0;
    this.touchspeed.x = 0;
    this.touchspeed.y = 0;
  }

  // callback
  this.callback && this.callback( utensils.MouseAndTouchTracker.state_start, touchEvent )
};

utensils.MouseAndTouchTracker.prototype.onMove = function ( touchEvent ) {
  // get position of holder for relative mouse/touch position
  this.findPos(this.container);

  // store last position
  this.touchmovedlast.x = this.touchmoved.x;
  this.touchmovedlast.y = this.touchmoved.y;

  //  get current position and distance moved since touch start
  this.touchcurrent.x = ( this.is_touch_capable ) ? touchEvent.touches[0].clientX : touchEvent.clientX;
  this.touchcurrent.y = ( this.is_touch_capable ) ? touchEvent.touches[0].clientY : touchEvent.clientY;
  this.touchcurrent.x -= this.container_position.x;
  this.touchcurrent.y -= this.container_position.y;
  this.touchmoved.x = this.touchcurrent.x - this.touchstart.x;
  this.touchmoved.y = this.touchcurrent.y - this.touchstart.y;

  // calculate speed between touch moves
  this.touchspeed.x = this.touchmoved.x - this.touchmovedlast.x;
  this.touchspeed.y = this.touchmoved.y - this.touchmovedlast.y;

  // pass on move event if touching, or if we're allowing tracking without needing to touch
  if( this.is_touching || this.is_mouseup_tracking )  {
    this.callback && this.callback( utensils.MouseAndTouchTracker.state_move, touchEvent );
  }

  // check for mouse in/out and make the call if it's changed
  if(this.touchcurrent.x < 0 || this.touchcurrent.x > this.container.offsetWidth || this.touchcurrent.y < 0 || this.touchcurrent.y > this.container.offsetHeight) {
    if( this.touch_is_inside ) this.onLeave();
    this.touch_is_inside = false;
  } else {
    if( !this.touch_is_inside ) this.onEnter();
    this.touch_is_inside = true;
  }
};

utensils.MouseAndTouchTracker.prototype.onEnd = function ( touchEvent ) {
  // callback before resetting all touch tracking props
  this.callback && this.callback( utensils.MouseAndTouchTracker.state_end, touchEvent );

  // reset tracking vars
  this.is_touching = false;
  if(!this.is_mouseup_tracking) {
    this.touchstart.x = this.touchstart.y = 0;
    this.touchmovedlast.x = this.touchmovedlast.y = 0;
    this.touchmoved.x = this.touchmoved.y = 0;
    this.touchspeed.x = this.touchspeed.y = 0;
  }
};

utensils.MouseAndTouchTracker.prototype.onEnter = function () {
  this.touchmoved.x = 0;
  this.touchmoved.y = 0;
  this.touchstart.x = this.touchcurrent.x;
  this.touchstart.y = this.touchcurrent.y;
  this.callback && this.callback( utensils.MouseAndTouchTracker.state_enter, null );
};

utensils.MouseAndTouchTracker.prototype.onLeave = function () {
  this.callback && this.callback( utensils.MouseAndTouchTracker.state_leave, null );
};

utensils.MouseAndTouchTracker.prototype.dispose = function () {
  if( this.is_touch_capable ) {
    this.disposeTouchListeners();
  } else {
    this.disposeMouseListeners();
  }
  // clear functions stored for event listener removal
  this.startFunction = null;
  this.moveFunction = null;
  this.endFunction = null;
  this.endDocumentFunction = null;
  // clear objects
  this.callback = false;
  this.touchstart = false;
  this.touchmovedlast = false;
  this.touchmoved = false;
};

utensils.MouseAndTouchTracker.prototype.findPos = function(obj) {
  this.findPosHelper = utensils.CSSHelper.findPos(obj);
  // store position from cumulative offset
  this.container_position.x = this.findPosHelper[0];
  this.container_position.y = this.findPosHelper[1];
};

// indexOf polyfill for old IE
// originally from: http://soledadpenades.com/2007/05/17/arrayindexof-in-internet-explorer/
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
    for(var i=0; i<this.length; i++){
      if(this[i]==obj){
         return i;
      }
    }
    return -1;
  };
}
;

function ButtonTouchCallback( element, callback, highlightClass ) {
  // store/set parameters/state
  this.element = element;
  this.callback = callback;
  this.highlight_class = highlightClass || null;
  this.started_touching = false;
  this.CANCEL_THRESHOLD = 3;
  this.canceled = false;
  // create touch tracker
  var self = this;
  this.touch_tracker = new utensils.MouseAndTouchTracker( this.element, function( touchState, touchEvent ) {
    self.touchUpdated( touchState, touchEvent );
  }, false, '' );
}

ButtonTouchCallback.prototype.touchUpdated = function ( touchState, touchEvent ) {
  if( touchState == utensils.MouseAndTouchTracker.state_start ) {
    if( this.highlight_class ) this.element.className = [this.element.className, this.highlight_class].join(' ');
    this.started_touching = true;
    this.canceled = false;
  }
  // cancel click if mouse/touch moves past threshold
  if( touchState == utensils.MouseAndTouchTracker.state_move ) {
    if( Math.abs( this.touch_tracker.touchmoved.x ) + Math.abs( this.touch_tracker.touchmoved.y ) >= this.CANCEL_THRESHOLD ) this.canceled = true;
    if( Math.abs( this.touch_tracker.touchspeed.x ) + Math.abs( this.touch_tracker.touchspeed.y ) >= this.CANCEL_THRESHOLD ) this.canceled = true;
    if( this.canceled && this.highlight_class ) this.element.className = this.element.className.replace(this.highlight_class, '').replace('  ', ' ');
  }
  if( touchState == utensils.MouseAndTouchTracker.state_end ) {
    if( this.highlight_class ) this.element.className = this.element.className.replace(this.highlight_class, '').replace('  ', ' ');
    // call callback method if touch didn't move past threshold
    var moveTotal = Math.abs( this.touch_tracker.touchmoved.x ) + Math.abs( this.touch_tracker.touchmoved.y );
    if( this.touch_tracker && moveTotal > this.CANCEL_THRESHOLD && this.started_touching ) this.canceled = true;
    if( this.canceled == false && this.callback ) this.callback( this.element, touchEvent );
    if( touchEvent && touchEvent.preventDefault ) touchEvent.preventDefault();
    this.started_touching = false;
  }
};

ButtonTouchCallback.prototype.deactivateHighlight = function() {
  this.highlight_class = null;
};

ButtonTouchCallback.prototype.dispose = function() {
  if( this.touch_tracker ) {
    this.touch_tracker.dispose();
  }
  delete this.touch_tracker;
  delete this.callback;
  delete this.element;
  delete this.highlight_class;
};
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.DatePicker = (function(_super) {

    __extends(DatePicker, _super);

    function DatePicker() {
      this.handleAndroidTap = __bind(this.handleAndroidTap, this);

      this.onIOSChange = __bind(this.onIOSChange, this);
      return DatePicker.__super__.constructor.apply(this, arguments);
    }

    DatePicker.prototype.build = function() {
      this.value = this.el.data('value');
      this.label = this.el.siblings('label');
      return DatePicker.__super__.build.apply(this, arguments);
    };

    DatePicker.prototype.buildIOS = function() {
      console.log("BUILD DATE PICKER iOS: " + this.version + " el: " + this.el[0]);
      this.el.attr('type', 'date');
      this.el.on('change', this.onIOSChange);
      if (this.value && this.value !== 'null') {
        this.el.val(moment(this.value).format('YYYY-MM-DD'));
        return this.label.hide();
      }
    };

    DatePicker.prototype.onIOSChange = function(e) {
      console.log("CHANGE IOS e: " + (this.el.val()));
      if (this.el.val() !== '') {
        return this.label.hide();
      } else {
        return this.label.show();
      }
    };

    DatePicker.prototype.disposeIOS = function() {
      return this.el.off('change');
    };

    DatePicker.prototype.buildAndroid = function() {
      console.log("BUILD DATE PICKER Android: " + this.version);
      this.el.attr('type', 'text');
      this.el.attr('readonly', 'true');
      this.touchCallback = new ButtonTouchCallback(this.el[0], this.handleAndroidTap);
      if (this.value && this.value !== 'null') {
        this.el.val(moment(this.value, 'YYYY-MM-DD').format('MM-DD-YYYY'));
        return this.label.hide();
      } else {
        this.el.val('');
        return this.label.show();
      }
    };

    DatePicker.prototype.disposeAndroid = function() {
      return this.touchCallback.dispose();
    };

    DatePicker.prototype.handleAndroidTap = function(el, e) {
      var newDate, _ref, _ref1,
        _this = this;
      e.preventDefault();
      if ((_ref = window.plugins) != null ? _ref.datePicker : void 0) {
        newDate = ((_ref1 = moment(this.el.val(), 'MM-DD-YYYY')) != null ? _ref1.toDate() : void 0) || new Date();
        return window.plugins.datePicker.show({
          date: newDate,
          mode: 'date',
          allowOldDates: true
        }, function(returnDate) {
          newDate = new Date(returnDate);
          _this.el.val(moment(newDate).format('MM-DD-YYYY'));
          _this.el.blur();
          return _this.label.hide();
        });
      }
    };

    return DatePicker;

  })(ZeptoPlatformHelper);

  Bindable.register('date-picker', TopFan.DatePicker);

}).call(this);
(function() {
  var FormDisabler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormDisabler = (function(_super) {

    __extends(FormDisabler, _super);

    function FormDisabler() {
      this.disableDuringTransition = __bind(this.disableDuringTransition, this);
      return FormDisabler.__super__.constructor.apply(this, arguments);
    }

    FormDisabler.include(Spine.Log);

    FormDisabler.prototype.disableDuringTransition = function(controller) {
      if (controller && controller.location === Constants.SEARCH_PATH) {
        return;
      }
      controller.one('afterRender', this.disableInputs);
      return controller.one('activated', this.enableInputs);
    };

    FormDisabler.prototype.disableInputs = function() {
      return $('input, select, .btn, .headshot .bg').attr('disabled', 'disabled');
    };

    FormDisabler.prototype.enableInputs = function() {
      return setTimeout(function() {
        return $('[disabled]').removeAttr('disabled');
      }, 400);
    };

    return FormDisabler;

  })(Spine.Singleton);

  this.FormDisabler = FormDisabler;

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["headshot/templates/headshot"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
  if (this.spacer) {
    $o.push("<div class='title-spacer' style='height: 88px;'></div>");
      }
      $o.push("<div class='headshot'>\n  <div class='bg'>");
  if (TopFan.Models.Client.currentClient().headshot_path && TopFan.AppState.getInstance().isOnline()) {
    $o.push("    <img class='thumb' src='" + ($e($c(TopFan.Models.Client.currentClient().headshot_path))) + "'>");
      }
      $o.push("    <div class='title'>" + ($e($c(TopFan.Models.Client.currentClient().name))) + "</div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["headshot/templates/headshot_bio"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='bio'>\n  <div class='content'>\n    <div class='text'>");
      $o.push("      " + $c(unescape(this.bio)));
      $o.push("    </div>\n  </div>\n</div>");
      $o.push("" + $c(JST['headshot/templates/headshot']()));
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Headshot = (function(_super) {

    __extends(Headshot, _super);

    Headshot.prototype.isTransitioning = false;

    function Headshot(el) {
      this.dispose = __bind(this.dispose, this);

      this.captureBioLinks = __bind(this.captureBioLinks, this);

      this.contentTransitionEnd = __bind(this.contentTransitionEnd, this);

      this.headshotTransitionEnd = __bind(this.headshotTransitionEnd, this);

      this.toggleBio = __bind(this.toggleBio, this);

      this.convertBioLinksToSpans = __bind(this.convertBioLinksToSpans, this);

      this.bindEvents = __bind(this.bindEvents, this);

      this.refreshElements = __bind(this.refreshElements, this);

      this.render = __bind(this.render, this);
      this.el = $(el);
      this.bio = this.el.data('bio');
      this.render();
      this.refreshElements();
      this.bindEvents();
    }

    Headshot.prototype.render = function() {
      this.el.html(JST['headshot/templates/headshot_bio']({
        bio: this.bio
      }));
      return this.scrollableContent = new TopFan.ScrollableContent($('.text', this.el));
    };

    Headshot.prototype.refreshElements = function() {
      this.headshot = $('.headshot');
      this.headshotBg = $('.bg', this.headshot);
      this.bioEl = $('.bio', this.el);
      this.bioContent = $('.bio .content', this.el);
      this.bioHeight = Math.floor($(window).width() * .54) - 44 + 'px';
      this.bioContent.css({
        height: this.bioHeight
      });
      this.bioEl.css({
        height: this.bioHeight
      });
      return this.convertBioLinksToSpans();
    };

    Headshot.prototype.bindEvents = function() {
      this.headshotBg.on('tap', this.toggleBio);
      this.headshotBg.on('webkitTransitionEnd', this.headshotTransitionEnd);
      return this.bioContent.on('webkitTransitionEnd', this.contentTransitionEnd);
    };

    Headshot.prototype.convertBioLinksToSpans = function() {
      var link, links, span, _i, _len;
      links = this.bioEl.find('.text a');
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        link = $(link);
        span = "<span data-href='" + (link.attr("href")) + "' class='bio-link'>" + (link.html()) + "</span>";
        console.log(span);
        link.replaceWith(span);
      }
      return this.bioEl.find('span.bio-link').on('tap', this.captureBioLinks);
    };

    Headshot.prototype.toggleBio = function(e) {
      if (this.isTransitioning || this.bio.length === 0) {
        return;
      }
      this.isTransitioning = true;
      if (this.headshot.hasClass('active')) {
        return this.bioContent.removeClass('active');
      } else {
        this.headshot.addClass('active');
        return this.headshotBg.css({
          bottom: this.bioHeight
        });
      }
    };

    Headshot.prototype.headshotTransitionEnd = function(e) {
      if (this.headshot.hasClass('active')) {
        return this.bioContent.addClass('active');
      } else {
        return this.isTransitioning = false;
      }
    };

    Headshot.prototype.contentTransitionEnd = function(e) {
      if (!this.bioContent.hasClass('active')) {
        this.headshot.removeClass('active');
        return this.headshotBg.css({
          bottom: 0
        });
      } else {
        return this.isTransitioning = false;
      }
    };

    Headshot.prototype.captureBioLinks = function(e) {
      var link;
      link = $(e.target).data('href');
      return TopFan.ExternalLinkHelper.open(link);
    };

    Headshot.prototype.dispose = function() {
      this.scrollableContent.dispose();
      this.headshotBg.off('tap');
      this.headshotBg.off('webkitTransitionEnd');
      this.bioContent.off('webkitTransitionEnd');
      return $('a').off('tap');
    };

    return Headshot;

  })(Spine.Module);

  Bindable.register('headshot', TopFan.Headshot);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Loader = (function(_super) {

    __extends(Loader, _super);

    Loader.prototype.el = 'section#loader';

    Loader.prototype.elements = {
      '.loading .text': 'text'
    };

    Loader.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    function Loader() {
      this.hide = __bind(this.hide, this);

      this.show = __bind(this.show, this);

      this.cancelAndTrigger = __bind(this.cancelAndTrigger, this);
      Loader.__super__.constructor.apply(this, arguments);
      this.html(JST['views/loader']());
      this.el.on('tap touchstart touchmove', this.cancelAndTrigger);
    }

    Loader.prototype.cancelAndTrigger = function(e) {
      e.preventDefault();
      e.stopPropagation();
      return this.el.trigger('interaction');
    };

    Loader.prototype.show = function(text) {
      if (text == null) {
        text = 'Loading...';
      }
      this.alreadyHidden = false;
      this.text.html(text);
      this.log('TopFan.Loader: Showing loader');
      return this.el.addClass('active');
    };

    Loader.prototype.hide = function() {
      this.log('TopFan.Loader: Hiding loader');
      return this.el.removeClass('active');
    };

    return Loader;

  })(Spine.Controller);

}).call(this);
(function() {

  TopFan.MarkdownParser = (function() {

    MarkdownParser.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    function MarkdownParser() {
      this.parser = new Showdown.converter();
    }

    MarkdownParser.prototype.parseMarkdown = function(markdown) {
      return this.parser.makeHtml(markdown);
    };

    return MarkdownParser;

  })();

}).call(this);
(function() {

  TopFan.Notification = (function() {

    function Notification() {}

    Notification.alert = function(message, callback, title, buttonName) {
      if (title == null) {
        title = 'Alert';
      }
      if (buttonName == null) {
        buttonName = 'OK';
      }
      if (navigator.notification && navigator.notification.alert && TopFan.AppState.getInstance().isInCordova()) {
        return navigator.notification.alert(message, callback, title, buttonName);
      } else {
        window.alert(message);
        if (callback) {
          return callback.call(this, 1);
        }
      }
    };

    Notification.confirm = function(message, callback, title, buttonLabels) {
      var confirmation;
      if (title == null) {
        title = 'Confirm';
      }
      if (buttonLabels == null) {
        buttonLabels = 'OK,Cancel';
      }
      if (navigator.notification && navigator.notification.confirm && TopFan.AppState.getInstance().isInCordova()) {
        return navigator.notification.confirm(message, callback, title, buttonLabels);
      } else {
        confirmation = window.confirm(message);
        if (confirmation && callback) {
          return callback.call(this, 1);
        } else if (callback) {
          return callback.call(this, 2);
        }
      }
    };

    Notification.beep = function(times) {
      if (navigator.notification && navigator.notification.beep && TopFan.AppState.getInstance().isInCordova()) {
        return navigator.notification.beep(times);
      } else {
        return console.log('Beep is not available.');
      }
    };

    Notification.vibrate = function(milliseconds) {
      if (navigator.notification && navigator.notification.vibrate && TopFan.AppState.getInstance().isInCordova()) {
        return navigator.notification.vibrate(milliseconds);
      } else {
        return console.log('Vibrate is not available.');
      }
    };

    return Notification;

  })();

}).call(this);

utensils.CSSHelper = function() {

  var _curVendor = utensils.CSSHelper.getVendorPrefix( 'Transform' );
  var _transformsEnabled = ( _curVendor != null );
  var _transformString = _curVendor + 'Transform';
  utensils.CSSHelper.transformString = _curVendor + 'Transform';
  var _transitionString = _curVendor + 'Transition';
  var _isPreAndroid4 = ( navigator.userAgent.toLowerCase().match(/android 2/i) || navigator.userAgent.toLowerCase().match(/android 3/i) ) ? true : false;

  var getVendor = function() {
    return _curVendor;
  };

  var getCssTransformsEnabled = function() {
    return _transformsEnabled;
  };

  var clearNativePositioning = function( element ) {
    element.style.left = '';
    element.style.top = '';
  };

  var clearTransformPositioning = function( element ) {
    element.style[ _transformString ] = '';
  };

  var clearCssTransition = function( element ) {
    element.style[ _transitionString ] = '';
  };

  var setBackfaceVisbility = function( element, hidden ) {
    hidden = hidden || 'hidden';
    element.style.backfaceVisibility = 'hidden';
    element.style[ _curVendor + 'BackfaceVisibility' ] = 'hidden';
  };

  // update css based on webkit positioning, or standard top/left css
  var update2DPosition = function ( element, x, y, scale, rot, keepTransition ) {
    if( !element ) return;
    if( keepTransition != true ) keepTransition = false;
    scale = scale || 1;
    rot = rot || 0;

    // since we're manually setting position, generally we're doing this in a frame loop, and should disable css transitions if true
    if( keepTransition == false ) clearCssTransition( element );

    if( !_transformsEnabled ) {
      // move element by top/left if transitions aren't supported
      element.style.left = utensils.CSSHelper.roundForCSS( x ) + 'px';
      element.style.top = utensils.CSSHelper.roundForCSS( y ) + 'px';
      element.style.zoom = scale;
    } else {
      // check for non-hardware-acceleration-capable androids - hardware acceleration has been fixed at 4.0+
      if( _isPreAndroid4 == true ) {
        clearTransformPositioning( element );
        // add data attr with x/y positioning since we'll be overriding what would otherwise be additive positioning between top/left and translate3d
        if(!element.getAttribute('data-pos') ) {
          element.setAttribute('data-pos',element.offsetLeft+','+element.offsetTop);
        }
        // pull original placement off stored data attr and add to current position
        pos = element.getAttribute('data-pos').split(',');
        x += parseInt(pos[0]);
        y += parseInt(pos[1]);
        element.style.left = utensils.CSSHelper.roundForCSS( x ) + 'px';
        element.style.top = utensils.CSSHelper.roundForCSS( y ) + 'px';

        // apply scale to inner element if we need scaling - this requires a nested element for scaling
        if( scale != 1 && element.children && element.children[0] && element.children[0].style ) {
          element.children[0].style[ _transformString ] = buildScaleTranslateString( scale );
        }
      } else {
        element.style[ _transformString ] = buildPositionTranslateString( x, y ) + buildScaleTranslateString( scale ) + buildRotationTranslateString( rot );   // element[ _transformString ] &&
      }
    }
  };

  var buildPositionTranslateString = function( x, y ) {
    return " translate3d( " + utensils.CSSHelper.roundForCSS( x ) + "px, " + utensils.CSSHelper.roundForCSS( y ) + "px, 0px )";
  };

  var buildScaleTranslateString = function( deg ) {
    return " scale( " + utensils.CSSHelper.roundForCSS( deg ) + " )";
  };

  var buildRotationTranslateString = function( deg ) {
    return " rotate( " + utensils.CSSHelper.roundForCSS( deg ) + "deg )";
  };

  return {
    update2DPosition : update2DPosition,
    getVendor: getVendor,
    getCssTransformsEnabled : getCssTransformsEnabled,
    setBackfaceVisbility : setBackfaceVisbility
  };
};

// this should really only be called once
utensils.CSSHelper.getVendorPrefix = function( styleSuffix ) {

  // see if the major browser vendor prefixes are detected for css transforms
  var checkVendor = function() {
    if(!navigator.userAgent.toLowerCase().match(/msie 9/i)){
      var vendors = ['Moz', 'Webkit'];  // should have 'ms' also, but IE9 transform doesn't work, even though it claims to exist. so, we leave it out
      var element = findElementWithStyle();
      for( var vendor in vendors ) {
        if( element.style[ vendors[vendor] + styleSuffix ] !== undefined ) {
          return vendors[vendor];
        }
      }
      return null;
    }
  };

  // find & return a legit element with style
  var findElementWithStyle = function () {
    var bodyChildren = document.body.childNodes;
    for( var child in bodyChildren ) {
      if( typeof bodyChildren[child].style !== 'undefined' ) {
        return bodyChildren[child];
      }
    }
  }

  return checkVendor();
};

// round down to 2 decimel places for smaller css strings
utensils.CSSHelper.roundForCSS = function( number ) {
  var multiplier = Math.pow( 10, 2 );
  return Math.round( number * multiplier ) / multiplier;
};

// find the location of an element on the page, taking into consideration either native left/top or CSS transform positioning, and page scroll offset
// cobbled from:
// http://javascript.about.com/od/browserobjectmodel/a/bom12.htm
// http://www.quirksmode.org/js/findpos.html
// with original code to handle webkitTransform positioning added into the mix
utensils.CSSHelper.posArray = [0,0]; // reuse to avoid creating new objects
utensils.CSSHelper.findPos = function(obj) {
  // get page scroll offset
  var scrollX = window.pageXOffset ? window.pageXOffset : document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
  var scrollY = window.pageYOffset ? window.pageYOffset : document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;

  // get element location
  var curleft = curtop = 0;

  if (obj.offsetParent) {
    do {
      // add up css transform: translate3d positioning
      if( obj.offsetParent && typeof obj.offsetParent.style !== 'undefined' && typeof obj.offsetParent.style[ utensils.CSSHelper.transformString ] !== 'undefined' && obj.offsetParent.style[ utensils.CSSHelper.transformString ] ) {  // last conditional fixes chrome on windows
        var transformXYZArray = obj.offsetParent.style[ utensils.CSSHelper.transformString ].split('translate3d(')[1].split(')')[0].replace(/ +/g, '').replace(/px+/g, '').split(',');
        curleft += parseInt( transformXYZArray[0] );
        curtop += parseInt( transformXYZArray[1] );
      }
      // add normal positioning offset
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
  }

  // return position from cumulative offset
  utensils.CSSHelper.posArray[0] = curleft - scrollX;
  utensils.CSSHelper.posArray[1] = curtop - scrollY;
  return utensils.CSSHelper.posArray;
};


/*
 * Requires: _cursor-grab.css
 * Adds grabby-hand cursor functionality on-demand, and handles cases for different browsers
 * Absolute paths to .cur files are needed for IE.
 * TODO: IE might only want the .cur style def, and not want the plain css class
 */

utensils.CursorHand = function( element ){
  this.is_msie = !!navigator.userAgent.toLowerCase().match(/msie/i);
  this.element = element || document.body;
}

utensils.CursorHand.prototype.setDefault = function() {
  if( this.is_msie ) {
    this.removeClass( 'hand handCursor' );
    this.removeClass( 'handGrab handGrabCursor' );
  } else {
    this.removeClass( 'hand' );
    this.removeClass( 'handGrab' );
  }
};

utensils.CursorHand.prototype.setHand = function() {
  this.setDefault();
  if( this.is_msie ) {
    this.addClass( 'hand handCursor' );
  } else {
    this.addClass( 'hand' );
  }
};

utensils.CursorHand.prototype.setGrabHand = function() {
  this.setDefault();
  if( this.is_msie ) {
    this.addClass( 'handGrab handGrabCursor' );
  } else {
    this.addClass( 'handGrab' );
  }
};

utensils.CursorHand.prototype.addClass = function( className ) {
  if($)
    $(this.element).addClass( className );
  else
    DOMUtil.addClass( className );
};

utensils.CursorHand.prototype.removeClass = function( className ) {
  if($)
    $(this.element).removeClass( className );
  else
    DOMUtil.removeClass( className );
};

utensils.CursorHand.prototype.dispose = function(){
  this.setDefault();
  delete this.is_msie;
  delete this.element;
};

// static helper for raw MouseAndTouchTracker usage
utensils.CursorHand.setCursorFromTouchTrackerState = function( touchTracker, cursor, state ) {
  switch( state ) {
    case utensils.MouseAndTouchTracker.state_start :
      cursor.setGrabHand();
      break;
    case utensils.MouseAndTouchTracker.state_move :
      if(touchTracker.is_touching) cursor.setGrabHand();
      break;
    case utensils.MouseAndTouchTracker.state_end :
      if( touchTracker.touch_is_inside ) cursor.setHand();
      else cursor.setDefault();
      break;
    case utensils.MouseAndTouchTracker.state_enter :
      if( !touchTracker.is_touching ) cursor.setHand();
      break;
    case utensils.MouseAndTouchTracker.state_leave :
      if(touchTracker.is_touching) cursor.setGrabHand();
      else cursor.setDefault();
      break;
  }
};





/**
 * Base touch tracking on an html element
 * @requires touch_tracker.js
 * @requires cursor.js
 * @requires css_helper.js
 */

utensils.TouchScroller = function( scrollOuterEl, scrollInnerEl, options ) {
    // internal positioning & size objects
    var Size2d = function( w, h ) {
        this.w = w || 0;
        this.h = h || 0;
    };

    var Point2d = function( x, y ) {
        this.x = x || 0;
        this.y = y || 0;
    };

    var scrollerDelegateMethods = [
        'touchStart',
        'touchEnd',
        'updatePosition',
        'pageChanged',
        'handleDestination',
        'closestIndexChanged'
    ];

    // overrideable options
    var defaultOptions = {
        // physics
        lockDirectionDragPixels: 15,
        dragPastBoundsFriction: 0.2,
        bouncebackFactor: -0.2,
        nonPagedFrictionShort: 0.3,
        nonPagedFriction: 0.8,
        beyondBoundsFriction: 0.4,
        bounces: true,
        // pages & dragging
        pagedEasingFactor: 5,
        pageTurnRatio: 0.2,
        // state options
        hasCursor: true,
        hasScrollbars: true,
        isPaged: true,
        defaultOrientation: utensils.TouchScroller.HORIZONTAL,
        disabledElements: 'div img nav section article',
        // delegate
        scrollerDelegate: function(){}
    };

    // apply passed-in option overrides
    for( var key in options ){
        defaultOptions[key] = options[key];
    }

    var AXIS_X = 'x',
        AXIS_Y = 'y',
        SIZE_W = 'w',
        SIZE_H = 'h',

        // directional locking properties and state vars
        _lockDirectionDragPixels = defaultOptions.lockDirectionDragPixels,
        _dragPastBoundsFriction = defaultOptions.dragPastBoundsFriction,
        _nonPagedFrictionShort = defaultOptions.nonPagedFrictionShort,
        _nonPagedFriction = _nonPagedFrictionDefault = defaultOptions.nonPagedFriction,
        _beyondBoundsFriction = defaultOptions.beyondBoundsFriction,
        _orientation = defaultOptions.defaultOrientation,
        _bounces = defaultOptions.bounces,
        _hasLockedDragAxis = false,
        _dragLockAxis = null,
        _staysInBounds = true,
        _wasDraggedBeyondBounds = new Point2d( false, false ),

        // touch helpers
        _cursor = ( defaultOptions.hasCursor ) ? new utensils.CursorHand() : null,
        _touchTracker = null,
        _cssHelper = null,
        _scrollerDelegate = null,

        // scroll elements
        _scrollOuterEl = scrollOuterEl,
        _scrollInnerEl = scrollInnerEl,

        // positioning and css flags
        _speed = new Point2d(),
        _curPosition = new Point2d(),
        _endPosition = new Point2d(),
        _containerSize = new Size2d(),
        _contentSize = new Size2d(),
        _doesntNeedScroll = new Point2d( false, false ),

        // deal with pages
        _pagedEasingFactor = defaultOptions.pagedEasingFactor,
        _pageTurnRatio = defaultOptions.pageTurnRatio,
        _isPaged = defaultOptions.isPaged,

        _numPages = new Point2d(),
        _pageIndex = new Point2d(),
        _closestScrollIndex = new Point2d(),

        _timerFps = 16,
        _timerActive = false,

        // deal with direction of scroller
        _hasScrollBars = defaultOptions.hasScrollbars,
        _scrollbars = null,
        _axis = null,   // will be x/y for Point2d
        _scrollsX = false,
        _scrollsY = false,

        _scrollerId = '',
        _cancelClick = false,
        _publicInterface = null;

    var init = function() {
        _scrollerId = generateScrollerId();
        setScrollerDelegate( defaultOptions.scrollerDelegate );
        _cssHelper = new utensils.CSSHelper();
        _touchTracker = new utensils.MouseAndTouchTracker( scrollOuterEl, touchUpdated, false, defaultOptions.disabledElements );
        if( _hasScrollBars ) _scrollbars = new Point2d( new ScrollBar( AXIS_X, SIZE_W ), new ScrollBar( AXIS_Y, SIZE_H ) );

        setOrientation( _orientation );
        calculateDimensions();

        activate();
    };

    var touchUpdated = function( state, touchEvent ) {
        switch( state ) {
            case utensils.MouseAndTouchTracker.state_start :
                onStart(touchEvent);
                break;
            case utensils.MouseAndTouchTracker.state_move :
                onMove(touchEvent);
                break;
            case utensils.MouseAndTouchTracker.state_end :
                onEnd(touchEvent);
                break;
            case utensils.MouseAndTouchTracker.state_enter :
                onEnter(touchEvent);
                break;
            case utensils.MouseAndTouchTracker.state_leave :
                onLeave(touchEvent);
                break;
        }
        updateCursor( state );
    };

    var onStart = function( touchEvent ) {
        if( _timerActive == false ) return;
        if( utensils.TouchScroller.innermostScrollerInstance == null ) utensils.TouchScroller.innermostScrollerInstance = _publicInterface;
        _scrollerDelegate.touchStart();
        _cancelClick = false;
        _scrollOuterEl.addEventListener('click', onClicked);
    };

    var onMove = function( touchEvent ) {
        // cancel scrolling if there's an inner scroller in the same orientation
        // or if there's another scroller that's been activated in a different direction
        // or if it's shut down
        if( utensils.TouchScroller.innermostScrollerInstance != _publicInterface && ( utensils.TouchScroller.innermostScrollerInstance.getOrientation() == _orientation || _orientation == utensils.TouchScroller.UNLOCKED ) ) return;   // canceling b/c same direction as inner scroller (or outer is a grid (unlocked))
        if( utensils.TouchScroller.activeScrollerInstance != null && utensils.TouchScroller.activeScrollerInstance != _scrollerId ) return;   // canceling b/c inner scroller has been activated in a different orientation
        if( _timerActive == false ) return;

        // if normal (no inner scroller blocking this instance), show scrollbars and do normal scrolling in grid orientation
        if( _orientation == utensils.TouchScroller.UNLOCKED ) {
            showScrollbars();
            utensils.TouchScroller.activeScrollerInstance = _scrollerId;
            if( Math.abs( _touchTracker.touchmoved.x ) + Math.abs( _touchTracker.touchmoved.y ) > 10 ) _cancelClick = true;
        }

        // if we're locked to an axis, drag a bit before deciding to scroll, then preventDefault on the touch event below to allow page scrolling in the non-locked axis directino
        if( !_hasLockedDragAxis && _orientation != utensils.TouchScroller.UNLOCKED ) {
            if( Math.abs( _touchTracker.touchmoved.x ) > _lockDirectionDragPixels ) decideDragAxis( utensils.TouchScroller.HORIZONTAL );
            else if( Math.abs( _touchTracker.touchmoved.y ) > _lockDirectionDragPixels ) decideDragAxis( utensils.TouchScroller.VERTICAL );
        } else {
            // scroll once we've decided a direction
            if( _orientation == utensils.TouchScroller.UNLOCKED || ( _orientation == utensils.TouchScroller.VERTICAL && _orientation == _dragLockAxis ) || ( _orientation == utensils.TouchScroller.HORIZONTAL && _orientation == _dragLockAxis ) ) {
                updatePositionFromTouch( ( _touchTracker.touchmoved.x - _touchTracker.touchmovedlast.x ), ( _touchTracker.touchmoved.y - _touchTracker.touchmovedlast.y ) );
            }
        }
    };

    var onEnd = function( touchEvent ) {
        _scrollerDelegate.touchEnd();
        _scrollOuterEl.removeEventListener('click', onClicked);

        // reset touchscroll props after a tick
        setTimeout(function(){
            _hasLockedDragAxis = false;
            _dragLockAxis = null;
            _cancelClick = false;
            utensils.TouchScroller.activeScrollerInstance = null;
            utensils.TouchScroller.innermostScrollerInstance = null;
        },1);

        if( utensils.TouchScroller.activeScrollerInstance != _scrollerId ) {
            hideScrollbars();
            return;
        }
        if( _timerActive == false ) return;

        // store last known page index before recalculating
        var prevIndexX = _pageIndex.x;
        var prevIndexY = _pageIndex.y;

        // perform final speed/snapping functions if we're active and dragging in the right direction
        if( _orientation == utensils.TouchScroller.UNLOCKED || ( _orientation == utensils.TouchScroller.VERTICAL && _orientation == _dragLockAxis ) || ( _orientation == utensils.TouchScroller.HORIZONTAL && _orientation == _dragLockAxis ) ) {
            // get mouse speed for non-paged mode
            var speedX = ( _scrollsX ) ? getTouchSpeedForAxis( AXIS_X ) : 0;
            var speedY = ( _scrollsY ) ? getTouchSpeedForAxis( AXIS_Y ) : 0;

            if( _scrollsX ) sendBackInBounds( AXIS_X );
            if( _scrollsY ) sendBackInBounds( AXIS_Y );

            if( _scrollsX ) detectPageChangeOnTouchEnd( prevIndexX, AXIS_X );
            if( _scrollsY ) detectPageChangeOnTouchEnd( prevIndexY, AXIS_Y );
        } else {
            hideScrollbars();
        }

        // hide the scrollbar if touch was just a tap
        // if dragging against the boundaries (no toss speed), hide scroller?? hmm..
        if( _touchTracker.touchmoved.x == 0 && _touchTracker.touchmoved.y == 0 ) {
            hideScrollbars();
        }
    };

    var onClicked = function(e) {
        if( _cancelClick == true ) {
            eventPreventDefault( e );
        }
    };

    var decideDragAxis = function( direction ) {
        _hasLockedDragAxis = true;
        _dragLockAxis = direction;
        if( _orientation == _dragLockAxis ) {
            showScrollbars();
            utensils.TouchScroller.activeScrollerInstance = _scrollerId;
            _cancelClick = true;
        }
    };

    var getTouchSpeedForAxis = function( axis ) {
        if( _touchTracker.touchspeed[ axis ] != 0 ) {
            var tossStartInBounds = ( _touchTracker.touchspeed[ axis ] > 0 && _curPosition[ axis ] < 0 );
            var tossEndInBounds = ( _touchTracker.touchspeed[ axis ] < 0 && _curPosition[ axis ] > _endPosition[ axis ] );
            _speed[ axis ] = -_touchTracker.touchspeed[ axis ];
            if( tossStartInBounds || tossEndInBounds ) {
                // apply speed after tossing if in-bounds
                return _speed[ axis ];
            } else {
                return false;
            }
        } else {
            _speed[ axis ] = 0;
        }
    };


    var onEnter = function( touchEvent ) {

    };

    var onLeave = function( touchEvent ) {

    };

    var updateCursor = function( state ) {
        if( _cursor && _timerActive ) {
            utensils.CursorHand.setCursorFromTouchTrackerState( _touchTracker, _cursor, state );
        }
    };

    var runTimer = function() {
        if( _timerActive && _curPosition ) {
            calculateDimensions();
            if( !_touchTracker.is_touching ) {
                updateWhileNotTouching();
            }

            if( _scrollsX ) checkForClosestIndex( AXIS_X, SIZE_W );
            if( _scrollsY ) checkForClosestIndex( AXIS_Y, SIZE_H );

            // keep timer running - use requestAnimationFrame if available
            if( window.requestAnimationFrame ) {
                window.requestAnimationFrame( runTimer );
            } else {
                setTimeout( function() { runTimer(); }, _timerFps );
            }
        }
    };

    var update2DPosition = function( element, x, y ){
        _cssHelper.update2DPosition( element, x, y, 1, 0, false );
    };

    var redraw = function() {
        update2DPosition( _scrollInnerEl, _curPosition.x, _curPosition.y );
        updateScrollbar();
    };

    var calculateDimensions = function() {
        if( !_timerActive || !_containerSize || !_scrollOuterEl ) return;

        var outerW = _scrollOuterEl.offsetWidth;
        var outerH = _scrollOuterEl.offsetHeight;
        var contentW = _scrollInnerEl.offsetWidth;
        var contentH = _scrollInnerEl.offsetHeight;

        if( contentW != _contentSize.w || contentH != _contentSize.h || outerW != _containerSize.w || outerH != _containerSize.h ) {
            _containerSize.w = outerW;
            _containerSize.h = outerH;
            _contentSize.w = contentW;
            _contentSize.h = contentH;
            _endPosition.x = _containerSize.w - _contentSize.w;
            _endPosition.y = _containerSize.h - _contentSize.h;
            _numPages.x = Math.ceil( _contentSize.w / _containerSize.w );
            _numPages.y = Math.ceil( _contentSize.h / _containerSize.h );
            _doesntNeedScroll.x = ( _containerSize.w > _contentSize.w );
            _doesntNeedScroll.y = ( _containerSize.h > _contentSize.h );
            if( _doesntNeedScroll.x == true ) _endPosition.x = 0;
            if( _doesntNeedScroll.y == true ) _endPosition.y = 0;
            if( _pageIndex.x > _numPages.x - 1 ) _pageIndex.x = _numPages.x - 1;
            if( _pageIndex.y > _numPages.y - 1 ) _pageIndex.y = _numPages.y - 1;
            if( _scrollsX ) sendBackInBounds( AXIS_X );
            if( _scrollsY ) sendBackInBounds( AXIS_Y );
            if( _scrollsX && _scrollbars ) _scrollbars.x.resizeScrollbar();
            if( _scrollsY && _scrollbars ) _scrollbars.y.resizeScrollbar();
        }
    };

    // update scroll position
    var updatePositionFromTouch = function( moveX, moveY ) {
        // update position for either/both axis depending on orientation mode
        ( _scrollsX ) ? updateAxisPosition( AXIS_X, moveX ) : constrainContent( AXIS_X );
        ( _scrollsY ) ? updateAxisPosition( AXIS_Y, moveY ) : constrainContent( AXIS_Y );

        // update DOM and report back
        redraw();
        updateScrollbar();
        _scrollerDelegate.updatePosition( _curPosition.x, _curPosition.y, true );
    };

    var updateAxisPosition = function( axis, axisTouchMove ) {
        // handle bounce-back and lessened swipe-ability at ends of scroll area
        if( _curPosition[ axis ] > 0 && _touchTracker.touchspeed[ axis ] > 0 ) {
            _curPosition[ axis ] += axisTouchMove * _dragPastBoundsFriction;
        } else if( _curPosition[ axis ] < _endPosition[ axis ] && _touchTracker.touchspeed[ axis ] < 0 ) {
            _curPosition[ axis ] += axisTouchMove * _dragPastBoundsFriction;
        } else {
            _curPosition[ axis ] += axisTouchMove;
        }
        if( !_bounces ) {
            if( _curPosition[ axis ] < _endPosition[ axis ] ) _curPosition[ axis ] = _endPosition[ axis ];
            if( _curPosition[ axis ] > 0 ) _curPosition[ axis ] = 0;
        }
    };

    var updateWhileNotTouching = function() {
        var curX = _curPosition.x;
        var curY = _curPosition.y;
        var isDirty = false;
        // update position and set dirty flag if the position has actually moved
        if( _isPaged == true ) {
            // ease to the cosest index while not touching
            easeToIndex();
        } else {
            // slide it and apply friction
            applyInertia();
        }
        if( curX != _curPosition.x || curY != _curPosition.y || Math.abs( _speed.x ) > 0.1 || Math.abs( _speed.y ) > 0.1 ) isDirty = true;
        // hide scrollbar and set speed to zero when it eases close enough
        if( isDirty && hasSlowedToStop( null ) ) {
            handleDestination();
            _speed.x = _speed.y = 0;
        } else {
            if( isDirty ) _scrollerDelegate.updatePosition( _curPosition.x, _curPosition.y, false );
        }
        if( isDirty ) {
            redraw();
            updateScrollbar();
        }
    }

    var hasSlowedToStop = function( axis ) {
        if( axis ) {
            return hasSlowedToStopForAxis( axis );
        } else {
            return ( hasSlowedToStopForAxis( AXIS_X ) && hasSlowedToStopForAxis( AXIS_Y ) );
        }
    };

    var hasSlowedToStopForAxis = function( axis ) {
        return (Math.abs( _speed[ axis ] ) <= 0.01);
    };

    var easeToIndex = function() {
        ( _scrollsX ) ? easeToIndexForAxis( AXIS_X, SIZE_W ) : constrainContent( AXIS_X );
        ( _scrollsY ) ? easeToIndexForAxis( AXIS_Y, SIZE_H ) : constrainContent( AXIS_Y );
    };

    var easeToIndexForAxis = function( axis, dimension ) {
        var lastLoc = _curPosition[ axis ];
        _curPosition[ axis ] = getNextEasedLocation( _pageIndex[ axis ], _curPosition[ axis ], _containerSize[ dimension ] );
        _speed[ axis ] = Math.abs( _curPosition[ axis ] - lastLoc );
    };

    var applyInertia = function() {
        ( _scrollsX ) ? applyInertiaForAxis( AXIS_X ) : constrainContent( AXIS_X );
        ( _scrollsY ) ? applyInertiaForAxis( AXIS_Y ) : constrainContent( AXIS_Y );
    };

    var applyInertiaForAxis = function( axis ) {
        _speed[ axis ] *= _nonPagedFriction;
        _curPosition[ axis ] -= _speed[ axis ];

        // reverse direction if inertia has brought the content out of bounds
        var headingOutOfBounds = ( ( _curPosition[ axis ] > 0 && _speed[ axis ] < 0 ) || ( _curPosition[ axis ] < _endPosition[ axis ] && _speed[ axis ] > 0 ) );
        if( headingOutOfBounds ) {
            if( _bounces ) {
                _speed[ axis ] *= _beyondBoundsFriction;
                if( hasSlowedToStop( axis ) ) {
                    sendBackInBounds( axis );
                }
            } else {
                _speed[ axis ] = 0;
                constrainContent( axis );
            }
        }
        // check to see if content is back in bounds after sliding off
        if ( _curPosition[ axis ] < 0 && _curPosition[ axis ] > _endPosition[ axis ] ) {
            _wasDraggedBeyondBounds[ axis ] = false;
        }
    };

    var constrainContent = function( axis ) {
        if( _curPosition[ axis ] > 0 ) _curPosition[ axis ] = 0;
        if( _curPosition[ axis ] < _endPosition[ axis ] ) _curPosition[ axis ] = _endPosition[ axis ];
    };

    var sendBackInBounds = function( axis ) {
        // calculate speed to get back to edge if content was dragged out-of-bounds
        if( _staysInBounds == true && _bounces ) {
            if( isOutOfBoundsForAxis( axis ) || _doesntNeedScroll[ axis ] ) {
                _wasDraggedBeyondBounds[ axis ] = true;
                var distanceFromEdge = 0;

                // apply speed so we can treat it as if we dragged as far as the drag speed added
                _curPosition[ axis ] -= _speed[ axis ];

                // send back to top, or bottom
                if( _curPosition[ axis ] > 0 || _doesntNeedScroll[ axis ] == true )
                  distanceFromEdge = _curPosition[ axis ];
                else if( _curPosition[ axis ] < _endPosition[ axis ] )
                  distanceFromEdge = _curPosition[ axis ] - _endPosition[ axis ];

                // solve for initial speed, given distance and friction
                if( distanceFromEdge != 0 ) {
                    _speed[ axis ] = getSpeedToReachDestination( distanceFromEdge );
                }
            }
        }
    };

    var isOutOfBoundsForAxis = function( axis ) {
        return _curPosition[ axis ] - _speed[ axis ] > 0 || _curPosition[ axis ] - _speed[ axis ] < _endPosition[ axis ];
    };

    var detectPageChangeOnTouchEnd = function( prevIndex, axis ) {
        // snap to page and constrain page calculation
        if( _isPaged == true ) {
            var dimension = getDimensionForAxis( axis );
            var prevPage = _pageIndex[ axis ];
            var pageChanged = false;
            // have we swiped far enough to turn the page
            if( _touchTracker.touchmoved[ axis ] > _containerSize[ dimension ] * _pageTurnRatio ) {
                _pageIndex[ axis ] = ( _pageIndex[ axis ] == 0 ) ? 0 : _pageIndex[ axis ] - 1;
                pageChanged = true;
            } else if ( _touchTracker.touchmoved[ axis ] < -_containerSize[ dimension ] * _pageTurnRatio ) {
                _pageIndex[ axis ] = ( _pageIndex[ axis ] < _numPages[ axis ] - 1 ) ? _pageIndex[ axis ] + 1 : _numPages[ axis ] - 1;
                pageChanged = true;
            }

            // checks whether we've gone more than halfway to a page, or allows above code to let us swipe slightly for next/prev pages
            if( !( prevIndex == _closestScrollIndex[ axis ] && prevIndex != _pageIndex[ axis ] ) ) {
                _pageIndex[ axis ] = _closestScrollIndex[ axis ];
                pageChanged = true;
            }

            if( pageChanged == true && prevPage != _pageIndex[ axis ] ) {
                _scrollerDelegate.pageChanged( _pageIndex[ axis ], axis );
            }
        }
    };

    var updateScrollbar = function() {
        if( !_scrollbars ) return;
        if( _scrollsX ) _scrollbars.x.updateScrollbarPosition( _curPosition.x );
        if( _scrollsY ) _scrollbars.y.updateScrollbarPosition( _curPosition.y );
    };

    var getNextEasedLocation = function( pageIndex, curPosition, containerSize ) {
        // get location based on current position
        var targetPos = pageIndex * -containerSize;
        if( curPosition !== targetPos ) {
            if (Math.abs( curPosition - targetPos ) <= 0.25 ) {
                curPosition = targetPos;
                handleDestination();
                return curPosition;
            }
        }
        // ease position to target
        return curPosition -= ( ( curPosition - targetPos ) / _pagedEasingFactor );
    };

    var getSpeedToReachDestination = function( distance ) {
        return distance / ( ( _nonPagedFriction ) * ( 1 / ( 1 - _nonPagedFriction ) ) );
    };

    var checkForClosestIndex = function( axis, dimension ) {
        // set closest index and update indicator
        var closestIndex = Math.round( _curPosition[ axis ] / -_containerSize[ dimension ] );
        if( _closestScrollIndex[ axis ] != closestIndex ) {
            _closestScrollIndex[ axis ] = closestIndex;
            closestIndexChanged( axis );
        }
    };

    var closestIndexChanged = function( axis ) {
        if( _closestScrollIndex[ axis ] < 0 ) _closestScrollIndex[ axis ] = 0;
        if( _closestScrollIndex[ axis ] > _numPages[ axis ] - 1 ) _closestScrollIndex[ axis ] = _numPages[ axis ] - 1;
        _scrollerDelegate.closestIndexChanged( _closestScrollIndex[ axis ], axis );
    };

    var handleDestination = function () {
        hideScrollbars();
        _curPosition.x = Math.round( _curPosition.x );
        _curPosition.y = Math.round( _curPosition.y );
        _scrollerDelegate.handleDestination();
    };

    var setOrientation = function( orientation ) {
        var prevOrientation = _orientation;
        _orientation = orientation;
        if( _orientation == utensils.TouchScroller.VERTICAL ) {
            _scrollsX = false;
            _scrollsY = true;
            _axis = AXIS_Y;
            _curPosition.y = ( _isPaged ) ? _pageIndex.y * _containerSize.h : _curPosition.x;
            _curPosition.x = 0;
            if( _isPaged ) {
                if( prevOrientation == utensils.TouchScroller.HORIZONTAL ) _pageIndex.y = _pageIndex.x;
                setPage( _pageIndex.y, true );
            }
        } else if( _orientation == utensils.TouchScroller.HORIZONTAL ) {
            _scrollsX = true;
            _scrollsY = false;
            _axis = AXIS_X;
            _curPosition.x = ( _isPaged ) ? _pageIndex.x * _containerSize.w : _curPosition.y;
            _curPosition.y = 0;
            if( _isPaged ) {
                if( prevOrientation == utensils.TouchScroller.VERTICAL ) _pageIndex.x = _pageIndex.y;
                setPage( _pageIndex.x, true );
            }
        } else {
            _scrollsX = true;
            _scrollsY = true;
            _axis = null;
        }
        calculateDimensions();
        redraw();
        if( _scrollsX && _scrollbars ) _scrollbars.x.resizeScrollbar();
        if( _scrollsY && _scrollbars ) _scrollbars.y.resizeScrollbar();
        hideScrollbars();
    };

    var getOrientation = function() {
        return _orientation;
    };

    var getDimensionForAxis = function( axis ) {
        if( axis == AXIS_X ) return SIZE_W;
        else if( axis == AXIS_Y ) return SIZE_H;
        else return null;
    };

    var setBounces = function( bounces ) {
        _bounces = bounces;
    };

    var showScrollbars = function() {
        if( !_scrollbars ) return;
        if( _scrollsX ) _scrollbars.x.showScrollbar();
        if( _scrollsY ) _scrollbars.y.showScrollbar();
    };

    var hideScrollbars = function() {
        if( !_scrollbars ) return;
        _scrollbars.x.hideScrollbar();
        _scrollbars.y.hideScrollbar();
    };

    var setIsPaged = function( isPaged ) {
        _isPaged = isPaged;
    };

    var setPage = function ( index, immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        if( _timerActive == false ) return;
        _pageIndex[ curAxis ] = index;
        if (immediately) {
            calculateDimensions();
            var dimension = ( curAxis == AXIS_X ) ? SIZE_W : SIZE_H;
            _curPosition[ curAxis ] = _pageIndex[ curAxis ] * -_containerSize[ dimension ];
            _curPosition[ curAxis ] += 1; // makes sure it snaps back to place, given the easing/isDirty check above
        }
    };

    var getPage = function ( axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        return ( _isPaged ) ? _pageIndex[ curAxis ] : 0;
    };

    var getNumPages = function ( axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        return ( _isPaged ) ? _numPages[ curAxis ] : 0;
    };

    var getScrollLength = function( axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return -1;

        return _endPosition[ curAxis ];
    };

    var prevPage = function ( loops, immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        if( _timerActive == false ) return;
        if( loops == true && _pageIndex[ curAxis ] == 0 )
            _pageIndex[ curAxis ] = _numPages[ curAxis ] - 1;
        else
            _pageIndex[ curAxis ] = ( _pageIndex[ curAxis ] > 0 ) ? _pageIndex[ curAxis ] - 1 : 0;
        if (immediately) _curPosition[ curAxis ] = _pageIndex[ curAxis ] * -_containerSize[ getDimensionForAxis( curAxis ) ];
        showScrollbars();
    };

    var nextPage = function ( loops, immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        if( _timerActive == false ) return;
        if( loops == true && _pageIndex[ curAxis ] == _numPages[ curAxis ] - 1 )
            _pageIndex[ curAxis ] = 0;
        else
            _pageIndex[ curAxis ] = ( _pageIndex[ curAxis ] < _numPages[ curAxis ] - 1 ) ? _pageIndex[ curAxis ] + 1 : _numPages[ curAxis ] - 1;
        if (immediately) _curPosition[ curAxis ] = _pageIndex[ curAxis ] * -_containerSize[ getDimensionForAxis( curAxis ) ];
        showScrollbars();
    };

    var scrollToEnd = function ( immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        var offsetToEnd = _curPosition[ curAxis ] - _endPosition[ curAxis ];
        setOffsetPosition( offsetToEnd, immediately, axis );
    };

    var scrollToTop = function ( immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        setOffsetPosition( _curPosition[ curAxis ], immediately, axis );
    };

    var scrollToPosition = function ( position, immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        var offsetToPosition = _curPosition[ curAxis ] - position;
        setOffsetPosition( offsetToPosition, immediately, curAxis );
    };

    var scrollToPercent = function ( percent, immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        scrollToPosition( getScrollLength( curAxis ) * percent, immediately, curAxis );
    };

    var setOffsetPosition = function ( offsetFromCurPosition, immediately, axis ) {
        var curAxis = ( _axis ) ? _axis : axis;
        if( !curAxis ) return;

        if( immediately ) {
            _curPosition[ axis ] -= offsetFromCurPosition;
            redraw();
        } else {
            _speed[ curAxis ] = getSpeedToReachDestination( offsetFromCurPosition );
        }
        showScrollbars();
    };

    var updateOnResize = function() {
        setPage( _pageIndex.x, true, AXIS_X );
        setPage( _pageIndex.y, true, AXIS_Y );
    };

    var getCurScrollPosition = function() {
        return _curPosition[ _axis ];
    };

    var getCurScrollPercent = function() {
        return _curPosition[ _axis ] / _endPosition[ _axis ];
    };

    var setIsHardwareAcceleratedCSS = function( isAccelerated ) {
        if( isAccelerated ) {
            _cssHelper.convertToWebkitPositioning( _scrollInnerEl );
            if( !_scrollbars ) {
              _scrollbars.x.setIsHardwareAcceleratedCSS( isAccelerated );
              _scrollbars.y.setIsHardwareAcceleratedCSS( isAccelerated );
            }
        } else {
            _cssHelper.convertToNativePositioning( _scrollInnerEl );
            if( !_scrollbars ) {
              _scrollbars.x.setIsHardwareAcceleratedCSS( isAccelerated );
              _scrollbars.y.setIsHardwareAcceleratedCSS( isAccelerated );
            }
        }
        redraw();
    };

    var getIsHardwareAcceleratedCSS = function() {
        return _cssHelper.getWebKitCSSEnabled();
    };

    var setNonPagedFrictionIsShort = function( isShort ) {
        _nonPagedFriction = ( isShort ) ? _nonPagedFrictionShort : _nonPagedFrictionDefault;
    };

    var setStayInBounds = function( shouldStayInBounds ) {
      _staysInBounds = shouldStayInBounds;
      if( _staysInBounds == true ) {
        onEnd( null );  // make sure we slide back into bounds if we weren't already
      }
    };

    var setScrollerDelegate = function( delegate ){
        _scrollerDelegate = delegate;

        // monkey patch scrollerDelegate methods if undefined so there aren't any errors when called
        for( var i=0; i < scrollerDelegateMethods.length; i++ ) {
            var method = scrollerDelegateMethods[i];
            if( !_scrollerDelegate[method] ) {
                _scrollerDelegate[method] = function(){};
            }
        }

    };

    var deactivate = function() {
        _timerActive = false;
        hideScrollbars();
        if( _cursor ) _cursor.setDefault();
    };

    var activate = function() {
        if( _timerActive == false ) {
            _timerActive = true;
            runTimer();
        }
    };

    var reset = function() {
        _pageIndex.x = 0;
        _pageIndex.y = 0;
        _curPosition.x = 0;
        _curPosition.y = 0;
        redraw();
        if( !_scrollbars ) return;
        _scrollbars.x.updateScrollbarPosition( 0 );
        _scrollbars.y.updateScrollbarPosition( 0 );
    };

    var dispose = function() {
        _touchTracker.dispose();
        delete _touchTracker;

        if( _cursor ) _cursor.dispose();
        _cursor = null;
        _timerActive = false;
        _curPosition = null;
        _containerSize = null;
        _contentSize = null;

        hideScrollbars();
    };


    /* Scrollbar functionality ----------------------------- */

    var ScrollBar = function( axis, dimension ) {
        var _scroll_bar = null,
            _scroll_bar_pill = null,
            _pill_position = 0,
            _pill_length = 0,
            _container_length = 0,
            _scroll_endPosition = 0,
            _pill_overflow = 0,
            _scroll_pill_padding = 0,
            _scroll_bar_opacity = 0.5,
            _is_showing = false,
            _fade = false;

        var init = function() {
            _hasScrollBars = true;

            // create divs for scrollbar
            _scroll_bar = document.createElement('div');
            _scroll_bar.className = ( axis == AXIS_Y ) ? 'scrollbar vertical' : 'scrollbar horizontal';
            _scroll_bar_pill = document.createElement('div');
            _scroll_bar_pill.className = 'scrollbar-pill';
            _scroll_bar.appendChild(_scroll_bar_pill);
            _scrollOuterEl.appendChild(_scroll_bar);
        };

        var resizeScrollbar = function() {
            if( !_hasScrollBars ) return;

            _scroll_pill_padding = ( axis == AXIS_Y ) ? parseInt(getStyle(_scroll_bar,'padding-top')) : parseInt(getStyle(_scroll_bar,'padding-left'));
            if( isNaN( _scroll_pill_padding ) ) _scroll_pill_padding = 0;

            _container_length = ( axis == AXIS_Y ) ? _containerSize[ dimension ] : _containerSize[ dimension ];
            _container_length -= _scroll_pill_padding * 2;

            _pill_length = ( _container_length / _contentSize[ dimension ] ) * _container_length;
            _scroll_endPosition = _container_length - _pill_length;

            _scroll_bar.style.width = ( axis == AXIS_X ) ? _container_length + 'px' : '';
            _scroll_bar.style.height = ( axis == AXIS_Y ) ? _container_length + 'px' : '';

            _scroll_bar.style.marginLeft = ( axis == AXIS_X ) ? _scroll_pill_padding + 'px' : '';
            _scroll_bar.style.marginTop = ( axis == AXIS_Y ) ? _scroll_pill_padding + 'px' : '';

            updateScrollPillSize();
        };

        var updateScrollPillSize = function(){
            // check to see how far the pill has gone out-of-bounds
            _pill_overflow = 0;
            if( _pill_position < 0 ) _pill_overflow = -_pill_position;
            if( _pill_position > _scroll_endPosition ) _pill_overflow = _pill_position - _scroll_endPosition;

            // adjust pill size based on overflow
            var realPillLength = _pill_length - _pill_overflow;
            if( realPillLength > _container_length ) realPillLength = _container_length;
            if( isNaN( realPillLength ) ) realPillLength = 0;

            // update element
            _scroll_bar_pill.style.width = ( axis == AXIS_X ) ? Math.round( realPillLength ) + 'px' : '';
            _scroll_bar_pill.style.height = ( axis == AXIS_Y ) ? Math.round( realPillLength ) + 'px' : '';
        };

        var updateScrollbarPosition = function( scrollPosition ) {
            if( !_hasScrollBars ) return;
            if( _scroll_bar && _scroll_bar_pill ) {
                // calculate the position of the scrollbar, relative to scroll content
                var distanceRatio = getPercentWithinRange( 0, _endPosition[ axis ], scrollPosition );
                _pill_position = Math.round( distanceRatio * ( _container_length - _pill_length ) );

                // create temporary location in case scrollbar is out of bounds
                var displayPillPosition = ( _pill_position > 0 ) ? _pill_position : 0;

                // position the scroll bar pill
                if( axis == AXIS_Y ) {
                    update2DPosition( _scroll_bar_pill, 0, displayPillPosition );
                } else {
                    update2DPosition( _scroll_bar_pill, displayPillPosition, 0 );
                }

                // resize if dragging out of bounds
                updateScrollPillSize();
            }
        };

        var showScrollbar = function() {
            if( !_hasScrollBars || _timerActive == false || _is_showing == true || !_containerSize ) return;
            if( _containerSize[ dimension ] < _contentSize[ dimension ] || _containerSize[ dimension ] < _contentSize[ dimension ] ) {
                _is_showing = true;
                addClassName( _scroll_bar_pill, 'showing' );
            }
        };

        var hideScrollbar = function() {
            if( !_hasScrollBars || _is_showing == false ) return;
            _is_showing = false;
            removeClassName( _scroll_bar_pill, 'showing' );
        };

        var setIsHardwareAcceleratedCSS = function( isAccelerated ) {
            if( isAccelerated ) {
                _cssHelper.convertToWebkitPositioning( _scroll_bar_pill );
            } else {
                _cssHelper.convertToNativePositioning( _scroll_bar_pill );
            }
        };

        init();

        return {
            resizeScrollbar: resizeScrollbar,
            updateScrollbarPosition: updateScrollbarPosition,
            showScrollbar: showScrollbar,
            hideScrollbar: hideScrollbar,
            setIsHardwareAcceleratedCSS: setIsHardwareAcceleratedCSS
        }
    };

    // DOM/Math utility methods -------------------------------------

    var generateScrollerId = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    var eventPreventDefault = function( touchEvent ) {
        if(touchEvent && typeof touchEvent !== 'undefined' && touchEvent.preventDefault && typeof touchEvent.preventDefault !== 'undefined') touchEvent.preventDefault();
    };

    var eventStopPropa = function( touchEvent ) {
        if(touchEvent && typeof touchEvent !== 'undefined' && touchEvent.stopPropagation && typeof touchEvent.stopPropagation !== 'undefined') touchEvent.stopPropagation();
        if(touchEvent && typeof touchEvent !== 'undefined' && touchEvent.stopImmediatePropagation && typeof touchEvent.stopImmediatePropagation !== 'undefined') touchEvent.stopImmediatePropagation();
    };

    var getPercentWithinRange = function( bottomRange, topRange, valueInRange ) {
        topRange += -bottomRange;
        valueInRange += -bottomRange;
        bottomRange += -bottomRange;  // last to not break other offsets
        // return percentage or normalized values
        return ( valueInRange / ( topRange - bottomRange ) );
    };

    var getStyle = function( el, styleProp ) {
        var style;
        if ( el.currentStyle )
            style = el.currentStyle[styleProp];
        else if (window.getComputedStyle)
            style = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
        return style;
    };

    var hasClassName = function(element, className) {
        var regExp = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
        return regExp.test(element.className);
    };

    var addClassName = function(element, className) {
        if (!hasClassName(element, className))
            element.className = [element.className, className].join(' ');
    };

    var removeClassName = function(element, className) {
        if (hasClassName(element, className)) {
            var regExp = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)', 'g');
            var curClasses = element.className;
            element.className = curClasses.replace(regExp, ' ');
        }
    };

    var removeElement = function( elem ) {
        if( elem && elem.parentNode ) {
            elem.parentNode.removeChild( elem );
        }
    };

    init();

    _publicInterface = {
        activate : activate,
        deactivate : deactivate,
        calculateDimensions: calculateDimensions,
        setOrientation : setOrientation,
        getOrientation : getOrientation,
        setBounces : setBounces,
        setIsPaged : setIsPaged,
        prevPage : prevPage,
        nextPage : nextPage,
        setPage : setPage,
        getPage : getPage,
        getNumPages : getNumPages,
        getScrollLength : getScrollLength,
        scrollToEnd : scrollToEnd,
        scrollToTop: scrollToTop,
        scrollToPosition : scrollToPosition,
        scrollToPercent : scrollToPercent,
        setOffsetPosition : setOffsetPosition,
        getCurScrollPosition : getCurScrollPosition,
        getCurScrollPercent : getCurScrollPercent,
        setIsHardwareAcceleratedCSS : setIsHardwareAcceleratedCSS,
        getIsHardwareAcceleratedCSS : getIsHardwareAcceleratedCSS,
        setNonPagedFrictionIsShort : setNonPagedFrictionIsShort,
        setStayInBounds : setStayInBounds,
        showScrollbars : showScrollbars,
        setScrollerDelegate : setScrollerDelegate,
        reset : reset,
        dispose : dispose
    };
    return _publicInterface;
};

utensils.TouchScroller.HORIZONTAL = 'horizontal';
utensils.TouchScroller.VERTICAL = 'vertical';
utensils.TouchScroller.UNLOCKED = null;

utensils.TouchScroller.activeScrollerInstance = null;
utensils.TouchScroller.innermostScrollerInstance = null;
var TouchScrollerFormFocus = function( scrollerObj, scrollOuter ) {

  // app objects & elements
  var _scroller = scrollerObj,
      _focused_element = null,
      IPHONE_SCROLL_TARGET = 56,
      IPAD_KEYBOARD_HEIGHT = 264,
      INPUT_SELECTOR = 'input, select', // textarea
      BLUR_DRAG_DISTANCE = 25,
      _windowOffsetInterval = null,
      _defeatNativeInputFocusCount = 0,
      _isScrolling = false,
      _isiPhone = navigator.userAgent.match(/iPhone/i),
      _isiPad = navigator.userAgent.match(/iPad/i);

  var init = function() {
    enableInputFocusScrolling();
    fixWindow();
  };

  var fixWindow = function() {
    requestAnimationFrame( fixWindow );
    forceContainerDefaultPosition();
  };

  var forceContainerDefaultPosition = function(){
    // if(window.pageXOffset != 0 || window.pageXOffset != 0)
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  };

  var removeInputFocus = function( shouldBlur ) {
    if( shouldBlur ) {
      document.activeElement.blur();
      $( INPUT_SELECTOR ).blur();
    }
    if( _scroller ) _scroller.setNonPagedFrictionIsShort( false );
    if( _scroller ) _scroller.setStayInBounds( true );
    forceContainerDefaultPosition();
  };

  var scrollToElement = function( element ){
    _focused_element = element;

      // find current position, and animate to location by setting scroller velocity
    var outerOffset = $( scrollOuter ).offset().top;
    var elemOffset = $( element ).offset().top;

    var targetOffset = 0;
    if( _isiPhone ) {
      // iphone always focuses current element in the same spot
      targetOffset = IPHONE_SCROLL_TARGET - elemOffset + outerOffset;
    } else {
      // scroll on larger screens if needed - only scroll if the input is off the screen in either direction
      var topPad = 15;
      var bottomPad = 70;
      bottomPad += ( _isiPad ) ? IPAD_KEYBOARD_HEIGHT : 0;
      var screenH = $(window).height() - bottomPad - outerOffset;
      // scroll up if fields would be hidden by soft keyboard when tabbing between fields
      if( elemOffset > screenH ) targetOffset = screenH - elemOffset;
      // scroll down if tabbing backwards
      if( elemOffset < outerOffset + topPad ) targetOffset = outerOffset + topPad;
    }

    // if we have to manually scroll, set props to allow fast scrolling to the focused element
    _scroller.setStayInBounds( false );
    _scroller.setNonPagedFrictionIsShort( true );
    _scroller.setOffsetPosition( -targetOffset );
    _isScrolling = true;
  };

  var fixWindowPosition = function() {
    _defeatNativeInputFocusCount = 0;
    fixWindowStep();
  };

  var fixWindowStep = function() {
    var parent = $(_focused_element).parent()[0];
    var inner = $(_focused_element).closest('.scroll_inner')[0];
    var body = $('body')[0];

    if( _defeatNativeInputFocusCount > 100) return;
    if( _focused_element == null ) return;

    // use optimal method to animate 60+ fps
    if( window.requestAnimationFrame ) {
      window.requestAnimationFrame( fixWindowStep );
      _defeatNativeInputFocusCount++;
    }
    else
      setTimeout( function() {
        fixWindowStep();
        _defeatNativeInputFocusCount++;
      }, 16 );
  };

  var enableInputFocusScrolling = function() {
    // handle the funky native browser scrolling that takes place if display:hidden is on the outer container
    // the developer will have to use z-indexes and hide the scroll overflow under other elements, like a header and footer.
    $( scrollOuter ).css({ overflow:'visible' });

    // some of this doesn't work perfectly in a browser, but should in iOS
    // listen to focus, and scroll to the form element
    $(scrollOuter).find( INPUT_SELECTOR ).bind('focus',function(e) {
      e.preventDefault();
      e.stopPropagation();
      var element = this;
      if( _focused_element == null || _focused_element != element ) {
        scrollToElement( element );
        fixWindowPosition();
      }
    });

    // clear currently-focused input, but check after a timeout to see if another's been focused. otherwise, set scroller to stay in bounds again
    $(scrollOuter).find( INPUT_SELECTOR ).bind('blur',function() {
      _focused_element = null;
      removeInputFocus( false );
      fixWindowPosition();
    });
  };

  var dispose = function() {
    removeInputFocus( true );
    if( _scroller ) _scroller.dispose();
    _scroller = null;
    _focused_element = null;
    _css_helper = null;
    $(scrollOuter).find( INPUT_SELECTOR ).unbind();
    clearInterval( _windowOffsetInterval );
  };

  // TouchScroller delegate methods ---------------------------------------------------
  var updatePosition = function( touchMovedX, touchMovedY, isTouching ) {
    if( isTouching && Math.abs( touchMovedY ) > BLUR_DRAG_DISTANCE ) {
      if( _focused_element != null ) {
        _focused_element = null;
        removeInputFocus( true );
      }
      _scroller.setNonPagedFrictionIsShort( false );
    }
  };

  var handleDestination = function() {
    if( _focused_element && _isScrolling ) {
      _isScrolling = false;
      // add/remove zero at end of input value to reset the caret position... hacky.
      var inputEl = $( _focused_element );
      var inputType = inputEl.attr('type');
      if( inputType == 'text' || inputType == 'tel' || inputType == 'email' ) {
        var inputVal = inputEl.val();
        $( _focused_element ).val( inputVal+'0' );
        $( _focused_element ).val( inputVal );
      }
    }
  };

  // Public interface ---------------------------------------------------
  return {
    init : init,
    scrollToElement : scrollToElement,
    updatePosition : updatePosition,
    handleDestination : handleDestination,
    dispose : dispose
  }
};
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.ScrollableContent = (function() {

    function ScrollableContent(el) {
      this.onTouchScrollerScroll = __bind(this.onTouchScrollerScroll, this);

      this.buildScroller = __bind(this.buildScroller, this);

      this.buildMarkup = __bind(this.buildMarkup, this);

      this.cancelIfMenuOpen = __bind(this.cancelIfMenuOpen, this);

      this.usesTouchScroller = __bind(this.usesTouchScroller, this);
      this.el = $(el);
      this.isLegacyAndroid = $.os.android && parseInt($.os.version.split()[0]) < 3;
      this.isAppMenu = this.el.parents('#app_menu').length > 0;
      this.isIconGrid = this.el.parents('.icon-grid').length > 0;
      if (this.usesTouchScroller()) {
        this.buildMarkup();
        this.buildScroller();
        if (this.el.hasClass('form-scroller')) {
          this.buildFormScroller();
        }
      } else {
        this.el.addClass('native-scroll');
        if (this.el.data('top')) {
          this.el.css({
            top: this.el.data('top')
          });
        }
      }
      $(window).on('scroll touchmove', this.cancelIfMenuOpen);
    }

    ScrollableContent.prototype.usesTouchScroller = function() {
      return this.isLegacyAndroid || this.isAppMenu || this.isIconGrid;
    };

    ScrollableContent.prototype.cancelIfMenuOpen = function(e) {
      if (TopFan.AppMenu.getInstance().isMenuOpen()) {
        return e.preventDefault();
      }
    };

    ScrollableContent.prototype.buildMarkup = function() {
      this.el.wrap('<div class="scroll-outer"></div>');
      this.el.wrap('<div class="scroll-inner"></div>');
      this.outer = this.el.parent().parent();
      this.inner = this.el.parent();
      if (this.el.data('top')) {
        return this.outer.css({
          top: this.el.data('top')
        });
      }
    };

    ScrollableContent.prototype.buildScroller = function() {
      var options;
      options = {
        hasScrollbars: false,
        hasCursor: false,
        isPaged: false,
        defaultOrientation: utensils.TouchScroller.VERTICAL,
        disabledElements: 'img div',
        scrollerDelegate: {
          updatePosition: this.onTouchScrollerScroll
        }
      };
      return this.scroller = new utensils.TouchScroller(this.outer[0], this.inner[0], options);
    };

    ScrollableContent.prototype.buildFormScroller = function() {
      this.scrollerFormFocus = new TouchScrollerFormFocus(this.scroller, this.outer[0]);
      this.scrollerFormFocus.init();
      return this.scroller.setScrollerDelegate(this.scrollerFormFocus);
    };

    ScrollableContent.prototype.dispose = function() {
      var _ref, _ref1;
      $(document).off('scroll touchmove');
      if ((_ref = this.scroller) != null) {
        _ref.dispose();
      }
      return (_ref1 = this.scrollerFormFocus) != null ? _ref1.dispose() : void 0;
    };

    ScrollableContent.prototype.scrollToTop = function(immediately, axis) {
      var _ref;
      if (immediately == null) {
        immediately = true;
      }
      if (axis == null) {
        axis = "y";
      }
      if (this.usesTouchScroller()) {
        return (_ref = this.scroller) != null ? _ref.scrollToTop(immediately, axis) : void 0;
      } else {
        return this.el[0].scrollTop = 0;
      }
    };

    ScrollableContent.prototype.onTouchScrollerScroll = function() {
      if (TopFan.AppState.getInstance().isVisitMobile()) {
        return $(document.body).trigger('touchscroller-scroll');
      }
    };

    return ScrollableContent;

  })();

  Bindable.register('scrollable-content', TopFan.ScrollableContent);

}).call(this);
(function() {
  var SectionImageLoader,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SectionImageLoader = (function(_super) {
    var imagesLoaded;

    __extends(SectionImageLoader, _super);

    SectionImageLoader.include(Spine.Log);

    SectionImageLoader.timeout = 15000;

    imagesLoaded = true;

    function SectionImageLoader() {
      this.imagesDidNotLoad = __bind(this.imagesDidNotLoad, this);

      this.imagesDidLoad = __bind(this.imagesDidLoad, this);

      this.imageDidLoad = __bind(this.imageDidLoad, this);

      this.imageDidError = __bind(this.imageDidError, this);

      this.waitForLoad = __bind(this.waitForLoad, this);
      SectionImageLoader.__super__.constructor.apply(this, arguments);
      this.loadedCount = 0;
      this.loadThreshold = 0;
    }

    SectionImageLoader.prototype.waitForLoad = function() {
      var image, imageCount, _i, _len, _ref, _ref1;
      if (!this.imagesLoaded && this.images) {
        this.cleanupImagesLoad();
      }
      this.images = $('section.panel.active img[src]');
      imageCount = this.images.length;
      if (imageCount > 0) {
        this.loadedCount = 0;
        this.loadThreshold = imageCount;
        this.imagesLoaded = false;
        this.log("SectionImageLoader: Loading " + imageCount + " images");
        Spine.Mobile.Stage.globalStage().hideContentShowLoader();
        _ref = this.images;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          image = _ref[_i];
          if (image.naturalWidth > 0) {
            this.imageDidLoad();
          } else {
            $(image).on('load', this.imageDidLoad);
            $(image).on('error', this.imageDidError);
          }
        }
        return this.noInternetTimeout = setTimeout(this.imagesDidNotLoad, this.constructor.timeout);
      } else {
        return (_ref1 = Spine.Mobile.Stage.globalStage()) != null ? _ref1.showContentHideLoader() : void 0;
      }
    };

    SectionImageLoader.prototype.cleanupImagesLoad = function() {
      if (this.images) {
        this.images.off('load', this.imageDidLoad);
        this.images.off('error', this.imageDidError);
      }
      clearTimeout(this.noInternetTimeout);
      return this.noInternetTimeout = null;
    };

    SectionImageLoader.prototype.imageDidError = function() {
      this.logError('SectionImageLoader: Image did not load');
      return this.imageDidLoad();
    };

    SectionImageLoader.prototype.imageDidLoad = function(e) {
      this.loadedCount += 1;
      if (this.loadedCount >= this.loadThreshold) {
        this.loadedCount = 0;
        this.loadThreshold = 0;
        return this.imagesDidLoad();
      }
    };

    SectionImageLoader.prototype.imagesDidLoad = function() {
      var _ref;
      this.log('SectionImageLoader: All images loaded');
      this.imagesLoaded = true;
      this.cleanupImagesLoad();
      return (_ref = Spine.Mobile.Stage.globalStage()) != null ? _ref.showContentHideLoader() : void 0;
    };

    SectionImageLoader.prototype.imagesDidNotLoad = function() {
      var _ref;
      if (!this.imagesLoaded) {
        this.logError('SectionImageLoader: Load timed out');
        this.noInternetTimeout = null;
        return (_ref = Spine.Mobile.Stage.globalStage()) != null ? _ref.showContentHideLoader() : void 0;
      }
    };

    return SectionImageLoader;

  })(Spine.Singleton);

  this.SectionImageLoader = SectionImageLoader;

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["section_title/templates/section_title"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='icon " + this.iconClass + "'></div>\n<span class='text'>" + ($e($c(unescape(this.title)))) + "</span>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {

  TopFan.SectionTitle = (function() {

    function SectionTitle(el) {
      this.el = $(el);
      this.icon = this.el.data('icon');
      this.title = this.el.data('title');
      this.el.html(JST['section_title/templates/section_title']({
        iconClass: this.icon,
        title: this.title
      }));
    }

    return SectionTitle;

  })();

  Bindable.register('section-title', TopFan.SectionTitle);

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["social_feed/templates/social_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item " + this.type + " has-image' data-link='" + ($e($c(this.link))) + "' data-open-externally-ios='" + ($e($c(this.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-android='" + ($e($c(this.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-browser='" + ($e($c(this.use_restricted_internal_browser ? 'yes' : 'no'))) + "'>");
  if (this.icon) {
    $o.push("  <img class='icon' src='" + ($e($c(this.icon))) + "'>");
      }
      $o.push("  <div class='text'>\n    <span class='clipped title'>" + ($e($c(this.type))) + "</span>\n    <span class='date'>" + ($e($c(moment(this.date).format('@ h:mma on M/D/YY')))) + "</span>");
  if (this.text) {
    $o.push("    <div class='body'>" + ($e($c(StringUtil.replaceAscii(StringUtil.unescapeHTML(this.text))))) + "</div>");
      }
  if (this.image && TopFan.AppState.getInstance().isOnline()) {
    $o.push("    <img src='" + ($e($c(this.image))) + "'>");
      }
      $o.push("  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: "right"
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["social_feed/templates/vm_social_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='" + (['listItem--short', "item " + ($e($c(this.type))) + " has-image"].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' data-link='" + ($e($c(this.link))) + "' data-open-externally-ios='" + ($e($c(this.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-android='" + ($e($c(this.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-browser='" + ($e($c(this.use_restricted_internal_browser ? 'yes' : 'no'))) + "'>");
  if (this.icon) {
    $o.push("  <div class='" + (['listItemIcon--short', "vm_" + ($e($c(this.type.toLowerCase())))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "'></div>");
      }
      $o.push("  <div class='listItem__entryInfo--short'>\n    <div class='entry--distance'>" + ($e($c(moment(this.date).format('@ h:mma on M/D/YY')))) + "</div>");
  if (this.text) {
    $o.push("    <div class='entry--social'>" + ($e($c(StringUtil.replaceAscii(StringUtil.unescapeHTML(this.text))))) + "</div>");
      }
  if (this.image && TopFan.AppState.getInstance().isOnline()) {
    $o.push("    <img src='" + ($e($c(this.image))) + "'>");
      }
      $o.push("  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.SocialFeed = (function(_super) {

    __extends(SocialFeed, _super);

    SocialFeed.include(Spine.Log);

    function SocialFeed(el) {
      this.dispose = __bind(this.dispose, this);

      this.handleTap = __bind(this.handleTap, this);

      this.renderVMItem = __bind(this.renderVMItem, this);

      this.renderItem = __bind(this.renderItem, this);

      this.render = __bind(this.render, this);

      this.bindEvents = __bind(this.bindEvents, this);
      this.el = $(el);
      this.bindEvents();
      this.render();
    }

    SocialFeed.prototype.bindEvents = function() {
      TopFan.Managers.SocialFeedManager.bind('update', this.render);
      return this.el.on('tap', '.item', this.handleTap);
    };

    SocialFeed.prototype.render = function() {
      var item, items, spliceAmt, _i, _j, _len, _len1, _results, _results1;
      this.el.html('');
      items = TopFan.Managers.SocialFeedManager.getInstance().allItemsSorted();
      if ($.os.android) {
        spliceAmt = 45;
      } else {
        spliceAmt = 80;
      }
      if (items.length > spliceAmt) {
        items.splice(spliceAmt);
      }
      if (items.length) {
        if (TopFan.AppState.getInstance().isVisitMobile()) {
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            _results.push(this.renderVMItem(item));
          }
          return _results;
        } else {
          _results1 = [];
          for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
            item = items[_j];
            _results1.push(this.renderItem(item));
          }
          return _results1;
        }
      }
    };

    SocialFeed.prototype.renderItem = function(item) {
      var socialImg;
      socialImg = 'assets/';
      switch (item.type.toLowerCase()) {
        case TopFan.Models.SocialItem.PROVIDER_FACEBOOK:
          socialImg += 'social_fb_icon.png';
          break;
        case TopFan.Models.SocialItem.PROVIDER_TWITTER:
          socialImg += 'social_twit_icon.png';
          break;
        case TopFan.Models.SocialItem.PROVIDER_INSTAGRAM:
          socialImg += 'social_instagram_icon.png';
          break;
        case 'news':
          socialImg += 'social_tf_icon.png';
      }
      item.icon = socialImg;
      return this.el.append(JST['social_feed/templates/social_list_item'](item));
    };

    SocialFeed.prototype.renderVMItem = function(item) {
      var socialImg;
      socialImg = 'assets/visitmobile/';
      switch (item.type.toLowerCase()) {
        case TopFan.Models.SocialItem.PROVIDER_FACEBOOK:
          socialImg += 'icon_facebook@2x.png';
          break;
        case TopFan.Models.SocialItem.PROVIDER_TWITTER:
          socialImg += 'icon_twitter@2x.png';
          break;
        case TopFan.Models.SocialItem.PROVIDER_INSTAGRAM:
          socialImg += 'icon_instagram@2x.png';
          break;
        case 'news':
          socialImg += 'icon_news@2x.png';
      }
      item.icon = socialImg;
      return this.el.append(JST['social_feed/templates/vm_social_list_item'](item));
    };

    SocialFeed.prototype.handleTap = function(e) {
      var el, link;
      el = $(e.target).closest('.item');
      link = el.data('link');
      return TopFan.ExternalLinkHelper.open(link, el.data('open-externally-ios') === 'yes', el.data('open-externally-android') === 'yes', el.data('use-restricted-browser') === 'yes');
    };

    SocialFeed.prototype.dispose = function() {
      return TopFan.Managers.SocialFeedManager.unbind('update', this.render);
    };

    return SocialFeed;

  })(Spine.Module);

  Bindable.register('social-feed', TopFan.SocialFeed);

}).call(this);
(function() {

  TopFan.SoftKeyboard = (function() {

    function SoftKeyboard() {}

    SoftKeyboard.show = function() {
      var _ref;
      $($('input')[0]).focus();
      if (window.softKeyboard && (((_ref = $.os) != null ? _ref.android : void 0) != null)) {
        return window.softKeyboard.show();
      }
    };

    SoftKeyboard.hide = function() {
      var _ref;
      if (window.softKeyboard && (((_ref = $.os) != null ? _ref.android : void 0) != null)) {
        window.softKeyboard.hide();
      }
      document.activeElement.blur();
      return $('input').blur();
    };

    return SoftKeyboard;

  })();

}).call(this);
(function() {

  utensils.Directional = (function() {

    function Directional(element, container, cardinal, cardinals) {
      if (element == null) {
        element = null;
      }
      if (container == null) {
        container = null;
      }
      this.cardinal = cardinal != null ? cardinal : 'north';
      this.cardinals = cardinals != null ? cardinals : "north east south west";
      this.win = $(window);
      if (element) {
        this.setElement(element);
      }
      if (container) {
        this.setContainer(container);
      }
    }

    Directional.prototype.setElement = function(element) {
      this.element = element;
    };

    Directional.prototype.setContainer = function(container) {
      this.container = container;
    };

    Directional.prototype.setCardinal = function(cardinal) {
      this.cardinal = cardinal;
    };

    Directional.prototype.getCardinals = function() {
      return this.cardinals;
    };

    Directional.prototype.getPlacementAndConstrain = function() {
      return this.constrainToViewport(this.getPlacementFromCardinal());
    };

    Directional.prototype.getPlacementFromCardinal = function(cardinal) {
      var cd, ed;
      if (cardinal == null) {
        cardinal = this.cardinal;
      }
      ed = this.getDimensions(this.element);
      cd = this.getDimensions(this.container);
      if (cardinal === 'north') {
        return {
          cardinal: 'north',
          top: Math.round(cd.top - ed.height),
          left: Math.round(cd.left + cd.width * 0.5 - ed.width * 0.5),
          offsetTop: 0,
          offsetLeft: 0
        };
      } else if (cardinal === 'south') {
        return {
          cardinal: 'south',
          top: Math.round(cd.top + cd.height),
          left: Math.round(cd.left + cd.width * 0.5 - ed.width * 0.5),
          offsetTop: 0,
          offsetLeft: 0
        };
      } else if (cardinal === 'east') {
        return {
          cardinal: 'east',
          top: Math.round(cd.top + cd.height * 0.5 - ed.height * 0.5),
          left: Math.round(cd.left + cd.width),
          offsetTop: 0,
          offsetLeft: 0
        };
      } else if (cardinal === 'west') {
        return {
          cardinal: 'west',
          top: Math.round(cd.top + cd.height * 0.5 - ed.height * 0.5),
          left: Math.round(cd.left - ed.width),
          offsetTop: 0,
          offsetLeft: 0
        };
      }
      return {
        cardinal: cardinal,
        top: 0,
        left: 0
      };
    };

    Directional.prototype.constrainToViewport = function(position, areas) {
      var area, cardinal, lastArea, potential, preferredArea, _i, _len, _ref;
      if (areas == null) {
        areas = {};
      }
      position = this.getPlacementFromCardinal(this.cardinal);
      preferredArea = this.calculateOffsetFromVisibleArea(position);
      if (preferredArea === 1) {
        return position;
      }
      lastArea = 0;
      _ref = this.getCardinals().split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cardinal = _ref[_i];
        potential = this.getPlacementFromCardinal(cardinal);
        area = this.calculateOffsetFromVisibleArea(potential);
        if (area > lastArea || area === lastArea && cardinal === this.cardinal) {
          position = potential;
          lastArea = area;
        }
      }
      return position;
    };

    Directional.prototype.calculateOffsetFromVisibleArea = function(position) {
      var area, eb, eh, el, er, et, ew, offset, padding, visibleArea, wb, wh, wl, wr, wt, ww;
      padding = 6;
      ww = this.win.width();
      wh = this.win.height();
      wt = this.win.scrollTop();
      wl = 0;
      wr = wl + ww;
      wb = wt + wh;
      offset = this.element.offset();
      ew = offset.width;
      eh = offset.height;
      et = position.top;
      el = position.left;
      er = position.left + ew;
      eb = position.top + eh;
      area = ew * eh;
      visibleArea = area;
      if (et < wt) {
        offset = wt - et;
        visibleArea -= offset * ew;
        position.offsetTop += offset - padding;
      }
      if (er > wr) {
        offset = er - wr;
        visibleArea -= offset * eh;
        position.offsetLeft -= offset + padding;
      }
      if (eb > wb) {
        offset = eb - wb;
        visibleArea -= offset * ew;
        position.offsetTop -= offset + padding;
      }
      if (el < wl) {
        offset = wl - el;
        visibleArea -= offset * eh;
        position.offsetLeft += offset - padding;
      }
      return visibleArea / area;
    };

    Directional.prototype.getDimensions = function(element) {
      var eo;
      eo = element.offset();
      return {
        top: eo.top,
        left: eo.left,
        width: eo.width,
        height: eo.height
      };
    };

    return Directional;

  })();

}).call(this);
(function() {

  String.prototype.toRGBA = function(a) {
    var b, g, hex, r;
    if (a == null) {
      a = '1.0';
    }
    hex = this.replace('#', '');
    hex = hex.replace(' ', '');
    if (hex.length = 3) {
      hex = hex + hex;
    }
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  };

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.FilterDrop = (function() {

    function FilterDrop(el) {
      this.dispose = __bind(this.dispose, this);

      this.offsetArrow = __bind(this.offsetArrow, this);

      this.hide = __bind(this.hide, this);

      this.show = __bind(this.show, this);

      this.isOpen = __bind(this.isOpen, this);

      this.cancelIfDropOpen = __bind(this.cancelIfDropOpen, this);

      this.handleItem = __bind(this.handleItem, this);

      this.toggleDrop = __bind(this.toggleDrop, this);

      this.activate = __bind(this.activate, this);

      this.bindEvents = __bind(this.bindEvents, this);

      this.build = __bind(this.build, this);
      this.el = $(el);
      this.activeColor = this.el.data('active-color').toRGBA(.2);
      this.targetSelector = this.el.data('target');
      this.build();
      this.bindEvents();
      if (this.filterDrop.find('.active').length === 1) {
        this.activate(this.filterDrop.find('.active'));
      }
    }

    FilterDrop.prototype.build = function() {
      this.disabler = Disabler.getInstance();
      this.filterDrop = $(this.targetSelector);
      this.dropArrow = this.filterDrop.find('.drop-arrow');
      this.items = this.filterDrop.find('.drop-item');
      this.directional = new utensils.Directional(this.filterDrop, this.el, 'south', 'south north');
      return this.cardinals = this.directional.getCardinals();
    };

    FilterDrop.prototype.bindEvents = function() {
      this.el.on('tap', this.toggleDrop);
      this.items.on('tap', this.handleItem);
      return $(window).on('scroll touchmove', this.cancelIfDropOpen);
    };

    FilterDrop.prototype.activate = function(active) {
      var value;
      active.addClass('active');
      active.css({
        backgroundColor: this.activeColor
      });
      value = active.data('value');
      console.log(value);
      if (value === 'all' || value === 'any') {
        this.el.css({
          backgroundColor: 'transparent'
        });
      } else {
        this.el.css({
          backgroundColor: this.activeColor
        });
      }
      return value;
    };

    FilterDrop.prototype.toggleDrop = function(e) {
      if (this.isOpen()) {
        return this.hide();
      } else {
        return this.show();
      }
    };

    FilterDrop.prototype.handleItem = function(e) {
      var active, value;
      this.hide();
      this.items.removeClass('active');
      this.items.css({
        backgroundColor: 'transparent'
      });
      active = $(e.target).closest('.drop-item');
      value = this.activate(active);
      return this.el.trigger('filter', value);
    };

    FilterDrop.prototype.cancelIfDropOpen = function(e) {
      if (this.isOpen() && $(e.target).parents(this.targetSelector).length === 0) {
        return e.preventDefault();
      }
    };

    FilterDrop.prototype.isOpen = function() {
      return !this.filterDrop.hasClass('hidden');
    };

    FilterDrop.prototype.show = function() {
      var position,
        _this = this;
      this.filterDrop.removeClass('hidden');
      position = this.directional.getPlacementAndConstrain();
      this.filterDrop.css({
        left: position.left + position.offsetLeft
      });
      this.filterDrop.removeClass(this.cardinals).addClass(position.cardinal);
      this.filterDrop.css({
        top: position.top
      });
      this.offsetArrow(position);
      this.disabler.disable('.panel.active', true);
      return setTimeout(function() {
        return _this.disabler.el.on('interaction', _this.hide);
      }, 500);
    };

    FilterDrop.prototype.hide = function() {
      this.filterDrop.addClass('hidden');
      this.disabler.detach();
      return this.disabler.el.off('interaction');
    };

    FilterDrop.prototype.offsetArrow = function(position) {
      var arrowPosition;
      this.dropArrow.css({
        left: '50%'
      });
      arrowPosition = this.dropArrow.position();
      switch (position.cardinal) {
        case 'north':
        case 'south':
          return this.dropArrow.css({
            left: arrowPosition.left - position.offsetLeft
          });
      }
    };

    FilterDrop.prototype.dispose = function() {
      this.directional = null;
      return this.disabler.detach();
    };

    return FilterDrop;

  })();

  Bindable.register('filter-drop', TopFan.FilterDrop);

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.SearchInput = (function() {
    var CHARACTER_COUNT;

    CHARACTER_COUNT = 2;

    function SearchInput(el) {
      this.blur = __bind(this.blur, this);

      this.focus = __bind(this.focus, this);

      this.triggerSearch = __bind(this.triggerSearch, this);

      this.searchTimerDone = __bind(this.searchTimerDone, this);

      this.searchApp = __bind(this.searchApp, this);

      this.clearInput = __bind(this.clearInput, this);

      this.clearData = __bind(this.clearData, this);

      this.goBack = __bind(this.goBack, this);

      this.toggleClearButton = __bind(this.toggleClearButton, this);

      this.searchByKey = __bind(this.searchByKey, this);

      this.searchByButton = __bind(this.searchByButton, this);

      this.bindEvents = __bind(this.bindEvents, this);

      this.render = __bind(this.render, this);

      var _this = this;
      this.el = $(el);
      this.render();
      this.bindEvents();
      setTimeout(function() {
        if (_this.constructor.entries) {
          _this.triggerSearch();
        }
        if (_this.constructor.query) {
          _this.input.val(_this.constructor.query);
        }
        _this.toggleClearButton();
        return _this.focus();
      }, 100);
    }

    SearchInput.prototype.render = function() {
      this.form = this.el.find('form');
      this.input = this.el.find('.search-input');
      this.cancelButton = this.el.find('.cancel-button');
      return this.clearButton = this.el.find('.clear-x');
    };

    SearchInput.prototype.bindEvents = function() {
      this.form.on('submit', this.searchByButton);
      this.input.on('keyup', this.searchByKey);
      this.cancelButton.on('tap', this.goBack);
      return this.clearButton.on('tap', this.clearInput);
    };

    SearchInput.prototype.searchByButton = function(e) {
      var val;
      val = this.input.val();
      if (val === '') {
        TopFan.Notification.alert("Search term can't be blank");
      } else {
        this.searchApp(val);
      }
      this.input.blur();
      return false;
    };

    SearchInput.prototype.searchByKey = function(e) {
      var val;
      val = this.input.val();
      this.toggleClearButton();
      if (val.length >= CHARACTER_COUNT) {
        return this.searchApp(val);
      }
    };

    SearchInput.prototype.toggleClearButton = function() {
      var val;
      val = this.input.val();
      if (val.length > 0) {
        return this.clearButton.removeClass('hidden');
      } else {
        return this.clearInput();
      }
    };

    SearchInput.prototype.goBack = function(e) {
      this.clearData();
      return history.go(-1);
    };

    SearchInput.prototype.clearData = function() {
      this.constructor.entries = null;
      return this.constructor.query = null;
    };

    SearchInput.prototype.clearInput = function() {
      this.clearButton.trigger('clear');
      this.input.val('');
      this.clearButton.addClass('hidden');
      this.focus();
      return this.clearData();
    };

    SearchInput.prototype.searchApp = function(query) {
      var _this = this;
      clearTimeout(this.timeout);
      return this.timeout = setTimeout(function() {
        return _this.searchTimerDone(query);
      }, 200);
    };

    SearchInput.prototype.searchTimerDone = function(query) {
      var entries;
      clearTimeout(this.timeout);
      this.constructor.query = query;
      entries = TopFan.Models.Client.currentClient().searchAllEntries(this.constructor.query);
      this.constructor.entries = entries;
      return this.triggerSearch();
    };

    SearchInput.prototype.triggerSearch = function() {
      return this.input.trigger('search', {
        entries: this.constructor.entries
      });
    };

    SearchInput.prototype.dispose = function() {
      this.form.off('submit');
      this.input.off('keyup');
      this.cancelButton.off('tap');
      return clearTimeout(this.timeout);
    };

    SearchInput.prototype.focus = function() {
      return this.input.focus();
    };

    SearchInput.prototype.blur = function() {
      this.input.val('');
      return this.input.blur();
    };

    return SearchInput;

  })();

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["floating_nav/templates/floating_nav"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='floating-actions'>\n  <div class='left-actions'>\n    <div class='circle-button menu showhide'></div>\n  </div>\n  <div class='right-actions'>\n    <div class='back circle-button showhide'></div>\n    <div class='circle-button showhide social'></div>\n    <div class='circle-button favorite'></div>\n    <div class='bell circle-button showhide'></div>\n    <div class='circle-button search'></div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.FloatingNav = (function() {

    function FloatingNav(el) {
      this.handleSearch = __bind(this.handleSearch, this);

      this.handleConcierge = __bind(this.handleConcierge, this);

      this.handleFavorite = __bind(this.handleFavorite, this);

      this.handleSocial = __bind(this.handleSocial, this);

      this.handleBack = __bind(this.handleBack, this);

      this.handleMenu = __bind(this.handleMenu, this);

      this.clientDidChange = __bind(this.clientDidChange, this);

      this.routeDidChange = __bind(this.routeDidChange, this);

      this.bindEvents = __bind(this.bindEvents, this);

      this.render = __bind(this.render, this);
      this.el = $(el);
      this.render();
      this.bindEvents();
      this.clientDidChange();
    }

    FloatingNav.prototype.render = function() {
      this.el.html(JST['floating_nav/templates/floating_nav']());
      this.menu = this.el.find('.menu');
      this.back = this.el.find('.back');
      this.social = this.el.find('.social');
      this.favorite = this.el.find('.favorite');
      this.bell = this.el.find('.bell');
      this.search = this.el.find('.search');
      return this.circleButtons = this.el.find('.circle-button');
    };

    FloatingNav.prototype.bindEvents = function() {
      Spine.Route.bind('change', this.routeDidChange);
      TopFan.Models.Client.bind('change', this.clientDidChange);
      this.menu.on('tap', this.handleMenu);
      this.back.on('tap', this.handleBack);
      this.social.on('tap', this.handleSocial);
      this.favorite.on('tap', this.handleFavorite);
      this.bell.on('tap', this.handleConcierge);
      return this.search.on('tap', this.handleSearch);
    };

    window.counter=0;  // counter is using to manage the history for the back button
    FloatingNav.prototype.routeDidChange = function(route, path) {
      this.circleButtons.removeClass('active');
      window.counter++;
      switch (path) {
        case Constants.SEARCH_PATH:
          this.search.addClass('active');
          break;
        case Constants.FAVORITES_PATH:
          this.favorite.addClass('active');
      }
      if (path.match(Constants.MOBILE_CONCIERGE_PATH)) {
        this.bell.addClass('active');
      }
      if (path === Constants.DASHBOARD_PATH) {
        this.back.removeClass('showing');
        this.menu.removeClass('showing');
        if (TopFan.Models.Client.currentClient().isSocialFeedAvailable()) {
          return this.social.addClass('showing');
        }
      } else {
        this.social.removeClass('showing');
        this.menu.addClass('showing');
        this.back.addClass('showing');
      }

      var slugName = localStorage.getItem('slugName');
      if ("/"+slugName === path) {
        this.back.removeClass('showing');
      } else {
        this.back.addClass('showing');
      }

      // Launch-ability show hide back button
      var data_id = localStorage.getItem('data_id');
      if(data_id && window.counter==1) {
        return this.back.removeClass('showing');
      } else {
        if(data_id){
          this.back.addClass('showing');
        }
         this.back;
      }  

    };

    FloatingNav.prototype.clientDidChange = function() {
      if (TopFan.Models.Client.isMobileConciergeAvailable()) {
        return this.bell.addClass('showing');
      } else {
        return this.bell.removeClass('showing');
      }
    };

    FloatingNav.prototype.handleMenu = function(e) {
      return TopFan.AppMenu.getInstance().toggleMenu();
    };

    FloatingNav.prototype.handleBack = function(e) {
      window.counter=window.counter-2;
      return history.go(-1);
    };

    FloatingNav.prototype.handleSocial = function(e) {
      return Spine.Route.navigate(Constants.SOCIAL_FEED_PATH);
    };

    FloatingNav.prototype.handleFavorite = function(e) {
      return Spine.Route.navigate(Constants.FAVORITES_PATH);
    };

    FloatingNav.prototype.handleConcierge = function(e) {
      return Spine.Route.navigate(Constants.MOBILE_CONCIERGE_PATH);
    };

    FloatingNav.prototype.handleSearch = function(e) {
      return Spine.Route.navigate(Constants.SEARCH_PATH);
    };

    return FloatingNav;

  })();

  Bindable.register('floating-nav', TopFan.FloatingNav);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.IconGrid = (function(_super) {

    __extends(IconGrid, _super);

    IconGrid.prototype.events = {
      'tap .icon': 'handleTap'
    };

    function IconGrid(el) {
      this.handleTap = __bind(this.handleTap, this);
      IconGrid.__super__.constructor.call(this, {
        el: $(el)
      });
    }

    IconGrid.prototype.handleTap = function(e) {
      var externalLink, iconEl, openExternallyAndroid, openExternallyIOS, slug, useRestrictedBrowser,
        _this = this;
      iconEl = $(e.target);
      slug = iconEl.data('slug');
      externalLink = iconEl.data('external-link');
      if (!(slug || externalLink)) {
        return;
      }
      if (externalLink) {
        openExternallyIOS = iconEl.data('open-externally-on-ios') === 'yes';
        openExternallyAndroid = iconEl.data('open-externally-on-android') === 'yes';
        useRestrictedBrowser = iconEl.data('use-restricted-internal-browser') === 'yes';
        return setTimeout(function() {
          return TopFan.ExternalLinkHelper.open(externalLink, openExternallyIOS, openExternallyAndroid, useRestrictedBrowser);
        }, 900);
      } else {
        TopFan.AppMenu.getInstance().closeMenu();
        return setTimeout(function() {
          return _this.navigate("/" + slug);
        }, 100);
      }
    };

    return IconGrid;

  })(Spine.Controller);

  Bindable.register('icon-grid', TopFan.IconGrid);

}).call(this);
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3_3.js
// ==/ClosureCompiler==

/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'averageCenter': (boolean) Wether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */

function MarkerClusterer(map, opt_markers, opt_options) {
  // MarkerClusterer implements google.maps.OverlayView interface. We use the
  // extend function to extend MarkerClusterer with google.maps.OverlayView
  // because it might not always be available when the code is defined so we
  // look for it at the last possible moment. If it doesn't exist now then
  // there is no point going ahead :)
  this.extend(MarkerClusterer, google.maps.OverlayView);
  this.map_ = map;

  /**
   * @type {Array.<google.maps.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   *  @type {Array.<Cluster>}
   */
  this.clusters_ = [];

  this.sizes = [53, 56, 66, 78, 90];

  /**
   * @private
   */
  this.styles_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.ready_ = false;

  var options = opt_options || {};

  /**
   * @type {number}
   * @private
   */
  this.gridSize_ = options['gridSize'] || 60;

  /**
   * @private
   */
  this.minClusterSize_ = options['minimumClusterSize'] || 2;


  /**
   * @type {?number}
   * @private
   */
  this.maxZoom_ = options['maxZoom'] || null;

  this.styles_ = options['styles'] || [];

  /**
   * @type {string}
   * @private
   */
  this.imagePath_ = options['imagePath'] ||
      this.MARKER_CLUSTER_IMAGE_PATH_;

  /**
   * @type {string}
   * @private
   */
  this.imageExtension_ = options['imageExtension'] ||
      this.MARKER_CLUSTER_IMAGE_EXTENSION_;

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnClick_ = true;

  if (options['zoomOnClick'] != undefined) {
    this.zoomOnClick_ = options['zoomOnClick'];
  }

  /**
   * @type {boolean}
   * @private
   */
  this.averageCenter_ = false;

  if (options['averageCenter'] != undefined) {
    this.averageCenter_ = options['averageCenter'];
  }

  this.setupStyles_();

  this.setMap(map);

  /**
   * @type {number}
   * @private
   */
  this.prevZoom_ = this.map_.getZoom();

  // Add the map event listeners
  var that = this;
  google.maps.event.addListener(this.map_, 'zoom_changed', function() {
    // Determines map type and prevent illegal zoom levels
    var zoom = that.map_.getZoom();
    var minZoom = that.map_.minZoom || 0;
    var maxZoom = Math.min(that.map_.maxZoom || 100,
                         that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom);
    zoom = Math.min(Math.max(zoom,minZoom),maxZoom);

    if (that.prevZoom_ != zoom) {
      that.prevZoom_ = zoom;
      that.resetViewport();
    }
  });

  google.maps.event.addListener(this.map_, 'idle', function() {
    that.redraw();
  });

  // Finally, add the markers
  if (opt_markers && (opt_markers.length || Object.keys(opt_markers).length)) {
    this.addMarkers(opt_markers, false);
  }
}


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ =
    'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/' +
    'images/m';


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
  this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
  if (this.styles_.length) {
    return;
  }

  for (var i = 0, size; size = this.sizes[i]; i++) {
    this.styles_.push({
      url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
      height: size,
      width: size
    });
  }
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
  var markers = this.getMarkers();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }

  this.map_.fitBounds(bounds);
};


/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
  this.styles_ = styles;
};


/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
  return this.styles_;
};


/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
  return this.zoomOnClick_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
  return this.averageCenter_;
};


/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
  return this.markers_.length;
};


/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
  this.maxZoom_ = maxZoom;
};


/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
  return this.maxZoom_;
};


/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
  var index = 0;
  var count = markers.length;
  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  index = Math.min(index, numStyles);
  return {
    text: count,
    index: index
  };
};


/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
  this.calculator_ = calculator;
};


/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
  return this.calculator_;
};


/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
  if (markers.length) {
    for (var i = 0, marker; marker = markers[i]; i++) {
      this.pushMarkerTo_(marker);
    }
  } else if (Object.keys(markers).length) {
    for (var marker in markers) {
      this.pushMarkerTo_(markers[marker]);
    }
  }
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
  marker.isAdded = false;
  if (marker['draggable']) {
    // If the marker is draggable add a listener so we update the clusters on
    // the drag end.
    var that = this;
    google.maps.event.addListener(marker, 'dragend', function() {
      marker.isAdded = false;
      that.repaint();
    });
  }
  this.markers_.push(marker);
};


/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        index = i;
        break;
      }
    }
  }

  if (index == -1) {
    // Marker is not in our list of markers.
    return false;
  }

  marker.setMap(null);

  this.markers_.splice(index, 1);

  return true;
};


/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
  var removed = this.removeMarker_(marker);

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  } else {
   return false;
  }
};


/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
  var removed = false;

  for (var i = 0, marker; marker = markers[i]; i++) {
    var r = this.removeMarker_(marker);
    removed = removed || r;
  }

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  }
};


/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
  if (!this.ready_) {
    this.ready_ = ready;
    this.createClusters_();
  }
};


/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
  return this.clusters_.length;
};


/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
  return this.map_;
};


/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
  this.map_ = map;
};


/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
  return this.gridSize_;
};


/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
  this.gridSize_ = size;
};


/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
  return this.minClusterSize_;
};

/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
  this.minClusterSize_ = size;
};


/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
  var projection = this.getProjection();

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};


/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
  return bounds.contains(marker.getPosition());
};


/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
  this.resetViewport(true);

  // Set the markers a empty array.
  this.markers_ = [];
};


/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
  // Remove all the clusters
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    cluster.remove();
  }

  // Reset the markers to not be added and to be invisible.
  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    marker.isAdded = false;
    if (opt_hide) {
      marker.setMap(null);
    }
  }

  this.clusters_ = [];
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
  var oldClusters = this.clusters_.slice();
  this.clusters_.length = 0;
  this.resetViewport();
  this.redraw();

  // Remove the old clusters.
  // Do it in a timeout so the other clusters have been drawn first.
  window.setTimeout(function() {
    for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
      cluster.remove();
    }
  }, 0);
};


/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
  this.createClusters_();
};


/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};


/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
  var distance = 40000; // Some large number
  var clusterToAddTo = null;
  var pos = marker.getPosition();
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    var center = cluster.getCenter();
    if (center) {
      var d = this.distanceBetweenPoints_(center, marker.getPosition());
      if (d < distance) {
        distance = d;
        clusterToAddTo = cluster;
      }
    }
  }

  if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
    clusterToAddTo.addMarker(marker);
  } else {
    var cluster = new Cluster(this);
    cluster.addMarker(marker);
    this.clusters_.push(cluster);
  }
};


/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
  if (!this.ready_) {
    return;
  }

  // Get our current map view bounds.
  // Create a new bounds object so we don't affect the map.
  var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
      this.map_.getBounds().getNorthEast());
  var bounds = this.getExtendedBounds(mapBounds);

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
      this.addToClosestCluster_(marker);
    }
  }
};


/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
  this.markerClusterer_ = markerClusterer;
  this.map_ = markerClusterer.getMap();
  this.gridSize_ = markerClusterer.getGridSize();
  this.minClusterSize_ = markerClusterer.getMinClusterSize();
  this.averageCenter_ = markerClusterer.isAverageCenter();
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(),
      markerClusterer.getGridSize());
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
  if (this.isMarkerAlreadyAdded(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  } else {
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
      var lat = (this.center_.lat() * (l-1) + marker.getPosition().lat()) / l;
      var lng = (this.center_.lng() * (l-1) + marker.getPosition().lng()) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
      this.calculateBounds_();
    }
  }

  marker.isAdded = true;
  this.markers_.push(marker);

  var len = this.markers_.length;
  if (len < this.minClusterSize_ && marker.getMap() != this.map_) {
    // Min cluster size not reached so show the marker.
    marker.setMap(this.map_);
  }

  if (len == this.minClusterSize_) {
    // Hide the markers that were showing.
    for (var i = 0; i < len; i++) {
      this.markers_[i].setMap(null);
    }
  }

  if (len >= this.minClusterSize_) {
    marker.setMap(null);
  }

  this.updateIcon();
  return true;
};


/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
  return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  var markers = this.getMarkers();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }
  return bounds;
};


/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
  this.clusterIcon_.remove();
  this.markers_.length = 0;
  delete this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {number} The cluster center.
 */
Cluster.prototype.getSize = function() {
  return this.markers_.length;
};


/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
  return this.center_;
};


/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
  return this.bounds_.contains(marker.getPosition());
};


/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
  return this.map_;
};


/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
  var zoom = this.map_.getZoom();
  var mz = this.markerClusterer_.getMaxZoom();

  if (mz && zoom > mz) {
    // The zoom is greater than our max zoom so show all the markers in cluster.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
      marker.setMap(this.map_);
    }
    return;
  }

  if (this.markers_.length < this.minClusterSize_) {
    // Min cluster size not yet reached.
    this.clusterIcon_.hide();
    return;
  }

  var numStyles = this.markerClusterer_.getStyles().length;
  var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
  this.clusterIcon_.setCenter(this.center_);
  this.clusterIcon_.setSums(sums);
  this.clusterIcon_.show();
};


/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
  cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

  this.styles_ = styles;
  this.padding_ = opt_padding || 0;
  this.cluster_ = cluster;
  this.center_ = null;
  this.map_ = cluster.getMap();
  this.div_ = null;
  this.sums_ = null;
  this.visible_ = false;

  this.setMap(this.map_);
}


/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
ClusterIcon.prototype.triggerClusterClick = function() {
  var markerClusterer = this.cluster_.getMarkerClusterer();

  // Trigger the clusterclick event.
  google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_);

  if (markerClusterer.isZoomOnClick()) {
    // Zoom into the cluster.
    this.map_.fitBounds(this.cluster_.getBounds());
  }
};


/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
  this.div_ = document.createElement('DIV');
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.innerHTML = this.sums_.text;
  }

  var panes = this.getPanes();
  panes.overlayMouseTarget.appendChild(this.div_);

  var that = this;
  google.maps.event.addDomListener(this.div_, 'click', function() {
    that.triggerClusterClick();
  });
};


/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
  var pos = this.getProjection().fromLatLngToDivPixel(latlng);
  pos.x -= parseInt(this.width_ / 2, 10);
  pos.y -= parseInt(this.height_ / 2, 10);
  return pos;
};


/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.top = pos.y + 'px';
    this.div_.style.left = pos.x + 'px';
  }
};


/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.display = 'none';
  }
  this.visible_ = false;
};


/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
  if (this.div_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.style.display = '';
  }
  this.visible_ = true;
};


/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
  this.setMap(null);
};


/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
  if (this.div_ && this.div_.parentNode) {
    this.hide();
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};


/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 */
ClusterIcon.prototype.setSums = function(sums) {
  this.sums_ = sums;
  this.text_ = sums.text;
  this.index_ = sums.index;
  if (this.div_) {
    this.div_.innerHTML = sums.text;
  }

  this.useStyle();
};


/**
 * Sets the icon to the the styles.
 */
ClusterIcon.prototype.useStyle = function() {
  var index = Math.max(0, this.sums_.index - 1);
  index = Math.min(this.styles_.length - 1, index);
  var style = this.styles_[index];
  this.url_ = style['url'];
  this.height_ = style['height'];
  this.width_ = style['width'];
  this.textColor_ = style['textColor'];
  this.anchor_ = style['anchor'];
  this.textSize_ = style['textSize'];
  this.backgroundPosition_ = style['backgroundPosition'];
};


/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
  this.center_ = center;
};


/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
  var style = [];
  style.push('background-image:url(' + this.url_ + ');');
  var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
  style.push('background-position:' + backgroundPosition + ';');

  if (typeof this.anchor_ === 'object') {
    if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 &&
        this.anchor_[0] < this.height_) {
      style.push('height:' + (this.height_ - this.anchor_[0]) +
          'px; padding-top:' + this.anchor_[0] + 'px;');
    } else {
      style.push('height:' + this.height_ + 'px; line-height:' + this.height_ +
          'px;');
    }
    if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 &&
        this.anchor_[1] < this.width_) {
      style.push('width:' + (this.width_ - this.anchor_[1]) +
          'px; padding-left:' + this.anchor_[1] + 'px;');
    } else {
      style.push('width:' + this.width_ + 'px; text-align:center;');
    }
  } else {
    style.push('height:' + this.height_ + 'px; line-height:' +
        this.height_ + 'px; width:' + this.width_ + 'px; text-align:center;');
  }

  var txtColor = this.textColor_ ? this.textColor_ : 'black';
  var txtSize = this.textSize_ ? this.textSize_ : 11;

  style.push('cursor:pointer; top:' + pos.y + 'px; left:' +
      pos.x + 'px; color:' + txtColor + '; position:absolute; font-size:' +
      txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
  return style.join('');
};


// Export Symbols for Closure
// If you are not going to compile with closure then you can remove the
// code below.
window['MarkerClusterer'] = MarkerClusterer;
MarkerClusterer.prototype['addMarker'] = MarkerClusterer.prototype.addMarker;
MarkerClusterer.prototype['addMarkers'] = MarkerClusterer.prototype.addMarkers;
MarkerClusterer.prototype['clearMarkers'] =
    MarkerClusterer.prototype.clearMarkers;
MarkerClusterer.prototype['fitMapToMarkers'] =
    MarkerClusterer.prototype.fitMapToMarkers;
MarkerClusterer.prototype['getCalculator'] =
    MarkerClusterer.prototype.getCalculator;
MarkerClusterer.prototype['getGridSize'] =
    MarkerClusterer.prototype.getGridSize;
MarkerClusterer.prototype['getExtendedBounds'] =
    MarkerClusterer.prototype.getExtendedBounds;
MarkerClusterer.prototype['getMap'] = MarkerClusterer.prototype.getMap;
MarkerClusterer.prototype['getMarkers'] = MarkerClusterer.prototype.getMarkers;
MarkerClusterer.prototype['getMaxZoom'] = MarkerClusterer.prototype.getMaxZoom;
MarkerClusterer.prototype['getStyles'] = MarkerClusterer.prototype.getStyles;
MarkerClusterer.prototype['getTotalClusters'] =
    MarkerClusterer.prototype.getTotalClusters;
MarkerClusterer.prototype['getTotalMarkers'] =
    MarkerClusterer.prototype.getTotalMarkers;
MarkerClusterer.prototype['redraw'] = MarkerClusterer.prototype.redraw;
MarkerClusterer.prototype['removeMarker'] =
    MarkerClusterer.prototype.removeMarker;
MarkerClusterer.prototype['removeMarkers'] =
    MarkerClusterer.prototype.removeMarkers;
MarkerClusterer.prototype['resetViewport'] =
    MarkerClusterer.prototype.resetViewport;
MarkerClusterer.prototype['repaint'] =
    MarkerClusterer.prototype.repaint;
MarkerClusterer.prototype['setCalculator'] =
    MarkerClusterer.prototype.setCalculator;
MarkerClusterer.prototype['setGridSize'] =
    MarkerClusterer.prototype.setGridSize;
MarkerClusterer.prototype['setMaxZoom'] =
    MarkerClusterer.prototype.setMaxZoom;
MarkerClusterer.prototype['onAdd'] = MarkerClusterer.prototype.onAdd;
MarkerClusterer.prototype['draw'] = MarkerClusterer.prototype.draw;

Cluster.prototype['getCenter'] = Cluster.prototype.getCenter;
Cluster.prototype['getSize'] = Cluster.prototype.getSize;
Cluster.prototype['getMarkers'] = Cluster.prototype.getMarkers;

ClusterIcon.prototype['onAdd'] = ClusterIcon.prototype.onAdd;
ClusterIcon.prototype['draw'] = ClusterIcon.prototype.draw;
ClusterIcon.prototype['onRemove'] = ClusterIcon.prototype.onRemove;

Object.keys = Object.keys || function(o) {
    var result = [];
    for(var name in o) {
        if (o.hasOwnProperty(name))
          result.push(name);
    }
    return result;
};
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.MapView = (function(_super) {

    __extends(MapView, _super);

    function MapView() {
      this.setCenter = __bind(this.setCenter, this);

      this.resetSize = __bind(this.resetSize, this);

      this.removeMarkers = __bind(this.removeMarkers, this);

      this.clearMarkers = __bind(this.clearMarkers, this);

      this.reset = __bind(this.reset, this);

      this.geolocationSuccess = __bind(this.geolocationSuccess, this);

      this.stopWatchingPosition = __bind(this.stopWatchingPosition, this);

      this.watchPosition = __bind(this.watchPosition, this);

      this.addMapToEl = __bind(this.addMapToEl, this);

      this.showEntryDetail = __bind(this.showEntryDetail, this);

      this.addMarker = __bind(this.addMarker, this);

      this.fitCurrentBounds = __bind(this.fitCurrentBounds, this);

      this.fitBoundsOrSetCenter = __bind(this.fitBoundsOrSetCenter, this);

      this.buildClusterer = __bind(this.buildClusterer, this);

      this.addMarkersForEntries = __bind(this.addMarkersForEntries, this);

      this.shrink = __bind(this.shrink, this);

      this.enlarge = __bind(this.enlarge, this);

      this.captureLinks = __bind(this.captureLinks, this);

      this.convertLinksToSpans = __bind(this.convertLinksToSpans, this);

      this.tilesDidLoad = __bind(this.tilesDidLoad, this);

      this.disableCentering = __bind(this.disableCentering, this);

      this.onClickMap = __bind(this.onClickMap, this);

      this.onDragStartMap = __bind(this.onDragStartMap, this);
      this.initialize();
      this.moveGoogleLogo();
      this.buildMap();
      this.buildPositionMarker();
      this.buildInfoWindow();
      this.bindEvents();
    }

    MapView.prototype.initialize = function() {
      this.normalHeight = Math.floor($(window).width() * .57);
      this.enlargedHeight = Math.floor($(window).height() - 52);
      this.el = $('<div class="map-content">');
      this.el.width('100%');
      this.el.height(this.normalHeight);
      this.markers = {};
      this.markerIcons = {};
      this.entries = [];
      this.currentMarkers = [];
      this.centeringDisabled = false;
      this.isEnlarged = false;
      return this.locationService = TopFan.Services.LocationService.getInstance();
    };

    MapView.prototype.moveGoogleLogo = function() {
      var css;
      css = document.createElement("style");
      css.type = "text/css";
      css.innerHTML = "img[src*='google_white'] {top:-12px !important; left:" + ($(window).width() - 70) + "px !important;} ";
      return document.head.appendChild(css);
    };

    MapView.prototype.buildMap = function() {
      var options, styles;
      styles = [];
      styles.push({
        featureType: "poi",
        elementType: "labels",
        stylers: [
          {
            visibility: "off"
          }
        ]
      });
      options = {
        center: this.locationService.centerLatLong,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styles,
        zoom: TopFan.Models.Client.currentClient().zoom_level || 13
      };
      return this.map = new google.maps.Map(this.el[0], options);
    };

    MapView.prototype.buildPositionMarker = function() {
      var options;
      options = {
        flat: true,
        map: this.map,
        icon: {
          anchor: new google.maps.Point(17, 17),
          url: 'assets/visitmobile/me_marker.png'
        }
      };
      return this.markers['position'] = new google.maps.Marker(options);
    };

    MapView.prototype.buildInfoWindow = function() {
      var options;
      options = {
        pixelOffset: new google.maps.Size(-1, -17)
      };
      this.infoWindow = new google.maps.InfoWindow(options);
      return this.el.on('tap', '.entry-info-window', this.showEntryDetail);
    };

    MapView.prototype.bindEvents = function() {
      this.el.on('transitionend', this.resetSize);
      this.el.on('tap', 'span.captured-map-link', this.captureLinks);
      google.maps.event.addListener(this.map, 'dragstart', this.onDragStartMap);
      google.maps.event.addListener(this.map, 'click', this.onClickMap);
      return google.maps.event.addListener(this.map, 'tilesloaded', this.tilesDidLoad);
    };

    MapView.prototype.onDragStartMap = function(e) {
      this.infoWindow.close();
      return this.disableCentering();
    };

    MapView.prototype.onClickMap = function(e) {
      this.infoWindow.close();
      return this.disableCentering();
    };

    MapView.prototype.disableCentering = function() {
      return this.centeringDisabled = true;
    };

    MapView.prototype.tilesDidLoad = function() {
      var _this = this;
      return setTimeout(function() {
        return _this.convertLinksToSpans();
      }, 500);
    };

    MapView.prototype.convertLinksToSpans = function() {
      var link, links, span, _i, _len,
        _this = this;
      links = this.el.find('a');
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        link = $(link);
        span = "<span style='" + (link.attr('style')) + "' data-href='" + (link.attr("href")) + "' class='captured-map-link'>" + (link.html()) + "</span>";
        link.replaceWith(span);
      }
      if (links.length === 0) {
        return setTimeout(function() {
          return _this.convertLinksToSpans();
        }, 200);
      }
    };

    MapView.prototype.captureLinks = function(e) {
      var link;
      link = $(e.target).closest('span').data('href');
      if (link && link.length > 4) {
        return TopFan.ExternalLinkHelper.open(link);
      }
    };

    MapView.prototype.enlarge = function(height) {
      if (height) {
        this.el.height(height);
      } else {
        this.el.height(this.enlargedHeight);
      }
      return this.isEnlarged = true;
    };

    MapView.prototype.shrink = function() {
      this.el.height(this.normalHeight);
      return this.isEnlarged = false;
    };

    MapView.prototype.addMarkersForEntries = function(entries, clusterColor) {
      var entry, _i, _len, _ref;
      if (!(entries && entries.length > 0)) {
        return;
      }
      this.clearMarkers();
      this.entries = entries;
      this.currentMarkers = [];
      _ref = this.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        this.currentMarkers.push(this.addMarker(entry));
      }
      this.map.setZoom(TopFan.Models.Client.currentClient().zoom_level || 13);
      this.setCenter();
      return this.buildClusterer(clusterColor);
    };

    MapView.prototype.buildClusterer = function(clusterColor) {
      var clusterOptions,
        _this = this;
      clusterOptions = {
        gridSize: 30,
        zoomOnClick: true,
        maxZoom: 15,
        averageCenter: true,
        styles: [
          {
            textColor: '#333333',
            url: 'data:image/svg+xml;base64,' + window.btoa(Constants.MAP_CLUSTER_MARKER_SVG.replace(/FILL_COLOR/g, clusterColor).replace(/SIZE/g, "26").replace(/FILL_RADIUS/g, '11').replace(/RADIUS/g, "13")),
            width: 26,
            height: 26
          }, {
            textColor: '#333333',
            url: 'data:image/svg+xml;base64,' + window.btoa(Constants.MAP_CLUSTER_MARKER_SVG.replace(/FILL_COLOR/g, clusterColor).replace(/SIZE/g, "32").replace(/FILL_RADIUS/g, '14').replace(/RADIUS/g, "16")),
            width: 32,
            height: 32
          }, {
            textColor: '#333333',
            url: 'data:image/svg+xml;base64,' + window.btoa(Constants.MAP_CLUSTER_MARKER_SVG.replace(/FILL_COLOR/g, clusterColor).replace(/SIZE/g, "38").replace(/FILL_RADIUS/g, '17').replace(/RADIUS/g, "19")),
            width: 38,
            height: 38
          }
        ]
      };
      if (!this.map.mapTypes[this.map.getMapTypeId()]) {
        return setTimeout(function() {
          return _this.markerClusterer = new MarkerClusterer(_this.map, _this.currentMarkers, clusterOptions);
        }, 300);
      } else {
        this.markerClusterer = new MarkerClusterer(this.map, this.currentMarkers, clusterOptions);
      }
    };

    MapView.prototype.fitBoundsOrSetCenter = function() {};

    MapView.prototype.fitCurrentBounds = function() {
      var _this = this;
      if (!this.fitBounds) {
        return;
      }
      this.map.fitBounds(this.fitBounds);
      return google.maps.event.addListenerOnce(this.map, "idle", function() {
        if (_this.map.getZoom() > 16) {
          return _this.map.setZoom(16);
        }
      });
    };

    MapView.prototype.addMarker = function(entry) {
      var icon, iconUrl, marker, markerOptions,
        _this = this;
      marker = this.markers[entry.id];
      if (marker) {
        marker.setMap(this.map);
        return marker;
      }
      iconUrl = this.markerIcons[entry.color];
      if (!iconUrl) {
        iconUrl = 'data:image/svg+xml;base64,' + window.btoa(Constants.MAP_MARKER_SVG.replace(/FILL_COLOR/g, entry.color));
        this.markerIcons[entry.color] = iconUrl;
      }
      icon = {
        anchor: new google.maps.Point(13, 34),
        url: iconUrl
      };
      markerOptions = {
        flat: true,
        icon: icon,
        map: this.map,
        position: new google.maps.LatLng(entry.latitude, entry.longitude),
        title: entry.name
      };
      marker = new google.maps.Marker(markerOptions);
      google.maps.event.addListener(marker, 'click', function() {
        return _this.showInfoWindow(entry, marker);
      });
      this.markers[entry.id] = marker;
      return marker;
    };

    MapView.prototype.showInfoWindow = function(entry, marker) {
      marker.setZIndex(9999);
      this.infoWindow.setOptions({
        content: "<div class='entry-info-window' data-entry-id='" + entry.id + "'>" + entry.name + "</div>",
        position: marker.getPosition()
      });
      return this.infoWindow.open(this.map);
    };

    MapView.prototype.showEntryDetail = function(e) {
      var entry, id;
      id = $(e.target).data('entry-id');
      entry = TopFan.Models.ListSectionEntry.find(id);
      return this.el.trigger('showdetail', entry);
    };

    MapView.prototype.addMapToEl = function(el) {
      $(el).replaceWith(this.el);
      return google.maps.event.trigger(this.map, 'resize');
    };

    MapView.prototype.watchPosition = function() {
      this.locationService.bind('locationSuccess', this.geolocationSuccess);
      return this.locationService.watchPosition();
    };

    MapView.prototype.stopWatchingPosition = function() {
      this.locationService.unbind('locationSuccess', this.geolocationSuccess);
      return this.locationService.clearWatch();
    };

    MapView.prototype.geolocationSuccess = function() {
      this.markers['position'].setPosition(this.locationService.positionLatLong);
      return this.setCenter();
    };

    MapView.prototype.reset = function() {
      this.entries = [];
      this.currentMarkers = [];
      this.el.detach();
      this.clearMarkers();
      this.stopWatchingPosition();
      this.centeringDisabled = false;
      this.infoWindow.close();
      return this.setCenter();
    };

    MapView.prototype.clearMarkers = function() {
      var key, marker, _ref, _ref1;
      _ref = this.markers;
      for (key in _ref) {
        marker = _ref[key];
        if (key !== 'position') {
          marker.setMap(null);
        }
      }
      if ((_ref1 = this.markerClusterer) != null) {
        _ref1.clearMarkers();
      }
      return this.markerClusterer = null;
    };

    MapView.prototype.removeMarkers = function() {
      var key, marker, _ref,
        _this = this;
      _ref = this.markers;
      for (key in _ref) {
        marker = _ref[key];
        if (key !== 'position') {
          marker.setMap(null);
          marker = null;
          delete this.markers[key];
        }
      }
      return setTimeout(function() {
        return _this.el.trigger('markersremoved');
      }, 500);
    };

    MapView.prototype.resetSize = function(e) {
      if (e.target !== this.el[0]) {
        return;
      }
      google.maps.event.trigger(this.map, 'resize');
      if (this.fitBounds) {
        return this.fitCurrentBounds();
      } else {
        return this.setCenter();
      }
    };

    MapView.prototype.setCenter = function(latLong) {
      if (this.entries.length && this.entries.length <= 15) {
        return this.fitEntriesToBounds();
      }
      this.fitBounds = null;
      if (latLong) {
        return this.map.setCenter(latLong);
      }
      if (this.centeringDisabled) {
        return;
      }
      if (this.entries.length === 1) {
        return this.map.setCenter(this.markers[this.entries[0].id].getPosition());
      }
      if (this.locationService.usePositionToCenter && this.locationService.positionLatLong) {
        return this.map.setCenter(this.locationService.positionLatLong);
      } else if (this.locationService.centerLatLong) {
        return this.map.setCenter(this.locationService.centerLatLong);
      }
    };

    MapView.prototype.fitEntriesToBounds = function() {
      var marker, _i, _len, _ref;
      if (!this.currentMarkers.length) {
        return;
      }
      this.fitBounds = new google.maps.LatLngBounds();
      _ref = this.currentMarkers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        this.fitBounds.extend(marker.getPosition());
      }
      if (this.locationService.usePositionToCenter && this.markers['position'].getPosition()) {
        this.fitBounds.extend(this.markers['position'].getPosition());
      }
      return this.fitCurrentBounds();
    };

    return MapView;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.NamePopup = (function() {

    function NamePopup(el) {
      this.dispose = __bind(this.dispose, this);

      this.hideName = __bind(this.hideName, this);

      this.showName = __bind(this.showName, this);

      this.onScroll = __bind(this.onScroll, this);

      this.onTap = __bind(this.onTap, this);

      this.onTouchMove = __bind(this.onTouchMove, this);

      this.onTouchEnd = __bind(this.onTouchEnd, this);

      this.onTouchStart = __bind(this.onTouchStart, this);
      this.el = $(el);
      this.body = $(document.body);
      this.icons = this.el.find('.icon');
      this.sectionIcons = this.el.find('.icon[data-id]');
      this.pop = this.el.find('.name-pop');
      this.bindEvents();
    }

    NamePopup.prototype.bindEvents = function() {
      this.sectionIcons.on('touchstart', this.onTouchStart);
      this.sectionIcons.on('touchend', this.onTouchEnd);
      this.sectionIcons.on('tap', this.onTap);
      return $(document.body).on('touchscroller-scroll', this.onScroll);
    };

    NamePopup.prototype.onTouchStart = function(e) {
      var sectionId,
        _this = this;
      this.xp = e.touches[0].screenX;
      this.yp = e.touches[0].screenY;
      if (!(sectionId = $(e.target).data('id'))) {
        return;
      }
      this.section = TopFan.Models.ListSection.find(sectionId);
      return this.timeout = setTimeout(function() {
        _this.showName(_this.section.name, e.target, _this.xp, _this.yp);
        return _this.body.on('touchmove', _this.onTouchMove);
      }, 300);
    };

    NamePopup.prototype.onTouchEnd = function(e) {
      clearTimeout(this.timeout);
      this.hideName();
      return this.body.off('touchmove');
    };

    NamePopup.prototype.onTouchMove = function(e) {
      var el, id, touch, _i, _len, _ref;
      e.preventDefault();
      e.stopPropagation();
      _ref = e.touches;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        touch = _ref[_i];
        el = document.elementFromPoint(touch.screenX, touch.screenY);
        if (id = $(el).data('id')) {
          this.section = TopFan.Models.ListSection.find(id);
          this.xp = touch.screenX;
          this.yp = touch.screenY;
          return this.showName(this.section.name, el, this.xp, this.yp);
        } else {
          this.hideName();
        }
      }
    };

    NamePopup.prototype.onTap = function(e) {
      var _this = this;
      this.showName(this.section.name, e.target, this.xp, this.yp);
      return setTimeout(function() {
        return _this.onTouchEnd(null);
      }, 1000);
    };

    NamePopup.prototype.onScroll = function(e) {
      return this.onTouchEnd(null);
    };

    NamePopup.prototype.showName = function(name, activeEl, xp, yp) {
      var half, left, popWidth, windowWidth;
      this.pop.html(name);
      this.pop.addClass('active');
      this.icons.addClass('darken');
      $(activeEl).removeClass('darken');
      popWidth = this.pop.width();
      windowWidth = $(window).width();
      half = popWidth * .5;
      left = xp - half;
      if (left < 0) {
        left = 0;
      } else if (left + popWidth > windowWidth) {
        left = windowWidth - popWidth;
      }
      return this.pop.css({
        left: left,
        top: yp - 100
      });
    };

    NamePopup.prototype.hideName = function() {
      this.pop.removeClass('active');
      return this.icons.removeClass('darken');
    };

    NamePopup.prototype.dispose = function() {
      this.sectionIcons.off('touchstart');
      this.sectionIcons.off('touchend');
      this.sectionIcons.off('tap');
      this.onTouchEnd();
      return this.icons = null;
    };

    return NamePopup;

  })();

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["promo_image/templates/promo_image"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='promo-image'>\n  <img src='assets/promo_default.png'>\n</div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.PromoImage = (function() {

    function PromoImage(el) {
      this.imageLoaded = __bind(this.imageLoaded, this);

      this.fadeINfadeOut = __bind(this.fadeINfadeOut, this);

      this.loadImage = __bind(this.loadImage, this);

      this.render = __bind(this.render, this);
      this.el = $(el);
      this.height = this.el.data('height');
      this.imagePath = this.el.data('image-path');
      this.render();
      if (TopFan.AppState.getInstance().isOnline()) {
        this.loadImage();
      }
    }

    PromoImage.prototype.render = function() {
      this.el.html(JST['promo_image/templates/promo_image']());
      this.promoImage = this.el.find('.promo-image');
      this.promoImage.css({
        height: this.height
      });
      this.promoImage.find('img').css({
        height: this.height
      });
      return this.imageEl = this.promoImage.find('img');
    };

    PromoImage.prototype.loadImage = function() {
      var $i, $o1, currentClient, promo_images;
      currentClient = TopFan.Models.Client.currentClient();
      promo_images = currentClient.promo_images;
      $o1 = [];
      $i = 0;
      while ($i < promo_images.length) {
        if ($i === 0) {
          $o1.push('<img src=\'' + promo_images[$i].promo_image + '\'  class=\'promo-image-active\'>\n');
        } else {
          $o1.push('<img src=\'' + promo_images[$i].promo_image + '\'>\n');
        }
        $i = $i + 1;
      }
      this.el.find('.promo-image').html($o1.join('\n'));
      this.el.find('.promo-image img').css({
        height: this.height
      });
      if (promo_images.length > 1) {
        return this.fadeINfadeOut();
      }
    };

    PromoImage.prototype.fadeINfadeOut = function() {
      return setInterval((function() {
        var $active, $next;
        $active = $('.promo-image .promo-image-active');
        $next = $active.next().length > 0 ? $active.next() : $('.promo-image img:first-child');
        $next.css('z-index', '2');
        $active.fadeOut(1500, function() {
          $active.css('z-index', '1').show().removeClass('promo-image-active');
          $next.css('z-index', '3').addClass('promo-image-active');
        });
      }), 7000);
    };

    PromoImage.prototype.imageLoaded = function() {
      this.image.onload = this.image.onerror = null;
      return this.imageEl.replaceWith(this.image);
    };

    return PromoImage;

  })();

  Bindable.register('promo-image', TopFan.PromoImage);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.SwipeView = (function() {

    function SwipeView(el, data, contentCallback) {
      this.data = data != null ? data : [];
      this.contentCallback = contentCallback != null ? contentCallback : null;
      this.onTransitionEnd = __bind(this.onTransitionEnd, this);

      this.onTouchEnd = __bind(this.onTouchEnd, this);

      this.onTouchMove = __bind(this.onTouchMove, this);

      this.onTouchStart = __bind(this.onTouchStart, this);

      this.el = $(el);
      this.setDefaults();
      this.initialize();
    }

    SwipeView.prototype.setDefaults = function() {
      this.index = 0;
      this.dataIndex = 0;
      this.windowWidth = $(window).width();
      return this.snapThreshold = Math.round(this.windowWidth * 0.15);
    };

    SwipeView.prototype.initialize = function() {
      this.createContainers();
      this.bindEvents();
      return this.setSlides();
    };

    SwipeView.prototype.createContainers = function() {
      this.slider = $('<div class="slider">');
      this.slider.css({
        width: this.windowWidth * 3,
        height: this.el.height()
      });
      this.slider.append($('<div class="slide">'), $('<div class="slide">'), $('<div class="slide">'));
      this.slides = this.slider.find('.slide');
      this.slides.css({
        display: 'inline-block',
        width: this.windowWidth,
        height: this.el.height(),
        verticalAlign: 'top'
      });
      this.el.append(this.slider);
      this.el.css({
        overflow: 'hidden'
      });
      return this.setPosition(-this.windowWidth);
    };

    SwipeView.prototype.bindEvents = function() {
      this.slider.on('touchstart mousedown', this.onTouchStart);
      this.slider.on('touchmove mousemove', this.onTouchMove);
      this.slider.on('touchend mouseup', this.onTouchEnd);
      this.slider.on('touchcancel mouseup', this.onTouchEnd);
      return this.slider.on('webkitTransitionEnd', this.onTransitionEnd);
    };

    SwipeView.prototype.setSlides = function() {
      var slide, startIndex, _i, _len, _ref, _results;
      this.slides = this.slider.find('.slide');
      startIndex = this.dataIndex === 0 ? this.data.length - 1 : this.dataIndex - 1;
      _ref = this.slides;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        slide = _ref[_i];
        slide = $(slide);
        if (!(this.data[startIndex].id === slide.find('.js-item').data('id') && this.data.length > 2)) {
          slide.html(this.contentCallback.call(this, this.data[startIndex]));
        }
        _results.push(startIndex = startIndex === this.data.length - 1 ? 0 : startIndex + 1);
      }
      return _results;
    };

    SwipeView.prototype.onTouchStart = function(e) {
      var point;
      if (this.initiated) {
        return;
      }
      point = this.isTouchEvent(e) ? e.touches[0] : e;
      this.initiated = true;
      this.moved = false;
      this.startX = point.pageX;
      this.startY = point.pageY;
      this.pointX = point.pageX;
      this.pointY = point.pageY;
      this.stepsX = 0;
      this.stepsY = 0;
      this.directionX = 0;
      this.directionLocked = false;
      return this.setTransitionDuration('0s');
    };

    SwipeView.prototype.onTouchMove = function(e) {
      var deltaX, deltaY, dist, newX, point;
      if (!this.initiated) {
        return;
      }
      point = this.isTouchEvent(e) ? e.touches[0] : e;
      deltaX = point.pageX - this.pointX;
      deltaY = point.pageY - this.pointY;
      newX = this.x + deltaX;
      dist = Math.abs(point.pageX - this.startX);
      this.pointX = point.pageX;
      this.pointY = point.pageY;
      this.directionX = 0;
      if (deltaX > 0) {
        this.directionX += 1;
      }
      if (deltaX < 0) {
        this.directionX -= 1;
      }
      this.stepsX += Math.abs(deltaX);
      this.stepsY += Math.abs(deltaY);
      if (this.stepsX < 10 && this.stepsY < 10) {
        return;
      }
      if (!this.directionLocked && this.stepsY > this.stepsX) {
        this.initiated = false;
        return;
      }
      e.preventDefault();
      this.moved = true;
      this.directionLocked = true;
      return this.setPosition(newX);
    };

    SwipeView.prototype.onTouchEnd = function(e) {
      var dist, point;
      if (!this.initiated) {
        return;
      }
      this.initiated = false;
      if (!this.moved) {
        return;
      }
      point = this.isTouchEvent(e) ? e.changedTouches[0] : e;
      dist = Math.abs(point.pageX - this.startX);
      if (dist < this.snapThreshold) {
        this.setTransitionDuration(Math.floor(300 * dist / this.snapThreshold) + 'ms');
        this.setPosition(-this.windowWidth);
        return;
      }
      return this.checkPosition();
    };

    SwipeView.prototype.onTransitionEnd = function(e) {
      if ($(this.slides[1]).find('.js-item').data('id') === this.data[this.dataIndex].id && this.data.length > 2) {
        return;
      }
      if (this.index === 0) {
        this.slider.prepend(this.slides[2]);
      } else if (this.index === 2) {
        this.slider.append(this.slides[0]);
      }
      this.setSlides();
      this.setTransitionDuration('0s');
      return this.setPosition(-this.windowWidth);
    };

    SwipeView.prototype.isTouchEvent = function(e) {
      return e.type.indexOf('touch') !== -1;
    };

    SwipeView.prototype.setTransitionDuration = function(duration) {
      return this.slider.css({
        '-webkit-transitionDuration': duration,
        'transitionDuration': duration
      });
    };

    SwipeView.prototype.setPosition = function(x) {
      var value;
      this.x = x;
      value = "translate(" + this.x + "px, 0) translateZ(0)";
      return this.slider.css({
        '-webkit-transform': value,
        'transform': value
      });
    };

    SwipeView.prototype.checkPosition = function() {
      var newX;
      if (this.directionX > 0) {
        this.index = -Math.ceil(this.x / this.windowWidth);
        this.dataIndex = this.dataIndex === 0 ? this.data.length - 1 : this.dataIndex - 1;
      } else {
        this.index = -Math.floor(this.x / this.windowWidth);
        this.dataIndex = this.dataIndex === this.data.length - 1 ? 0 : this.dataIndex + 1;
      }
      newX = -this.index * this.windowWidth;
      this.setTransitionDuration(Math.floor(200 * Math.abs(this.x - newX) / this.windowWidth) + 'ms');
      return this.setPosition(newX);
    };

    return SwipeView;

  })();

}).call(this);
(function() {



}).call(this);
(function() {



}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Delegates.DeviceDelegate = (function(_super) {

    __extends(DeviceDelegate, _super);

    DeviceDelegate.include(Spine.Log);

    DeviceDelegate.getInstance = function() {
      return this.instance;
    };

    DeviceDelegate.setup = function(bindTarget) {
      this.instance = new this(bindTarget);
      return this.instance.bindEventHandlers();
    };

    DeviceDelegate.teardown = function() {
      this.instance.unbindEventHandlers();
      return delete this.instance;
    };

    function DeviceDelegate(bindTarget, nav) {
      var type, _ref;
      this.bindTarget = bindTarget;
      if (nav == null) {
        nav = window.navigator;
      }
      this.deviceBackButton = __bind(this.deviceBackButton, this);

      this.deviceDidGoOffline = __bind(this.deviceDidGoOffline, this);

      this.deviceDidGoOnline = __bind(this.deviceDidGoOnline, this);

      this.deviceDidResume = __bind(this.deviceDidResume, this);

      this.deviceDidPause = __bind(this.deviceDidPause, this);

      this.startEventHandling = __bind(this.startEventHandling, this);

      this.stopEventHandling = __bind(this.stopEventHandling, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);

      this.handleEvents = true;
      if (nav.onLine) {
        TopFan.AppState.getInstance().setIsOnline(true);
      } else if (type = (_ref = nav.connection) != null ? _ref.type : void 0) {
        if (type === 'none' || type === 'unknown') {
          TopFan.AppState.getInstance().setIsOnline(false);
        }
      } else {
        TopFan.AppState.getInstance().setIsOnline(true);
      }
    }

    DeviceDelegate.prototype.bindEventHandlers = function() {
      this.bindTarget.addEventListener('resume', this.deviceDidResume, false);
      this.bindTarget.addEventListener('pause', this.deviceDidPause, false);
      this.bindTarget.addEventListener('online', this.deviceDidGoOnline, false);
      this.bindTarget.addEventListener('offline', this.deviceDidGoOffline, false);
      return this.bindTarget.addEventListener('backbutton', this.deviceBackButton, false);
    };

    DeviceDelegate.prototype.unbindEventHandlers = function() {
      this.bindTarget.removeEventListener('resume', this.deviceDidResume, false);
      this.bindTarget.removeEventListener('pause', this.deviceDidPause, false);
      this.bindTarget.removeEventListener('online', this.deviceDidGoOnline, false);
      this.bindTarget.removeEventListener('offline', this.deviceDidGoOffline, false);
      return this.bindTarget.removeEventListener('backbutton', this.deviceBackButton, false);
    };

    DeviceDelegate.prototype.stopEventHandling = function() {
      return this.handleEvents = false;
    };

    DeviceDelegate.prototype.startEventHandling = function() {
      return this.handleEvents = true;
    };

    DeviceDelegate.prototype.deviceDidPause = function() {
      if (!this.handleEvents) {
        return;
      }
      this.log('Device was paused');
      TopFan.PluginHelper.closeChildBrowser();
      TopFan.AppMenu.getInstance().closeMenu();
      return true;
    };

    DeviceDelegate.prototype.deviceDidResume = function() {
      if (TopFan.AppState.getInstance().isLocationServicesEnabled()) {
        TopFan.Services.LocationService.getInstance().setCenter();
        TopFan.Services.LocationService.getInstance().updateCurrentLocation();
      }
      if (!this.handleEvents) {
        return;
      }
      this.log('Device was resumed');
      if (TopFan.AppState.getInstance().isOnline()) {
        TopFan.Services.ClientTokenService.getInstance().retrieve();
      }
      return true;
    };

    DeviceDelegate.prototype.deviceDidGoOnline = function() {
      var _this = this;
      if (!this.handleEvents) {
        return;
      }
      return $.ajax({
        url: "http://" + window.buildConfig.defaultHost + "/api/public/ping.json",
        error: function() {
          return setTimeout(_this.deviceDidGoOnline, 500);
        },
        success: function() {
          var _ref, _ref1;
          _this.log('Device went online');
          if ((typeof google !== "undefined" && google !== null ? (_ref = google.maps) != null ? _ref.Map : void 0 : void 0) || TopFan.AppState.getInstance().isTopFan()) {
            TopFan.AppState.getInstance().setIsOnline(true);
            return _this.deviceDidResume();
          } else {
            _this.hideFloatingNav();
            if ((_ref1 = Spine.Mobile.Stage.globalStage()) != null) {
              _ref1.hideContentShowLoader();
            }
            return _this.reloadWindow();
          }
        }
      });
    };

    DeviceDelegate.prototype.hideFloatingNav = function() {
      return $('.floating-nav').hide();
    };

    DeviceDelegate.prototype.reloadWindow = function() {
      return window.location.reload();
    };

    DeviceDelegate.prototype.deviceDidGoOffline = function() {
      if (!this.handleEvents) {
        return;
      }
      this.log('Device went offline');
      TopFan.AppState.getInstance().setIsOnline(false);
      if (TopFan.AppMenu.instance) {
        TopFan.AppMenu.getInstance().render();
      }
      return this.deviceDidPause();
    };

    DeviceDelegate.prototype.deviceBackButton = function() {
     return navigator.app.exitApp();
      //return history.go(-1);
    };

    return DeviceDelegate;

  })(Spine.Module);

}).call(this);
(function() {

  TopFan.ExternalLinkHelper = (function() {
    var MARKET_URL_REGEX, VIDEO_URL_REGEX;

    function ExternalLinkHelper() {}

    VIDEO_URL_REGEX = /youtube.com|vimeo.com|youtu.be/i;

    MARKET_URL_REGEX = /market:\/\/|\/store\/apps|\/store\/music\/album/i;

    ExternalLinkHelper.open = function(url, forceExternalIOS, forceExternalAndroid, useRestrictedBrowser, isAndroid, childBrowser) {
      var _ref, _ref1;
      if (forceExternalIOS == null) {
        forceExternalIOS = false;
      }
      if (forceExternalAndroid == null) {
        forceExternalAndroid = false;
      }
      if (useRestrictedBrowser == null) {
        useRestrictedBrowser = false;
      }
      if (isAndroid == null) {
        isAndroid = typeof $ !== "undefined" && $ !== null ? (_ref = $.os) != null ? _ref.android : void 0 : void 0;
      }
      if (childBrowser == null) {
        childBrowser = typeof window !== "undefined" && window !== null ? (_ref1 = window.plugins) != null ? _ref1.childBrowser : void 0 : void 0;
      }
      if (childBrowser) {
        if ((forceExternalIOS && !isAndroid) || (forceExternalAndroid && isAndroid) || (isAndroid && (VIDEO_URL_REGEX.test(url) || MARKET_URL_REGEX.test(url)))) {
          if (typeof console !== "undefined" && console !== null) {
            console.log("Opening link externally: " + url);
          }
          return childBrowser.openExternal(url);
        } else {
          if (typeof console !== "undefined" && console !== null) {
            console.log("Opening link in childbrowser: " + url);
          }
          return childBrowser.showWebPage(url, useRestrictedBrowser);
        }
      } else {
        if (typeof console !== "undefined" && console !== null) {
          console.log("No childbrowser found, opening link with JS: " + url);
        }
        return window.open(url);
      }
    };

    ExternalLinkHelper.captureLinks = function(el, scrollerHeight) {
      var href, link, span, _i, _len, _ref;
      el.find('iframe').css({
        height: scrollerHeight
      });
      _ref = el.find('a');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        link = $(link);
        href = link.attr('href');
        if (!href.match(/^http/)) {
          continue;
        }
        span = "<span class='captured-link' data-href='" + href + "' data-open-externally-ios='" + (link.data('open-externally-ios')) + "' data-open-externally-android='" + (link.data('open-externally-android')) + "' data-use-restricted-browser='" + (link.data('use-restricted-browser')) + "'>" + (link.html()) + "</span>";
        link.replaceWith(span);
      }
      return el.on('tap', '.captured-link', function(e) {
        var openExternallyAndroid, openExternallyIOS, target, useRestrictedBrowser;
        target = $(e.target).closest('span.captured-link');
        openExternallyIOS = target.data('open-externally-ios') === 'yes';
        openExternallyAndroid = target.data('open-externally-android') === 'yes';
        useRestrictedBrowser = target.data('use-restricted-browser') === 'yes';
        return TopFan.ExternalLinkHelper.open(target.data('href'), openExternallyIOS, openExternallyAndroid, useRestrictedBrowser);
      });
    };

    ExternalLinkHelper.releaseLinks = function(el) {
      el.off('tap', '.captured-link');
      return el.find('iframe').css({
        pointerEvents: 'auto'
      });
    };

    ExternalLinkHelper.forceOpen = function(href) {
      var clickevent, link;
      link = document.createElement('a');
      link.setAttribute('href', href);
      link.setAttribute('target', '_blank');
      clickevent = document.createEvent('Event');
      clickevent.initEvent('click', true, false);
      link.dispatchEvent(clickevent);
      return false;
    };

    return ExternalLinkHelper;

  })();

}).call(this);
(function() {

  TopFan.FacebookHelper = (function() {

    function FacebookHelper() {}

    FacebookHelper.setup = function() {
      var _ref, _ref1, _ref2, _ref3;
      if (((_ref = $.os) != null ? _ref.ios : void 0) || ((_ref1 = $.os) != null ? _ref1.android : void 0)) {
        return (_ref2 = window.plugins) != null ? (_ref3 = _ref2.facebookConnect) != null ? _ref3.initWithAppId(window.buildConfig.facebookAppId, function() {
          return console.log('FACEBOOK INIT CALLBACK: ', arguments);
        }) : void 0 : void 0;
      }
    };

    return FacebookHelper;

  })();

}).call(this);
(function() {

  TopFan.FormHelper = (function() {

    function FormHelper() {}

    FormHelper.serializedArrayToHash = function(array) {
      var item, values, _i, _len;
      values = {};
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (item.name) {
          values[item.name] = item.value;
        }
      }
      return values;
    };

    return FormHelper;

  })();

}).call(this);
(function() {

  TopFan.PluginHelper = (function() {

    function PluginHelper() {}

    PluginHelper.closeChildBrowser = function() {
      var _ref, _ref1;
      return (_ref = window.plugins) != null ? (_ref1 = _ref.childBrowser) != null ? _ref1.close() : void 0 : void 0;
    };

    PluginHelper.scanBarcode = function(win, fail) {
      var wrappedFail, wrappedWin, _ref;
      TopFan.Delegates.DeviceDelegate.getInstance().stopEventHandling();
      wrappedWin = function() {
        TopFan.Delegates.DeviceDelegate.getInstance().startEventHandling();
        return win.apply(this, arguments);
      };
      wrappedFail = function() {
        TopFan.Delegates.DeviceDelegate.getInstance().startEventHandling();
        return fail.apply(this, arguments);
      };
      if (((_ref = window.plugins) != null ? _ref.barcodeScanner : void 0) != null) {
        return window.plugins.barcodeScanner.scan(wrappedWin, wrappedFail);
      } else {
        return TopFan.Notification.alert('This device cannot scan barcodes.');
      }
    };

    PluginHelper.showEmailComposer = function(subject, body, toRecipients, ccRecipients, bccRecipients, bIsHTML) {
      var _ref;
      if (((_ref = window.plugins) != null ? _ref.emailComposer : void 0) != null) {
        return window.plugins.emailComposer.showEmailComposer(subject, body, toRecipients, ccRecipients, bccRecipients, bIsHTML);
      } else {
        return TopFan.ExternalLinkHelper.forceOpen("mailto:" + toRecipients + "?subject=" + subject + "&body=" + body);
      }
    };

    return PluginHelper;

  })();

}).call(this);
(function() {

  TopFan.PushNotificationHelper = (function() {
    var SECTION_ID, SLUG, TOKEN;

    function PushNotificationHelper() {}

    SECTION_ID = null;

    SLUG = null;

    TOKEN = null;

    PushNotificationHelper.register = function() {
      var options, _ref, _ref1, _ref2;
      if (TOKEN) {
        return;
      }
      if (typeof console !== "undefined" && console !== null) {
        console.log('Registering for push notifications');
      }
      if (((_ref = window.plugins) != null ? _ref.pushNotification : void 0) == null) {
        return;
      }
      if ((_ref1 = $.os) != null ? _ref1.ios : void 0) {
        options = {
          badge: true,
          sound: true,
          alert: true,
          ecb: "TopFan.PushNotificationHelper.onNotificationAPN"
        };
        return window.plugins.pushNotification.register(TopFan.PushNotificationHelper.tokenSuccess, TopFan.PushNotificationHelper.registerError, options);
      } else if ((_ref2 = $.os) != null ? _ref2.android : void 0) {
        options = {
          senderID: Constants.GCM_SENDER_ID,
          ecb: "TopFan.PushNotificationHelper.onNotificationGCM"
        };
        return window.plugins.pushNotification.register(TopFan.PushNotificationHelper.gcmSuccess, TopFan.PushNotificationHelper.registerError, options);
      }
    };

    PushNotificationHelper.tokenSuccess = function(token) {
      var object;
      if (typeof console !== "undefined" && console !== null) {
        console.log("Received APNS push token: " + token);
      }
      TOKEN = token;
      object = {
        environment: window.buildConfig.pushEnvironment,
        platform: 'iOS',
        token: TOKEN
      };
      return TopFan.PushNotificationHelper.postAuthorization(object, TopFan.PushNotificationHelper.pushAuthComplete);
    };

    PushNotificationHelper.postAuthorization = function(params, callback) {
      var request;
      if (callback == null) {
        callback = function() {};
      }
      request = new TopFan.Request({
        type: 'POST',
        token: TopFan.Request.TOKEN_CLIENT,
        url: '/client/push_authorizations',
        data: JSON.stringify(params),
        complete: callback
      });
      return request.perform();
    };

    PushNotificationHelper.pushAuthComplete = function(xhr, status) {
      return TopFan.Services.LocationService.getInstance().one('locationSuccess', TopFan.PushNotificationHelper.updateTokenWithLocation);
    };

    PushNotificationHelper.updateTokenWithLocation = function(position) {
      return TopFan.PushNotificationHelper.postAuthorization({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        token: TOKEN
      });
    };

    PushNotificationHelper.gcmSuccess = function() {
      return console.log("GCM SUCCESS: " + (JSON.stringify(arguments)));
    };

    PushNotificationHelper.registerError = function() {
      return console.log('REGISTER ERROR', JSON.stringify(arguments));
    };

    PushNotificationHelper.onNotificationAPN = function(e) {
      e.foreground = parseInt(e.foreground) === 1 ? true : false;
      return TopFan.PushNotificationHelper.notificationReceived(e);
    };

    PushNotificationHelper.notificationReceived = function(_arg) {
      var ALERT_BODY, alert, coldstart, entry_id, foreground, slug;
      alert = _arg.alert, foreground = _arg.foreground, entry_id = _arg.entry_id, coldstart = _arg.coldstart, slug = _arg.slug;
      console.log("NOTIFICATION RECEIVED: " + JSON.stringify.apply(JSON, arguments));
      TopFan.PushNotificationHelper.trackPushOpenEvent(alert, foreground, entry_id, slug);
      if (foreground) {
        if (alert && (entry_id || slug)) {
          ALERT_BODY = alert;
          SECTION_ID = entry_id;
          SLUG = slug;
          return TopFan.Notification.confirm(alert, this.onConfirmCallback, 'Confirm', 'Go,Cancel');
        } else if (alert) {
          return TopFan.Notification.alert(alert);
        }
      } else if (entry_id || slug) {
        return this.navigateToEntry(entry_id, slug);
      }
    };

    PushNotificationHelper.trackPushOpenEvent = function(alert, foreground, entry_id, slug) {
      var action, category, _ref;
      category = ((_ref = $.os) != null ? _ref.ios : void 0) ? 'iOS push' : 'Android push';
      action = foreground ? 'open internal' : 'open external';
      return GoogleAnalytics.getInstance().trackEvent(category, action, alert || 'No body provided', entry_id || slug);
    };

    PushNotificationHelper.trackPushNavigateEvent = function(alert, entry_id, slug) {
      var action, category, _ref;
      category = ((_ref = $.os) != null ? _ref.ios : void 0) ? 'iOS push' : 'Android push';
      action = 'navigate ' + (entry_id != null ? TopFan.Models.ListSectionEntry.find(entry_id).name : slug);
      return GoogleAnalytics.getInstance().trackEvent(category, action, alert || 'No body provided', entry_id);
    };

    PushNotificationHelper.onConfirmCallback = function(value) {
      var ALERT_BODY;
      if (!(SECTION_ID || SLUG)) {
        return;
      }
      if (value === 1) {
        PushNotificationHelper.navigateToEntry(SECTION_ID, SLUG);
        TopFan.PushNotificationHelper.trackPushNavigateEvent(ALERT_BODY, SECTION_ID, SLUG);
      }
      ALERT_BODY = null;
      SECTION_ID = null;
      return SLUG = null;
    };

    PushNotificationHelper.navigateToEntry = function(entry_id, slug) {
      var key;
      console.log('NAVIGATING FROM PUSH', entry_id, slug);
      if (slug) {
        key = "/" + slug;
        return Spine.Route.navigate(key);
      } else {
        Spine.Route.navigate(Constants.ENTRY_PATH, entry_id);
        return TopFan.PushNotificationHelper.trackPushNavigateEvent(alert, entry_id, slug);
      }
    };

    PushNotificationHelper.onNotificationGCM = function(e) {
      var object;
      switch (e.event) {
        case 'registered':
          console.log('REGISTERED GCM: ' + JSON.stringify(e));
          if (e.regid.length > 0) {
            TOKEN = e.regid;
            object = {
              environment: window.buildConfig.pushEnvironment,
              platform: 'Android',
              token: TOKEN
            };
            return TopFan.PushNotificationHelper.postAuthorization(object, TopFan.PushNotificationHelper.pushAuthComplete);
          }
          break;
        case 'message':
          console.log('NOTIFICATION GCM: ' + JSON.stringify(e));
          return this.notificationReceived({
            alert: e.payload.message,
            foreground: e.foreground,
            entry_id: e.payload.entry_id,
            slug: e.payload.slug
          });
        case 'error':
          return console.log('NOTIFICATION GCM ERROR: ' + JSON.stringify(e));
        default:
          return console.log('NOTIFICATION GCM UNKNOWN: ' + JSON.stringify(e));
      }
    };

    return PushNotificationHelper;

  }).call(this);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.AppState = (function(_super) {

    __extends(AppState, _super);

    function AppState() {
      this.isInCordova = __bind(this.isInCordova, this);

      this.setIsInCordova = __bind(this.setIsInCordova, this);

      this.isLocationServicesEnabled = __bind(this.isLocationServicesEnabled, this);

      this.setIsLocationServicesEnabled = __bind(this.setIsLocationServicesEnabled, this);

      this.isOnline = __bind(this.isOnline, this);

      this.setIsOnline = __bind(this.setIsOnline, this);

      this.isLoggedIn = __bind(this.isLoggedIn, this);

      this.setIsLoggedIn = __bind(this.setIsLoggedIn, this);
      AppState.__super__.constructor.apply(this, arguments);
      this.loggedIn = false;
      this.online = true;
      this.locationServicesEnabled = true;
      this.inCordova = false;
    }

    AppState.prototype.setIsLoggedIn = function(isLoggedIn) {
      return this.loggedIn = isLoggedIn;
    };

    AppState.prototype.isLoggedIn = function() {
      return this.loggedIn;
    };

    AppState.prototype.setIsOnline = function(isOnline) {
      return this.online = isOnline;
    };

    AppState.prototype.isOnline = function() {
      return this.online;
    };

    AppState.prototype.setIsLocationServicesEnabled = function(isEnabled) {
      return this.locationServicesEnabled = isEnabled;
    };

    AppState.prototype.isLocationServicesEnabled = function() {
      return this.locationServicesEnabled;
    };

    AppState.prototype.setIsInCordova = function(isInCordova) {
      return this.inCordova = isInCordova;
    };

    AppState.prototype.isInCordova = function() {
      return this.inCordova;
    };

    AppState.prototype.hasClientToken = function() {
      return TopFan.Models.ClientToken.count() > 0;
    };

    AppState.prototype.hasUserToken = function() {
      return TopFan.Models.UserToken.count() > 0;
    };

    AppState.prototype.isTopFan = function() {
      return window.buildConfig.organizationName === 'TopFan';
    };

    AppState.prototype.isVisitMobile = function() {
      return !this.isTopFan();
    };

    return AppState;

  })(Spine.Singleton);

}).call(this);
(function() {

  window.printBuildConfig = function() {
    console.log("Application Build Configuration:");
    console.log(" - Platform: " + window.buildConfig.platform);
    console.log(" - Build Number: " + window.buildConfig.buildNumber);
    console.log(" - Client ID: " + window.buildConfig.clientId);
    console.log(" - Client Secret: " + window.buildConfig.clientSecret);
    console.log(" - Facebook App ID: " + window.buildConfig.facebookAppId);
    console.log(" - Testflight Token: " + window.buildConfig.testflightToken);
    console.log(" - App Theme Color: " + window.buildConfig.appThemeColor);
    console.log(" - Default Host: " + window.buildConfig.defaultHost);
    console.log(" - Platform Name: " + window.buildConfig.platformName);
    console.log(" - Organization Name: " + window.buildConfig.organizationName);
    return console.log(" - Push Environment: " + window.buildConfig.pushEnvironment);
  };

  document.addEventListener('deviceready', window.printBuildConfig);

}).call(this);
(function() {
  var GoogleAnalytics;

  GoogleAnalytics = (function() {

    GoogleAnalytics.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    function GoogleAnalytics(bridge) {
      var _ref;
      this.bridge = bridge != null ? bridge : (_ref = window.plugins) != null ? _ref.googleAnalyticsPlugin : void 0;
    }

    GoogleAnalytics.prototype.init = function(primaryTrackingId, secondaryTrackingId) {
      if (secondaryTrackingId == null) {
        secondaryTrackingId = null;
      }
      if (this.bridge) {
        return this.bridge.startTrackerWithAccountIds(primaryTrackingId, secondaryTrackingId);
      } else {
        return typeof console !== "undefined" && console !== null ? console.log('Google Analytics Error. You must have the Google Analytics plugin installed and wait to call init until after device ready.') : void 0;
      }
    };

    GoogleAnalytics.prototype.initWithCurrentClient = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient) {
        return this.init(localStorage.getItem('google_analytics_tracking_id'),localStorage.getItem('custom_ga_tracking_id'));
      }
    };

    GoogleAnalytics.prototype.trackEvent = function(category, action, label, value) {
      if (this.bridge) {
        this.bridge.setCustomVariable('1', 'Client Name', TopFan.Models.Client.currentClient().name);
        this.bridge.setCustomVariable('2', 'Organization Name', TopFan.Models.Client.currentClient().organization);
        return this.bridge.trackEvent(category, action, label, value);
      } else {
        return typeof console !== "undefined" && console !== null ? console.log("Google Analytics Error. Trying to call trackEvent(" + category + ", " + action + ", " + label + ", " + value + ") but the plugin could not be found.") : void 0;
      }
    };

    GoogleAnalytics.prototype.trackPageView = function(path) {
      var entryId, idIndex, pathArr;
      if (path.match(/\/entry\//)) {
        pathArr = path.split('/');
        idIndex = pathArr.length - 1;
        entryId = pathArr[idIndex];
        pathArr[idIndex] = TopFan.Models.ListSectionEntry.find(entryId).name.toLowerCase().replace(/\W/g, '-');
        path = pathArr.join('/');
      }
      if (this.bridge) {
        this.bridge.setCustomVariable('1', 'Client Name', TopFan.Models.Client.currentClient().name);
        this.bridge.setCustomVariable('2', 'Organization Name', TopFan.Models.Client.currentClient().organization);
        return this.bridge.trackPageview(path);
      } else {
        return typeof console !== "undefined" && console !== null ? console.log("Google Analytics Error. Trying to call trackPageView(" + path + ") but the plugin could not be found.") : void 0;
      }
    };

    return GoogleAnalytics;

  })();

  this.GoogleAnalytics = GoogleAnalytics;

}).call(this);
(function() {
  var TalkChain;

  TalkChain = (function() {

    TalkChain.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    function TalkChain(bridge, badge) {
      var _ref;
      this.bridge = bridge != null ? bridge : (_ref = window.plugins) != null ? _ref.talkChainPlugin : void 0;
      this.badge = badge;
    }

    TalkChain.prototype.init = function(key) {
      if (this.bridge) {
        return this.bridge.init(key);
      } else {
        return typeof console !== "undefined" && console !== null ? console.log('TalkChain Error. You must have the TalkChain plugin installed and wait to call init until after device ready.') : void 0;
      }
    };

    TalkChain.prototype.initWithCurrentClient = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient) {
        this.configureColors(currentClient.talkchain_color_primary, currentClient.talkchain_color_secondary, currentClient.talkchain_color_highlight, currentClient.talkchain_color_accent, currentClient.talkchain_color_header);
      }
      if (currentClient) {
        return this.init(currentClient.talkchain_community_id);
      }
    };

    TalkChain.prototype.presentUI = function() {
      if (this.bridge) {
        return this.bridge.presentUI();
      } else {
        return typeof console !== "undefined" && console !== null ? console.log('TalkChain Error. Tried to call presentUI but the plugin was not found.') : void 0;
      }
    };

    TalkChain.prototype.configureColors = function(primary, secondary, highlight, accent, header) {
      if (this.bridge) {
        return this.bridge.configureColors(primary, secondary, highlight, accent, header);
      } else {
        return typeof console !== "undefined" && console !== null ? console.log('TalkChain Error. Tried to call configureColors but the plugin was not found.') : void 0;
      }
    };

    TalkChain.prototype.allowGuestAccounts = function(allow) {
      if (this.bridge) {
        return this.bridge.allowGuestAccounts(allow);
      } else {
        return typeof console !== "undefined" && console !== null ? console.log('TalkChain Error. Tried to call allowGuestAccounts but the plugin was not found.') : void 0;
      }
    };

    return TalkChain;

  })();

  this.TalkChain = TalkChain;

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


  TopFan.Request = (function(_super) {

    __extends(Request, _super);

    Request.include(Spine.Log);

    Request.TOKEN_USER = 'user';

    Request.TOKEN_CLIENT = 'client';

    Request.apiVersion = '3';

    function Request(options) {
      var fail,
        _this = this;
      this.options = options;
      this.tryAgain = __bind(this.tryAgain, this);

      this.handleError = __bind(this.handleError, this);

      this.perform = __bind(this.perform, this);

      Request.__super__.constructor.apply(this, arguments);
      this.attempts = 0;
      fail = this.options['error'];
      this.options.headers['Authorization'] = this.authorizationByTokenType();
      this.options['error'] = function(xhr, errorType, error) {
        _this.logError("Request to " + _this.options.url + " failed with status " + (xhr != null ? xhr.status : void 0), arguments);
        _this.handleError(xhr);
        if (typeof fail === 'function') {
          return fail.apply(_this, arguments);
        }
      };
    }

    Request.prototype.perform = function() {
      var _ref, _ref1;
      if (!TopFan.AppState.getInstance().isOnline()) {
        TopFan.Notification.alert("Request can't be performed at this time. Please try again later.");
        return this.options['error'].apply(this, arguments);
      }
      switch (this.options.token) {
        case this.constructor.TOKEN_CLIENT:
          if (!this.ensureClientToken()) {
            return (_ref = this.options['complete']) != null ? _ref.apply(this, arguments) : void 0;
          }
          break;
        case this.constructor.TOKEN_USER:
          if (!this.ensureUserToken()) {
            return (_ref1 = this.options['complete']) != null ? _ref1.apply(this, arguments) : void 0;
          }
      }
      return Request.__super__.perform.apply(this, arguments);
    };

    Request.prototype.authorizationByTokenType = function() {
      switch (this.options.token) {
        case this.constructor.TOKEN_USER:
          return "Bearer " + (this.userToken());
        case this.constructor.TOKEN_CLIENT:
          return "Bearer " + (this.clientToken());
      }
    };

    Request.prototype.handleError = function(xhr) {
      var message;
      if (!xhr) {
        return;
      }
      switch (xhr.status) {
        case 401:
          switch (this.options.token) {
            case this.constructor.TOKEN_USER:
              this.onUserTokenAuthError();
              break;
            case this.constructor.TOKEN_CLIENT:
              this.onClientTokenAuthError();
          }
          if (!this.options.token && this.options.data.grant_type === 'client_credentials') {
            message = JSON.parse(xhr.responseText || '{}')['message'];
            message || (message = 'You need to install the latest version of the app.');
            return TopFan.Notification.alert(message, null, 'Request Error');
          }
          break;
        case 410:
          message = JSON.parse(xhr.responseText || '{}')['message'];
          message || (message = 'You need to install the latest version of the app.');
          return TopFan.Notification.alert(message, null, 'Request Error');
        case 500:
        case 503:
          if (this.attempts < 1) {
            return TopFan.Notification.alert('This request can\'t be made. This may be because the server is overloaded or down for maintenance.', this.tryAgain, 'Service Unavailable');
          } else {
            return this.tryAgain();
          }
          break;
        case 0:
          this.logError('Request came back with a status of 0.');
          return this.tryAgain();
      }
    };

    Request.prototype.tryAgain = function() {
      if (this.attempts < 5) {
        this.attempts += 1;
        return this.perform();
      } else {
        return TopFan.Loader.getInstance().hide();
      }
    };

    Request.prototype.onUserTokenAuthError = function() {
      this.logError("Request with user token (" + (this.userToken()) + ") failed!");
      TopFan.Models.UserToken.deleteAll();
      return TopFan.Models.Account.trigger('logout');
    };

    Request.prototype.onClientTokenAuthError = function() {
      this.logError("Request with client token (" + (this.clientToken()) + ") failed!");
      TopFan.Models.ClientToken.deleteAll();
      return this.ensureClientToken();
    };

    Request.prototype.ensureClientToken = function() {
      if (this.clientToken()) {
        return true;
      }
    };

    Request.prototype.ensureUserToken = function() {
      if (this.userToken()) {
        return true;
      }
    };

    Request.prototype.userToken = function() {
      return TopFan.Services.UserTokenService.getInstance().currentToken();
    };

    Request.prototype.clientToken = function() {
      return TopFan.Services.ClientTokenService.getInstance().currentToken();
    };

    return Request;

  })(Spine.Request);

}).call(this);
function EaseToValueCallback( value, easeFactor, callback, finishRange ) {
  this.easingFloat = new EasingFloat( value, easeFactor );
  this.callback = callback;
  this.finishRange = finishRange || 0.1;
  this.timeout = null;
};

EaseToValueCallback.prototype.setTarget = function( value ) {
  this.easingFloat.setTarget( value );
  this.easeToTarget();
};

EaseToValueCallback.prototype.easeToTarget = function(){
  if( this.timeout != null ) clearTimeout( this.timeout );
  // ease the EasingFloat towards its target
  this.easingFloat.update();
  // call the callback and pass in the current value
  this.callback( this.easingFloat.value() );
  // keep easing if we're not close enough
  if( Math.abs( this.easingFloat.value() - this.easingFloat.target() ) > this.finishRange ) {
    var self = this;
    this.timeout = setTimeout(function(){
      self.easeToTarget();
    },16);
  } else {
    this.easingFloat.setValue( this.easingFloat.target() );
    this.timeout = null;
    // call the callback one last time with the final value
    this.callback( this.easingFloat.value() );
  }
};





function EasingFloat( value, easeFactor ) {
  this.val = value;
  this.targetVal = value;
  this.easeFactor = easeFactor;
};

EasingFloat.prototype.setTarget = function( value ) {
  this.targetVal = value;
};

EasingFloat.prototype.setValue = function( value ) {
  this.val = value;
};

EasingFloat.prototype.setEaseFactor = function( value ) {
  this.easeFactor = value;
};

EasingFloat.prototype.value = function() {
  return this.val;
};

EasingFloat.prototype.target = function() {
  return this.targetVal;
};

EasingFloat.prototype.update = function() {
  this.val -= ( ( this.val - this.targetVal ) / this.easeFactor );
};
(function() {

  Number.prototype.withDelimiter = function(delimiter) {
    var number, split;
    number = this + '';
    delimiter = delimiter || ',';
    split = number.split('.');
    split[0] = split[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter);
    return split.join('.');
  };

  Number.prototype.ordinalizedSuffix = function() {
    var selfAsInteger;
    selfAsInteger = Math.abs(Math.round(this));
    if ([11, 12, 13].indexOf(selfAsInteger % 100) >= 0) {
      return 'th';
    } else {
      switch (selfAsInteger % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }
  };

  Number.prototype.ordinalize = function() {
    return "" + this + (this.ordinalizedSuffix());
  };

  Number.prototype.ordinalizeWithDelimiter = function(delimiter) {
    return "" + (this.withDelimiter(delimiter)) + (this.ordinalizedSuffix());
  };

  Number.prototype.singleDecimal = function() {
    return Math.round(this * 10) / 10;
  };

}).call(this);
var StringUtil = StringUtil || {};

/**
 *  Removes whitespace from the front and the end of the input string.
 *  @param  str The source string.
 *  @return Trimmed string.
 *  @use    {@code var trimmed = StringUtil.trim( '   Oh hai.   ' );}
 */
StringUtil.trim = function(str) {
  if (str == null) { return ''; }
  return str.replace(/^\s+|\s+$/g, '');
};

/**
 *  Removes whitespace from the end of the specified string.
 *  @param  str The source string.
 *  @return Right-trimmed string.
 *  @use    {@code var trimmed = StringUtil.trimRight( '   Oh hai.   ' );}
 */
StringUtil.trimRight = function(str) {
  if (str == null) { return ''; }
  return str.replace(/\s+$/, '');
};

/**
 *  Returns a string truncated to a specified length with optional suffix.
 *  @param  str     The source string.
 *  @param  len     The length the string should be shortend to, including the suffix.
 *  @param  suffix  The string to append to the end of the truncated string.
 *  @return Truncated string.
 *  @use    {@code var trimmed = StringUtil.truncate( 'This is a long sentence, kind of.' );}
 */
StringUtil.truncate = function(str, len, suffix) {
  len = len || -1;
  suffix = suffix || "&hellip;";
  if (str == null) { return ''; }
  if (len == -1) { len = str.length; }
  len -= suffix.length;
  var trunc = str;
  if (trunc.length > len) {
    trunc = trunc.substr(0, len);
    if (/[^\s]/.test(str.charAt(len))) {
      trunc = StringUtil.trimRight(trunc.replace(/\w+$|\s+$/, ''));
    }
    trunc += suffix;
  }
  return trunc;
};

StringUtil.remaining = function(num) {
  remainStr = num === 1 ? 'remains' : 'remain';
  return num.withDelimiter() + ' ' + remainStr;
};

StringUtil.replaceAscii = function(str) {
  var results = str.match(/&#(\d+);/g);
  if(!results) return str;
  for(var i=0; i < results.length; i++) {
    str = str.replace( results[i], String.fromCharCode( results[i].match(/&#(\d+);/)[1] ) );
  };
  return str;
};

/**
 *  Unscapes a limited set of common html characters: &, <, >, ".
 *  @param  str The string to escape.
 *  @return An html string.
 *  @use    {@code var unescapedStr = StringUtil.unescapeHTML( '&lt;div&gt;Hello &amp; World&lt;/div&gt;' );}
 */
StringUtil.unescapeHTML = function(str) {
  return str.replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&quot;/igm,'"');
};

(function() {

  this.TimeUtil = (function() {

    function TimeUtil() {}

    TimeUtil.displayDatetime = function(serverDate) {
      return "" + (moment(serverDate).format("MMM Do YYYY @ h:mma")) + " MT";
    };

    return TimeUtil;

  })();

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Managers.ContentSectionManager = (function(_super) {

    __extends(ContentSectionManager, _super);

    ContentSectionManager.prototype.currentRoute = null;

    ContentSectionManager.prototype.currentPath = null;

    ContentSectionManager.getInstance = function() {
      return this.instance || (this.instance = new this);
    };

    function ContentSectionManager() {
      this.sectionsForMenu = __bind(this.sectionsForMenu, this);

      this.activateDefaultSection = __bind(this.activateDefaultSection, this);
      this.body = $(document.body);
    }

    ContentSectionManager.prototype.getCurrentManager = function() {
      if (this.currentManager) {
        return this.currentManager;
      }
      if (TopFan.AppState.getInstance().isTopFan()) {
        console.log('TopFan APP');
        this.currentManager = new TopFan.Managers.TopFanSectionManager();
      } else {
        console.log('VisitMobile APP');
        this.currentManager = new TopFan.Managers.VisitMobileSectionManager();
      }
      return this.currentManager;
    };

    ContentSectionManager.prototype.activateDefaultSection = function() {
      return this.getCurrentManager().activateDefaultSection();
    };

    ContentSectionManager.prototype.sectionsForMenu = function() {
      return this.getCurrentManager().sectionsForMenu();
    };

    ContentSectionManager.prototype.createSections = function() {
      return this.getCurrentManager().createSections();
    };

    return ContentSectionManager;

  })(Spine.Module);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TopFan.Managers.EntryManager = (function() {

    EntryManager.DEFAULT_SORT_ALPHA = 'alpha';

    EntryManager.DEFAULT_SORT_DATE = 'date';

    EntryManager.DEFAULT_SORT_DISTANCE = 'distance';

    function EntryManager(default_sort) {
      this.default_sort = default_sort != null ? default_sort : this.constructor.DEFAULT_SORT_DISTANCE;
      this.filterByOffers = __bind(this.filterByOffers, this);

      this.filterByFeature = __bind(this.filterByFeature, this);

      this.filterByCategory = __bind(this.filterByCategory, this);

      this.sortEntries = __bind(this.sortEntries, this);

      this.featuredEntries = __bind(this.featuredEntries, this);

      this.hasOffers = __bind(this.hasOffers, this);

      this.applyFilters = __bind(this.applyFilters, this);

      this.featuresForFilter = __bind(this.featuresForFilter, this);

      this.categoriesForFilter = __bind(this.categoriesForFilter, this);

    }

    EntryManager.prototype.setEntries = function(entries) {
      this.entries = entries;
    };

    EntryManager.prototype.categoriesForFilter = function() {
      var entries;
      entries = _(this.entries).chain();
      return entries.pluck('subcategories').flatten().compact().sort().uniq(true).value();
    };

    EntryManager.prototype.featuresForFilter = function() {
      var entries;
      entries = _(this.entries).chain();
      return entries.pluck('features').flatten().compact().sort().uniq(true).value();
    };

    EntryManager.prototype.applyFilters = function(range, category, feature, onlyShowOffers) {
      var entries;
      if (onlyShowOffers == null) {
        onlyShowOffers = false;
      }
      console.log(range, category, feature);
      entries = this.entries;
      if (range != null) {
        entries = this.filterByDistance(entries, range);
      }
      if (category != null) {
        entries = this.filterByCategory(entries, category);
      }
      if (feature != null) {
        entries = this.filterByFeature(entries, feature);
      }
      if (onlyShowOffers) {
        entries = this.filterByOffers(entries);
      }
      return this.sortEntries(entries);
    };

    EntryManager.prototype.hasOffers = function() {
      return _(this.entries).some(function(entry) {
        return entry.activeOffers().length > 0;
      });
    };

    EntryManager.prototype.featuredEntries = function() {
      return _(this.entries).filter(function(entry) {
        return entry.is_featured;
      });
    };

    EntryManager.prototype.sortEntries = function(entries) {
      var members, normals;
      if (!entries) {
        entries = this.entries;
      }
      switch (this.default_sort) {
        case this.constructor.DEFAULT_SORT_DATE:
          return this.sortByDate(entries);
        case this.constructor.DEFAULT_SORT_ALPHA:
          return this.sortByMemberAndName(entries);
        default:
          members = this.sortByDistance(_(entries).where({
            is_member: true
          }));
          normals = this.sortByDistance(_(entries).where({
            is_member: false
          }));
          return members.concat(normals);
      }
    };

    EntryManager.prototype.filterByDistance = function(entries, range) {
      var end, start, _ref;
      if (range === 'all' || range === 'any') {
        return entries;
      }
      if (entries.length === 0) {
        entries = this.entries;
      }
      _ref = range.split('-'), start = _ref[0], end = _ref[1];
      return _(entries).filter(function(entry) {
        var distance;
        distance = entry.fetchCachedDistance().distance;
        return distance <= end && distance >= start;
      });
    };

    EntryManager.prototype.filterByCategory = function(entries, category) {
      var filteredEntries;
      if (category === 'all' || category === 'any') {
        return entries;
      }
      filteredEntries = _(entries).filter(function(entry) {
        return entry.subcategories.indexOf(category) >= 0;
      });
      return this.sortEntries(filteredEntries);
    };

    EntryManager.prototype.filterByFeature = function(entries, feature) {
      var filteredEntries;
      if (feature === 'all' || feature === 'any') {
        return entries;
      }
      filteredEntries = _(entries).filter(function(entry) {
        return entry.features.indexOf(feature) >= 0;
      });
      return this.sortEntries(filteredEntries);
    };

    EntryManager.prototype.filterByOffers = function(entries) {
      var filteredEntries;
      filteredEntries = _(entries).filter(function(entry) {
        return entry.activeOffers().length > 0;
      });
      return this.sortEntries(filteredEntries);
    };

    EntryManager.prototype.sortByMemberAndName = function(entries) {
      return this.sortOnProperties(entries, ['isMemberForSort', 'name']);
    };

    EntryManager.prototype.sortByDate = function(entries) {
      return this.sortOnProperties(entries, ['start_date']);
    };

    EntryManager.prototype.sortByDistance = function(entries) {
      var sortFunction;
      sortFunction = function(a, b) {
        var compA, compB;
        compA = a.fetchCachedDistance().distance;
        compB = b.fetchCachedDistance().distance;
        if (compA < compB) {
          return -1;
        }
        if (compA > compB) {
          return 1;
        }
        return 0;
      };
      return entries.sort(sortFunction);
    };

    EntryManager.prototype.sortOnProperties = function(entries, properties) {
      var sortFunction;
      sortFunction = function(a, b) {
        var compA, compB;
        compA = _(properties).map(function(property) {
          if (typeof a[property] === 'function') {
            return a[property]();
          } else {
            return a[property];
          }
        });
        compB = _(properties).map(function(property) {
          if (typeof b[property] === 'function') {
            return b[property]();
          } else {
            return b[property];
          }
        });
        if (compA < compB) {
          return -1;
        }
        if (compA > compB) {
          return 1;
        }
        return 0;
      };
      return entries.sort(sortFunction);
    };

    return EntryManager;

  })();

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Managers.SocialFeedManager = (function(_super) {

    __extends(SocialFeedManager, _super);

    SocialFeedManager.include(Spine.Log);

    SocialFeedManager.extend(Spine.Events);

    function SocialFeedManager() {
      this.appendSocialItems = __bind(this.appendSocialItems, this);

      this.appendClientNews = __bind(this.appendClientNews, this);

      this.allItemsSorted = __bind(this.allItemsSorted, this);

      this.allItems = __bind(this.allItems, this);
      SocialFeedManager.__super__.constructor.apply(this, arguments);
      this.socialItems = [];
    }

    SocialFeedManager.prototype.fetch = function() {
      var curClient, _ref;
      curClient = TopFan.Models.Client.currentClient();
      if (curClient) {
        if (!((_ref = curClient.twitter_handle) != null ? _ref.length : void 0)) {
          return this.constructor.trigger('update');
        }
      }
    };

    SocialFeedManager.prototype.allItems = function() {
      var items;
      items = [];
      if (TopFan.Models.Client.currentClient()) {
        this.appendClientNews(items);
        this.appendSocialItems(items);
      }
      return items;
    };

    SocialFeedManager.prototype.allItemsSorted = function() {
      var predicate;
      predicate = function(item) {
        return moment.utc(item.date).toDate().getTime();
      };
      return _(this.allItems()).chain().sortBy(predicate).reverse().value();
    };

    SocialFeedManager.prototype.appendClientNews = function(items) {
      var item, _i, _len, _ref, _results;
      _ref = TopFan.Models.Client.currentClient().news_items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(items.push({
          date: item.date || new Date,
          link: item.link,
          text: item.description,
          type: Constants.SOCIAL_NEWS,
          open_externally_on_ios: item.open_externally_on_ios,
          open_externally_on_android: item.open_externally_on_android,
          use_restricted_internal_browser: item.use_restricted_internal_browser
        }));
      }
      return _results;
    };

    SocialFeedManager.prototype.appendSocialItems = function(items) {
      var item, _i, _len, _ref;
      _ref = TopFan.Models.Client.currentClient().social_items().all();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        items.push({
          date: item.posted_at,
          image: item.photo_url,
          link: item.link,
          text: item.title,
          type: item.provider
        });
      }
      return items;
    };

    return SocialFeedManager;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Managers.TopFanSectionManager = (function(_super) {

    __extends(TopFanSectionManager, _super);

    TopFanSectionManager.include(Spine.Log);

    function TopFanSectionManager() {
      this.sectionsForMenu = __bind(this.sectionsForMenu, this);

      this.activateDefaultSection = __bind(this.activateDefaultSection, this);
      this.defaultSections = {};
      this.contentSections = {};
    }

    TopFanSectionManager.prototype.activateDefaultSection = function() {
      var hash;
      if (TopFan.Models.Client.currentClient()) {
        hash = window.location.hash.substr(1);
        this.log("ContentSectionManager: Activating default section: " + hash);
        if (window.location.hash.length === 0) {
          //return Spine.Route.navigate(Constants.DASHBOARD_PATH);

          _ref1 = TopFan.Models.ListSection.inOrder();
          var slug = "";
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            section = _ref1[_j];
            slug = section.slug;
          }
          localStorage.setItem('slugName',slug);
          return Spine.Route.navigate('/'+slug);
        } else if (!this.contentSections[hash] && !this.defaultSections[hash] && !hash.match(Constants.ENTRY_PATH) && !hash.match(Constants.SEARCH_PATH) && !hash.match(Constants.MOBILE_CONCIERGE_RESULTS_PATH)) {
         console.log ( '#value of hash-- '+hash );
          return Spine.Route.navigate("/"+hash); // ankur

        } else if ($('#application section.active').length === 0 || hash === Constants.DASHBOARD_PATH) {
          Spine.Route.path = '';
          return Spine.Route.change();
        } else {

        }
      } else {
        return this.logWarn('ContentSectionManager: Not activating default section as no client exists');
      }
    };

    TopFanSectionManager.prototype.createSections = function() {
      this.createDefaultSections();
      return this.createContentSections();
    };

    TopFanSectionManager.prototype.sectionsForMenu = function() {
      var currentClient, menu, section, _base, _i, _len, _name, _ref;
      menu = [];
      if (this.loyaltyIsAvailable() && TopFan.AppState.getInstance().isOnline()) {
        menu.push(['Fan Loyalty Program', Constants.DIVIDER]);
        if (TopFan.AppState.getInstance().isLoggedIn()) {
          menu.push([
            'Account Settings', Constants.ACCOUNT_PATH, {
              icon: 'fan-settings'
            }
          ]);
        } else {
          menu.push([
            'Account Login<b class="tight-space"> / </b>Sign Up', Constants.LOGIN_PATH, {
              icon: 'fan-settings'
            }
          ]);
        }
        menu.push([
          'Challenges', Constants.CHALLENGES_PATH, {
            icon: 'challenges'
          }
        ]);
        menu.push([
          'Rewards', Constants.REWARDS_PATH, {
            icon: 'rewards'
          }
        ]);
      }
      menu.push(['Content Sections', Constants.DIVIDER]);
      menu.push([
        'Social Feed', Constants.DASHBOARD_PATH, {
          icon: 'social-feed'
        }
      ]);
      if (TopFan.Models.Client.isTalkChainEnabled() && TopFan.AppState.getInstance().isOnline()) {
        menu.push([
          'Chat', Constants.SOCIAL_TALKCHAIN, {
            icon: 'blog'
          }
        ]);
      }
      if (this.musicPlayerIsAvailable() && TopFan.AppState.getInstance().isOnline()) {
        (_base = this.contentSections)[_name = Constants.MUSIC_PLAYER_PATH] || (_base[_name] = new TopFan.Panels.MusicPlayerPanel(Constants.MUSIC_PLAYER_PATH));
        menu.push([
          'Music', Constants.MUSIC_PLAYER_PATH, {
            icon: 'music'
          }
        ]);
      }
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient && currentClient.content_sections) {
        _ref = currentClient.content_sections;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          section = _ref[_i];
          if (!(TopFan.Models.Client.isTalkChainEnabled() && section.external_link && !!~section.external_link.indexOf("tlk.io"))) {
            menu.push([section.primary_text, '/' + section.slug, section]);
          }
        }
      }
      menu.push(['General Information', Constants.DIVIDER]);
      if (currentClient && !currentClient.hide_other_apps_section && TopFan.AppState.getInstance().isOnline()) {
        menu.push([
          'Other TopFan Apps', Constants.OTHER_APPS_PATH, {
            icon: 'topfan'
          }
        ]);
      }
      menu.push([
        'Help<b class="tight-space"> / </b>Info', Constants.HELP_INFO_PATH, {
          icon: 'help'
        }
      ]);
      return menu;
    };

    TopFanSectionManager.prototype.createDefaultSections = function() {
      var _base, _base1, _base2, _base3, _base4, _base5, _base6, _base7, _name, _name1, _name2, _name3, _name4, _name5, _name6, _name7;
      (_base = this.defaultSections)[_name = Constants.LOGIN_PATH] || (_base[_name] = new TopFan.Panels.LoginPanel(Constants.LOGIN_PATH));
      (_base1 = this.defaultSections)[_name1 = Constants.SIGNUP_PATH] || (_base1[_name1] = new TopFan.Panels.SignupPanel(Constants.SIGNUP_PATH));
      (_base2 = this.defaultSections)[_name2 = Constants.ACCOUNT_PATH] || (_base2[_name2] = new TopFan.Panels.AccountPanel(Constants.ACCOUNT_PATH));
      (_base3 = this.defaultSections)[_name3 = Constants.REWARDS_PATH] || (_base3[_name3] = new TopFan.Panels.Rewards);
      (_base4 = this.defaultSections)[_name4 = Constants.CHALLENGES_PATH] || (_base4[_name4] = new TopFan.Panels.ChallengesPanel);
      (_base5 = this.defaultSections)[_name5 = Constants.DASHBOARD_PATH] || (_base5[_name5] = new TopFan.Panels.SocialFeedPanel(Constants.DASHBOARD_PATH));
      (_base6 = this.defaultSections)[_name6 = Constants.OTHER_APPS_PATH] || (_base6[_name6] = new TopFan.Panels.OtherAppsPanel);
      return (_base7 = this.defaultSections)[_name7 = Constants.HELP_INFO_PATH] || (_base7[_name7] = new TopFan.Panels.HelpInfoPanel(Constants.HELP_INFO_PATH));
    };

    TopFanSectionManager.prototype.createContentSections = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient) {
        this.currentPanels = [];
        this.createSectionPanels(currentClient.content_sections);
        this.createSectionPanels(TopFan.Models.ListSection.inOrder(), true);
        this.clearOutOldPanels();
        return true;
      } else {
        this.logWarn('ContentSectionManager: Not creating content sections as no client exists');
        return false;
      }
    };

    TopFanSectionManager.prototype.createSectionPanels = function(sections, isListSection) {
      var key, panel, section, _i, _len;
      if (isListSection == null) {
        isListSection = false;
      }
      if (!sections) {
        return;
      }
      this.log("ContentSectionManager: Creating " + (isListSection ? 'List' : 'Content') + " Sections");
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        key = "/" + section.slug;
        this.currentPanels.push(key);
        panel = this.contentSections[key];
        if (panel && JSON.stringify(panel.section) !== JSON.stringify(section)) {
          this.disposePanel(key, panel);
        }
        if (section.internal_content && section.internal_content.length) {
          this.contentSections[key] = new TopFan.Panels.MarkdownPanel(key, section, isListSection);
        } else if (isListSection) {
          this.contentSections[key] = new TopFan.Panels.ListSectionPanel(key, section);
        } else {
          this.contentSections[key] = new TopFan.Panels.ContentSectionPanel(key, section);
        }
      }
      return true;
    };

    TopFanSectionManager.prototype.disposePanel = function(key, panel) {
      var index, route, _i, _len, _ref;
      this.log("ContentSectionManager: Disposing panel '" + key + "'");
      _ref = Spine.Route.routes;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        route = _ref[index];
        if ((route != null) && (route.path === panel.location)) {
          Spine.Route.routes.splice(index, 1);
        }
      }
      delete this.contentSections[key];
      panel.deactivatePanel();
      panel.el.remove();
      return panel = null;
    };

    TopFanSectionManager.prototype.clearOutOldPanels = function() {
      var key, panel, _ref, _results;
      _ref = this.contentSections;
      _results = [];
      for (key in _ref) {
        panel = _ref[key];
        if (key !== Constants.MUSIC_PLAYER_PATH && this.currentPanels.indexOf(key) === -1) {
          _results.push(this.disposePanel(key, panel));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    TopFanSectionManager.prototype.loyaltyIsAvailable = function() {
      var _ref;
      return (_ref = TopFan.Models.Client.currentClient()) != null ? _ref.is_loyalty_available : void 0;
    };

    TopFanSectionManager.prototype.musicPlayerIsAvailable = function() {
      var _ref;
      return (_ref = TopFan.Models.Client.currentClient()) != null ? _ref.is_audio_available : void 0;
    };

    return TopFanSectionManager;

  })(Spine.Module);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Managers.VisitMobileSectionManager = (function(_super) {

    __extends(VisitMobileSectionManager, _super);

    function VisitMobileSectionManager() {
      this.sectionsForMenu = __bind(this.sectionsForMenu, this);
      return VisitMobileSectionManager.__super__.constructor.apply(this, arguments);
    }

    VisitMobileSectionManager.prototype.sectionsForMenu = function() {
      var currentClient, menu, section, _i, _j, _len, _len1, _ref, _ref1;
      menu = [];
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient) {
        if (currentClient.content_sections) {
          _ref = currentClient.content_sections;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            section = _ref[_i];
            menu.push([section.primary_text, '/' + section.slug, section]);
          }
        }
        if (TopFan.Models.ListSection.inOrder().length > 0) {
          _ref1 = TopFan.Models.ListSection.inOrder();
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            section = _ref1[_j];
            menu.push([section.name, '/' + section.slug, section]);
          }
        }
      }
      return menu;
    };

    VisitMobileSectionManager.prototype.createDefaultSections = function() {
      var _base, _base1, _base2, _base3, _base4, _base5, _base6, _name, _name1, _name2, _name3, _name4, _name5, _name6;
      (_base = this.defaultSections)[_name = Constants.DASHBOARD_PATH] || (_base[_name] = new TopFan.Panels.IconGridPanel(Constants.DASHBOARD_PATH));
      (_base1 = this.defaultSections)[_name1 = Constants.FAVORITES_PATH] || (_base1[_name1] = new TopFan.Panels.ListSectionPanel(Constants.FAVORITES_PATH));
      (_base2 = this.defaultSections)[_name2 = Constants.SEARCH_PATH] || (_base2[_name2] = new TopFan.Panels.SearchPanel(Constants.SEARCH_PATH));
      (_base3 = this.defaultSections)[_name3 = Constants.ENTRY_ROUTE] || (_base3[_name3] = new TopFan.Panels.EntryDetailPanel(Constants.ENTRY_ROUTE));
      (_base4 = this.defaultSections)[_name4 = Constants.SOCIAL_FEED_PATH] || (_base4[_name4] = new TopFan.Panels.VMSocialFeedPanel(Constants.SOCIAL_FEED_PATH));
      (_base5 = this.defaultSections)[_name5 = Constants.MOBILE_CONCIERGE_PATH] || (_base5[_name5] = new TopFan.Panels.MobileConciergePanel(Constants.MOBILE_CONCIERGE_PATH));
      return (_base6 = this.defaultSections)[_name6 = Constants.MOBILE_CONCIERGE_RESULTS_ROUTE] || (_base6[_name6] = new TopFan.Panels.MobileConciergeResultsPanel(Constants.MOBILE_CONCIERGE_RESULTS_ROUTE));
    };

    return VisitMobileSectionManager;

  })(TopFan.Managers.TopFanSectionManager);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Account = (function(_super) {

    __extends(Account, _super);

    function Account() {
      return Account.__super__.constructor.apply(this, arguments);
    }

    Account.configure('Account', 'email', 'gender', 'date_of_birth', 'redeemable_points', 'lifetime_points', 'leaderboard_position', 'leaderboard_size', 'name', 'address', 'address2', 'city', 'state', 'country', 'zip_code');

    Account.prototype.updatableAttributes = function() {
      return _.omit(this.attributes(), 'redeemable_points', 'lifetime_points', 'leaderboard_position', 'leaderboard_size');
    };

    return Account;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Challenge = (function(_super) {

    __extends(Challenge, _super);

    function Challenge() {
      return Challenge.__super__.constructor.apply(this, arguments);
    }

    Challenge.configure('Challenge', 'index', 'title', 'point_value', 'description', 'background_color', 'badge_image_path', 'detail_image_path', 'call_to_action', 'link', 'is_instant_reward', 'instant_reward_instructions', 'is_location_restricted');

    Challenge.hasMany('challenge_steps', 'TopFan.Models.ChallengeStep');

    Challenge.extend(Spine.Model.Local);

    Challenge.inOrder = function() {
      return _(TopFan.Models.Challenge.all()).sortBy(function(e) {
        return e.index;
      });
    };

    Challenge.prototype.stepValues = function() {
      var obj, step, _i, _len, _ref;
      obj = {};
      _ref = this.challengeSteps();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        step = _ref[_i];
        obj[step.id] = step.attemptedCompletion().value;
      }
      return obj;
    };

    Challenge.prototype.clearStepValues = function() {
      var step, _i, _len, _ref, _results;
      _ref = this.challengeSteps();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        step = _ref[_i];
        _results.push(step.completion().destroy());
      }
      return _results;
    };

    Challenge.prototype.locationRestricted = function() {
      var _ref;
      return !((_ref = $.os) != null ? _ref.android : void 0) && !TopFan.AppState.getInstance().isLocationServicesEnabled() && (this.is_location_restricted || this.location_required);
    };

    Challenge.prototype.challengeSteps = function() {
      var index, step, _i, _len, _ref, _ref1;
      if ((_ref = this.orderedChallengeSteps) != null ? _ref.length : void 0) {
        return this.orderedChallengeSteps;
      }
      this.orderedChallengeSteps = _(this.challenge_steps().all()).sortBy(function(step) {
        return step.position;
      });
      _ref1 = this.orderedChallengeSteps;
      for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
        step = _ref1[index];
        step.updateAttributes({
          position: index + 1
        });
      }
      return this.orderedChallengeSteps;
    };

    return Challenge;

  })(Spine.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.ChallengeStep = (function(_super) {

    __extends(ChallengeStep, _super);

    ChallengeStep.configure('ChallengeStep', 'id', 'title', 'description', 'type', 'position', 'link', 'call_to_action', 'open_externally_on_ios', 'open_externally_on_android', 'use_restricted_internal_browser', 'image_path');

    ChallengeStep.belongsTo('challenge', 'TopFan.Models.Challenge');

    ChallengeStep.hasOne('completion', 'TopFan.Models.ChallengeStepCompletion');

    function ChallengeStep() {
      this.attemptedCompletion = __bind(this.attemptedCompletion, this);

      this.state = __bind(this.state, this);

      this.validationPending = __bind(this.validationPending, this);

      this.validationFailure = __bind(this.validationFailure, this);

      this.validationSuccess = __bind(this.validationSuccess, this);

      this.isGeolocation = __bind(this.isGeolocation, this);
      ChallengeStep.__super__.constructor.apply(this, arguments);
      this.position || (this.position = 0);
    }

    ChallengeStep.prototype.isGeolocation = function() {
      return this.type === 'Geolocation';
    };

    ChallengeStep.prototype.stepTitle = function() {
      return "STEP " + this.position + ": ";
    };

    ChallengeStep.prototype.messageForState = function() {
      switch (this.state()) {
        case '':
          return 'Not Attempted';
        case 'valid':
          return 'Completed!';
        case 'pending':
          return 'Need Internet Connection';
        case 'invalid':
          switch (this.type) {
            case 'MultipleUseCode':
              return 'Code Failed, Try Again';
            case 'SingleUseCode':
              return 'Code Failed, Try Again';
            case 'Scan':
              return 'Scan Failed, Try Again';
            case 'Geolocation':
              return 'Check in Failed, Try Again';
            default:
              return 'Step Failed, Try Again';
          }
      }
    };

    ChallengeStep.prototype.validateValue = function(value) {
      var request;
      if (value) {
        this.attemptedCompletion().updateAttributes({
          value: value
        });
      }
      if (!TopFan.AppState.getInstance().isOnline()) {
        return this.validationPending();
      }
      request = new TopFan.Request({
        type: 'POST',
        token: TopFan.Request.TOKEN_USER,
        url: "/client/challenge_steps/" + this.id + "/validate",
        data: JSON.stringify({
          value: this.attemptedCompletion().value
        }),
        success: this.validationSuccess,
        error: this.validationFailure
      });
      TopFan.Loader.getInstance().show('Validating');
      return request.perform();
    };

    ChallengeStep.prototype.validationSuccess = function() {
      TopFan.Loader.getInstance().hide();
      this.setState('valid');
      this.trigger('validation');
      return this.trigger('validationSuccess');
    };

    ChallengeStep.prototype.validationFailure = function(xhr) {
      TopFan.Loader.getInstance().hide();
      this.setState('invalid');
      this.trigger('validation');
      return this.trigger('validationFailure', xhr);
    };

    ChallengeStep.prototype.validationPending = function() {
      this.setState('pending');
      this.trigger('validation');
      return this.trigger('validationPending');
    };

    ChallengeStep.prototype.state = function() {
      return this.attemptedCompletion().state;
    };

    ChallengeStep.prototype.setState = function(state) {
      return this.attemptedCompletion().updateAttributes({
        state: state
      });
    };

    ChallengeStep.prototype.attemptedCompletion = function() {
      this.attempt || (this.attempt = this.completion({
        state: ''
      }));
      if (typeof this.attempt.value === 'undefined') {
        if (this.isGeolocation()) {
          if (this.isGeolocation() && typeof this.attempt.value === 'undefined') {
            this.setDefaultLocation(this.attempt);
          }
        } else {
          this.attempt.value = null;
        }
      }
      return this.attempt;
    };

    ChallengeStep.prototype.setDefaultLocation = function(attempt) {
      var position, _ref;
      if (TopFan.AppState.getInstance().isLocationServicesEnabled()) {
        position = (_ref = TopFan.Services.LocationService.getInstance().currentPosition()) != null ? _ref.coords : void 0;
        return attempt.value = position ? [position.latitude, position.longitude] : [null, null];
      } else {
        return attempt.value = [null, null];
      }
    };

    return ChallengeStep;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.ChallengeStepCompletion = (function(_super) {

    __extends(ChallengeStepCompletion, _super);

    function ChallengeStepCompletion() {
      return ChallengeStepCompletion.__super__.constructor.apply(this, arguments);
    }

    ChallengeStepCompletion.configure('ChallengeStepCompletion', 'id', 'value', 'state');

    ChallengeStepCompletion.belongsTo('challenge_step', 'TopFan.Models.ChallengeStep');

    return ChallengeStepCompletion;

  })(Spine.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.ListSection = (function(_super) {

    __extends(ListSection, _super);

    ListSection.configure('ListSection', 'id', 'name', 'icon', 'color', 'slug', 'position', 'default_sort', 'external_link', 'open_externally_on_ios', 'open_externally_on_android', 'use_restricted_internal_browser', 'internal_content', 'subcat_filter_label', 'feature_filter_label','subcat_filter_icon_url','feature_filter_icon_url','icon_path', 'retailer_type_ids');

    ListSection.belongsTo('client', 'TopFan.Models.Client');

    ListSection.hasMany('list_section_entries', 'TopFan.Models.ListSectionEntry');

    ListSection.findByIds = function(ids) {
      return TopFan.Models.ListSection.select(function(record) {
        return _(ids).indexOf(record.id) !== -1;
      });
    };

    ListSection.inOrder = function() {
      return _(TopFan.Models.ListSection.all()).sortBy(function(e) {
        return e.position;
      });
    };

    function ListSection() {
      this.activeListSectionEntries = __bind(this.activeListSectionEntries, this);

      this.geolocationSuccess = __bind(this.geolocationSuccess, this);
      ListSection.__super__.constructor.apply(this, arguments);
      this.locationService = TopFan.Services.LocationService.getInstance();
      this.locationService.bind('locationSuccess', this.geolocationSuccess);
    }

    ListSection.prototype.geolocationSuccess = function() {
      var distance, entry, _i, _len, _ref, _results;
      _ref = this.list_section_entries().all();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        distance = this.locationService.getDistanceFromEntry(entry);
        _results.push(entry.cacheDistance(distance, this.locationService.getFormattedDistance(distance)));
      }
      return _results;
    };

    ListSection.prototype.activeListSectionEntries = function() {
      var now;
      now = moment(new Date());
      return _(this.list_section_entries().all()).filter(function(entry) {
        if (entry.end_date) {
          return moment(entry.end_date) >= now;
        } else if (entry.start_date && !entry.end_date) {
          return moment(entry.start_date) <= now;
        } else {
          return true;
        }
      });
    };

    return ListSection;

  })(Spine.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Client = (function(_super) {
    var isSyncing;

    __extends(Client, _super);

    function Client() {
      this.isSocialFeedAvailable = __bind(this.isSocialFeedAvailable, this);
      return Client.__super__.constructor.apply(this, arguments);
    }

    isSyncing = false;

    Client.configure('Client', 'name', 'bio', 'content_sections', 'news_items', 'facebook_id', 'audio_tracks', 'twitter_handle', 'promo_image_url', 'headshot_path', 'google_analytics_tracking_id', 'custom_ga_tracking_id', 'app_theme_color', 'hide_other_apps_section', 'is_loyalty_available', 'is_audio_available', 'is_mobile_concierge_available', 'organization', 'color_palette', 'latitude', 'longitude', 'zoom_level', 'distance_measurement', 'interview_questions', 'enable_push_notifications', 'user_password_reset', 'destination_radius', 'enable_talkchain', 'talkchain_community_id', 'talkchain_color_primary', 'talkchain_color_secondary', 'talkchain_color_highlight', 'talkchain_color_accent', 'talkchain_color_header', 'color_palette_size', 'promo_images', 'promo_image_size');

    Client.hasMany('list_sections', 'TopFan.Models.ListSection');

    Client.hasMany('social_items', 'TopFan.Models.SocialItem');

    Client.sync = function(client_id,list_id,filter_id) {
      var request,
        _this = this;
      if (isSyncing || !TopFan.AppState.getInstance().isOnline()) {
        return;
      }
      if(filter_id == 0) {
        var url = '/clients/'+client_id+'/list_sections/'+list_id;
      } else {
        var url = '/clients/'+client_id+'/list_sections/'+list_id+'/?filter_id='+filter_id;
      }
      isSyncing = true;
      request = new TopFan.Request({
        type: 'GET',
        token: TopFan.Request.TOKEN_CLIENT,
        url: url,
        success: TopFan.Models.Client.syncDidSucceed,
        complete: function() {
          return isSyncing = false;
        }
      });
      console.log('------Request-------',request);
      return request.perform();
    };

    Client.syncFromLocalFile = function() {
      if (TopFan.AppState.getInstance().isOnline()) {
        return;
      }
      return $.getJSON('client.json', TopFan.Models.Client.syncDidSucceed);
    };

    Client.syncDidSucceed = function(currentClient) {
      //console.log(JSON.stringify(currentClient));
      var obj = {
        "latitude": currentClient.latitude,
        "longitude": currentClient.longitude,
        "zoom_level": currentClient.zoom_level,
        "distance_measurement": currentClient.distance_measurement,
        "destination_radius": currentClient.destination_radius,
        "list_sections": [currentClient]
      };
      var colorIndex, currentColor, entry, index, section, _i, _j, _len, _len1, _ref, _ref1;
      TopFan.Models.Client.deleteAll();
      TopFan.Models.ListSection.deleteAll();
      TopFan.Models.ListSectionEntry.deleteAll();
      colorIndex = 0;
      currentClient = obj;
      console.log('---Current Client---');
      console.log(JSON.stringify(currentClient));
      var listS = currentClient.list_sections[0];
      localStorage.setItem('google_analytics_tracking_id',listS.google_analytics_tracking_id);
      localStorage.setItem('custom_ga_tracking_id',listS.custom_ga_tracking_id);
      localStorage.setItem('subcat_filter_label',listS.subcat_filter_label);
      localStorage.setItem('feature_filter_label',listS.feature_filter_label);
      localStorage.setItem('subcat_filter_icon_url',listS.subcat_filter_icon_url);
      localStorage.setItem('feature_filter_icon_url',listS.feature_filter_icon_url);
      //if (currentClient.color_palette && currentClient.color_palette.length) {
        _ref = currentClient.list_sections;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          section = _ref[index];
        //  currentColor = currentClient.color_palette[colorIndex];
        //  section.color = currentColor;
          _ref1 = section.list_section_entries;
          var section_ids = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            entry = _ref1[_j];
            entry.color = section.color;
            entry.icon = section.icon;
            entry.icon_path = section.icon_path;
            entry.retailer_type_ids = entry.retailer_type_ids;
            section_ids.push(entry.id);
          }
          localStorage.setItem('section_ids',section_ids);
          // if (index === currentClient.color_palette.length - 1) {
          //   colorIndex = 0;
          // } else {
          //   colorIndex += 1;
          // }
        }
      //}
      return TopFan.Models.Client.create(currentClient);
    };

    Client.currentClient = function() {
      return this.first();
    };

    Client.prototype.bioAsHTML = function() {
      return TopFan.MarkdownParser.getInstance().parseMarkdown(this.bio);
    };

    Client.prototype.searchAllEntries = function(query) {
      var entries, entry, key, keys, sortedEntries, _i, _j, _len, _len1, _ref;
      keys = [];
      entries = {};
      _ref = TopFan.Models.ListSectionEntry.all();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (key = entry.isSearchResult(query)) {
          if (!(_(keys).indexOf(key) > -1)) {
            keys.push(key);
          }
          if (!entries[key]) {
            entries[key] = [];
          }
          entries[key].push(entry);
        }
      }
      keys.sort().reverse();
      sortedEntries = [];
      for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
        key = keys[_j];
        sortedEntries = sortedEntries.concat(this.sortByDistance(entries[key]));
      }
      return _(sortedEntries).uniq(false, function(entry) {
        return entry.search_collapse_key || entry.id;
      });
    };

    Client.prototype.sortByDistance = function(entries) {
      var sortFunction;
      sortFunction = function(a, b) {
        var compA, compB;
        compA = a.fetchCachedDistance().distance;
        compB = b.fetchCachedDistance().distance;
        if (compA < compB) {
          return -1;
        }
        if (compA > compB) {
          return 1;
        }
        return 0;
      };
      return entries.sort(sortFunction);
    };

    Client.prototype.isSocialFeedAvailable = function() {
      return TopFan.Managers.SocialFeedManager.getInstance().allItemsSorted().length > 0;
    };

    Client.isMobileConciergeAvailable = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      return currentClient && currentClient.is_mobile_concierge_available && currentClient.interview_questions.length > 0;
    };

    Client.isTalkChainEnabled = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      return currentClient && currentClient.enable_talkchain && currentClient.talkchain_community_id && window.buildConfig.platformName === 'iOS';
    };

    return Client;

  }).call(this, Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.ClientToken = (function(_super) {

    __extends(ClientToken, _super);

    function ClientToken() {
      return ClientToken.__super__.constructor.apply(this, arguments);
    }

    ClientToken.configure('ClientToken', 'token');

    return ClientToken;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Completion = (function(_super) {

    __extends(Completion, _super);

    function Completion() {
      return Completion.__super__.constructor.apply(this, arguments);
    }

    Completion.hasSynced = false;

    Completion.configure('Completion', 'index', 'title', 'points_earned', 'background_color', 'badge_image_path', 'detail_image_path', 'completed_at', 'is_instant_reward', 'instant_reward_instructions');

    Completion.inOrder = function() {
      return _(TopFan.Models.Completion.all()).sortBy(function(e) {
        return e.index;
      });
    };

    return Completion;

  })(Spine.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.ListSectionEntry = (function(_super) {
    var SEARCH_PRIOIRTY_DESCRIPTION, SEARCH_PRIOIRTY_FEATURES, SEARCH_PRIOIRTY_NAME, SEARCH_PRIOIRTY_SUBCATEGORIES, SEARCH_SCORE_THRESHOLD;

    __extends(ListSectionEntry, _super);

    function ListSectionEntry() {
      this.activeOffers = __bind(this.activeOffers, this);

      this.isMemberForSort = __bind(this.isMemberForSort, this);

      this.hasDescriptionMatch = __bind(this.hasDescriptionMatch, this);

      this.hasFeatureMatch = __bind(this.hasFeatureMatch, this);

      this.hasSubcategoryMatch = __bind(this.hasSubcategoryMatch, this);

      this.hasNameMatch = __bind(this.hasNameMatch, this);

      this.isSearchResult = __bind(this.isSearchResult, this);

      this.featuresAsString = __bind(this.featuresAsString, this);

      this.subcategoriesAsString = __bind(this.subcategoriesAsString, this);

      this.distanceDescription = __bind(this.distanceDescription, this);

      this.distanceDescriptionD = __bind(this.distanceDescriptionD, this);

      this.fetchCachedDistance = __bind(this.fetchCachedDistance, this);

      this.cacheDistance = __bind(this.cacheDistance, this);

      this.removeFromFavorites = __bind(this.removeFromFavorites, this);

      this.addToFavorites = __bind(this.addToFavorites, this);
      return ListSectionEntry.__super__.constructor.apply(this, arguments);
    }

    SEARCH_SCORE_THRESHOLD = 0.95;

    SEARCH_PRIOIRTY_NAME = 4;

    SEARCH_PRIOIRTY_SUBCATEGORIES = 3;

    SEARCH_PRIOIRTY_FEATURES = 2;

    SEARCH_PRIOIRTY_DESCRIPTION = 1;

    ListSectionEntry.configure('ListSectionEntry', 'id', 'search_collapse_key', 'name', 'description', 'additional_description', 'color', 'icon', 'image_path', 'address', 'city', 'state', 'zip', 'phone_number', 'website', 'latitude', 'longitude', 'subcategories', 'features', 'start_date', 'end_date', 'is_member', 'is_featured', 'featured_image_path', 'open_externally_on_ios', 'open_externally_on_android', 'use_restricted_internal_browser', 'is_mobile_concierge_available', 'interview_answer_ids','icon_path', 'retailer_type_ids');

    ListSectionEntry.belongsTo('list_section', 'TopFan.Models.ListSection');

    ListSectionEntry.hasMany('offers', 'TopFan.Models.Offer');

    ListSectionEntry.findByAnswerIds = function(answerIds) {
      return TopFan.Models.ListSectionEntry.select(function(entry) {
        var id, _i, _len;
        if (!entry.is_mobile_concierge_available) {
          return false;
        }
        for (_i = 0, _len = answerIds.length; _i < _len; _i++) {
          id = answerIds[_i];
          if (_(entry.interview_answer_ids).indexOf(parseInt(id)) === -1) {
            return false;
          }
        }
        return true;
      });
    };

    ListSectionEntry.prototype.addToFavorites = function() {
      var arr = localStorage.getItem('Favorite');

      var fav = new TopFan.Models.Favorite(this.attributes());
      var data = fav.save();
      
      console.log(arr);
      if(arr==null) {
        arr = new Array();
      } else {
        arr = JSON.parse(arr);
      }
      console.log(arr);
      arr.push(this.attributes());
      localStorage.setItem('Favorite',JSON.stringify(arr))

      try{
        window.plugins.NativeStorage.set("Favorite", JSON.stringify(arr));
      }catch(e){
        console.log('error add to favorite',JSON.stringify(e))
      }
      //return data;
    };

    ListSectionEntry.prototype.removeFromFavorites = function() {
      var d = TopFan.Models.Favorite.destroy(this.id);

      var favItems = localStorage.getItem("Favorite");
      if(favItems){
        window.plugins.NativeStorage.set("Favorite", favItems);  
      }
      return d;
    };

    ListSectionEntry.prototype.cacheDistance = function(distance, formattedDistance) {
      var _base;
      (_base = TopFan.Models.ListSectionEntry).distanceCache || (_base.distanceCache = {});
      return TopFan.Models.ListSectionEntry.distanceCache[this.id] = {
        distance: distance,
        formattedDistance: formattedDistance
      };
    };

    ListSectionEntry.prototype.fetchCachedDistance = function() {
      var _base;
      (_base = TopFan.Models.ListSectionEntry).distanceCache || (_base.distanceCache = {});
      return TopFan.Models.ListSectionEntry.distanceCache[this.id] || {
        distance: null,
        formattedDistance: null
      };
    };

    ListSectionEntry.prototype.distanceDescription = function(includeCategories) {
      var cachedDistance, descriptionComponents;
      descriptionComponents = [];
      if (this.start_date && this.end_date && this.list_section().default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        if (this.start_date === this.end_date) {
          descriptionComponents.push(moment(this.end_date).format(Constants.SHORT_DATE));
        } else {
          descriptionComponents.push("" + (moment(this.start_date).format(Constants.SHORT_DATE)) + " - " + (moment(this.end_date).format(Constants.SHORT_DATE)));
        }
      }
      cachedDistance = this.fetchCachedDistance();
      if (cachedDistance.formattedDistance && cachedDistance.distance >= 0) {
        descriptionComponents.push("" + cachedDistance.formattedDistance + " away");
      }
      if (includeCategories && this.list_section().default_sort !== TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        //descriptionComponents.push(this.subcategoriesAsString());
      }
     
      if (this.activeOffers().length > 0) {
          return "<div class='entry--offerName' style='background-repeat: no-repeat;background-size: 2.5rem 2.5rem;color: #A6A8AB;height: 2.175rem;padding-left: 1.5rem;padding-top: 0.125rem;margin-bottom: 0.1125rem;position:absolute'>" + (_(descriptionComponents).compact().join(" / ")) + "</div>";
      } else {
        return _(descriptionComponents).compact().join(" / ");
      }
    };

    ListSectionEntry.prototype.distanceDescriptionD = function(includeCategories) {
      console.log('test------');
      var cachedDistance, descriptionComponents;
      descriptionComponents = [];
      if (this.start_date && this.end_date && this.list_section().default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        if (this.start_date === this.end_date) {
          descriptionComponents.push(moment(this.end_date).format(Constants.SHORT_DATE));
        } else {
          descriptionComponents.push("" + (moment(this.start_date).format(Constants.SHORT_DATE)) + " - " + (moment(this.end_date).format(Constants.SHORT_DATE)));
        }
      }
      cachedDistance = this.fetchCachedDistance();
      if (cachedDistance.formattedDistance && cachedDistance.distance >= 0) {
        descriptionComponents.push("" + cachedDistance.formattedDistance + " away");
      }
      if (includeCategories && this.list_section().default_sort !== TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        //descriptionComponents.push(this.subcategoriesAsString());
      }
     
      if (this.activeOffers().length > 0) {
          return "<div class='entry--offerName' style='background-position: -0.73rem -0.625rem;background-repeat: no-repeat;background-size: 3.0rem 3.0rem;color: #808184; height: 2.175rem;padding-left: 1.95rem;padding-top: 0.425rem;margin-bottom: 0.3125rem;'>" + (_(descriptionComponents).compact().join(" / ")) + "</div>";
      } else {
        return _(descriptionComponents).compact().join(" / ");
      }
    };

    ListSectionEntry.prototype.subcategoriesAsString = function() {
      return _(this.subcategories).chain().compact().sort().uniq(true).value().join(', ');
    };

    ListSectionEntry.prototype.featuresAsString = function() {
      return _(this.features).chain().compact().sort().uniq(true).value().join(', ');
    };

    ListSectionEntry.prototype.descriptionAsHTML = function() {
      return TopFan.MarkdownParser.getInstance().parseMarkdown(this.description);
    };

    ListSectionEntry.prototype.additionalDescriptionAsHTML = function() {
      return TopFan.MarkdownParser.getInstance().parseMarkdown(this.additional_description);
    };

    ListSectionEntry.prototype.isSearchResult = function(query) {
      var score;
      if (score = this.hasNameMatch(query)) {
        return score;
      } else if (score = this.hasSubcategoryMatch(query)) {
        return score;
      } else if (score = this.hasFeatureMatch(query)) {
        return score;
      } else if (score = this.hasDescriptionMatch(query)) {
        return score;
      }
      return false;
    };

    ListSectionEntry.prototype.hasNameMatch = function(query) {
      if (this.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
        return SEARCH_PRIOIRTY_NAME;
      }
      return false;
    };

    ListSectionEntry.prototype.hasSubcategoryMatch = function(query) {
      var score, subcategory, word, _i, _j, _len, _len1, _ref, _ref1;
      if (this.subcategories) {
        _ref = this.subcategories;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subcategory = _ref[_i];
          if (!subcategory) {
            continue;
          }
          if (subcategory.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            return SEARCH_PRIOIRTY_SUBCATEGORIES;
          }
          _ref1 = subcategory.split(' ');
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            word = _ref1[_j];
            if (!word) {
              continue;
            }
            score = LiquidMetal.score(word, query);
            if (score >= SEARCH_SCORE_THRESHOLD) {
              return score * SEARCH_PRIOIRTY_SUBCATEGORIES;
            }
          }
        }
      }
      return false;
    };

    ListSectionEntry.prototype.hasFeatureMatch = function(query) {
      var feature, score, word, _i, _j, _len, _len1, _ref, _ref1;
      if (this.features) {
        _ref = this.features;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          feature = _ref[_i];
          if (!feature) {
            continue;
          }
          if (feature.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            return SEARCH_PRIOIRTY_FEATURES;
          }
          _ref1 = feature.split(' ');
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            word = _ref1[_j];
            if (!word) {
              continue;
            }
            score = LiquidMetal.score(word, query);
            if (score >= SEARCH_SCORE_THRESHOLD) {
              return score * SEARCH_PRIOIRTY_FEATURES;
            }
          }
        }
      }
      return false;
    };

    ListSectionEntry.prototype.hasDescriptionMatch = function(query) {
      var score, word, _i, _len, _ref,_j,_query,_m,_arr;
      if (this.description) {
        _ref = this.description.split(' ');
        _query = query.split(' ')
        for(_j =0, _lenq = _query.length;_j < _lenq; _j++) {
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            word = _ref[_i];
            if (!word) {
              continue;
            }
            console.log('Search Word---'+_query[_j]);
            score = LiquidMetal.score(word, _query[_j]);
            //_arr.push(score);
            if (score >= SEARCH_SCORE_THRESHOLD) {
              return score * SEARCH_PRIOIRTY_DESCRIPTION;
            }
          }
        }
      }
      return false;
    };


    ListSectionEntry.prototype.isMemberForSort = function() {
      return !this.is_member;
    };

    ListSectionEntry.prototype.activeOffers = function() {
      var now;
      now = moment(new Date());
      return _(this.offers().all()).filter(function(offer) {
        if (offer.start_date && offer.end_date) {
          return moment(offer.start_date) <= now && moment(offer.end_date) >= now;
        } else if (offer.start_date && !offer.end_date) {
          return moment(offer.start_date) <= now;
        } else if (offer.end_date && !offer.start_date) {
          return moment(offer.end_date) >= now;
        } else {
          return true;
        }
      });
    };

    return ListSectionEntry;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Favorite = (function(_super) {
    var _this = this;

    __extends(Favorite, _super);

    function Favorite() {
      return Favorite.__super__.constructor.apply(this, arguments);
    }

    (function() {
      var arr, key, value, _ref, _results;
      arr = TopFan.Models.ListSectionEntry.attributes;
      arr.unshift('Favorite');
      Favorite.configure.apply(Favorite, arr);
      _ref = TopFan.Models.ListSectionEntry.prototype;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        if (key !== 'constructor') {
          _results.push(Favorite.prototype[key] = value);
        }
      }
      return _results;
    })();

    Favorite.extend(Spine.Model.Local);

    return Favorite;

  }).call(this, Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Offer = (function(_super) {

    __extends(Offer, _super);

    function Offer() {
      return Offer.__super__.constructor.apply(this, arguments);
    }

    Offer.configure('Offer', 'id', 'name', 'description', 'start_date', 'end_date');

    Offer.belongsTo('list_section_entry', 'TopFan.Models.ListSectionEntry');

    Offer.prototype.descriptionAsHTML = function() {
      return TopFan.MarkdownParser.getInstance().parseMarkdown(this.description);
    };

    return Offer;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.OtherApps = (function(_super) {

    __extends(OtherApps, _super);

    function OtherApps() {
      return OtherApps.__super__.constructor.apply(this, arguments);
    }

    OtherApps.hasSynced = false;

    OtherApps.link = null;

    OtherApps.configure('Clients', 'name', 'android_market_link', 'itunes_store_link', 'categories', 'icon_url', 'link');

    OtherApps.sync = function() {
      var currentClient, request;
      currentClient = TopFan.Models.Client.currentClient();
      if (!currentClient || currentClient.hide_other_apps_section) {
        return;
      }
      request = new TopFan.Request({
        type: 'GET',
        token: TopFan.Request.TOKEN_CLIENT,
        url: "/clients",
        success: TopFan.Models.OtherApps.syncDidSucceed
      });
      return request.perform();
    };

    OtherApps.syncDidSucceed = function(json) {
      TopFan.Models.OtherApps.hasSynced = true;
      TopFan.Models.OtherApps.deleteAll();
      return TopFan.Models.OtherApps.refresh(json);
    };

    OtherApps.fromJSON = function(objects) {
      var apps;
      if ($.os.android) {
        apps = _(objects).filter(function(obj) {
          obj['link'] = obj.android_market_link;
          return obj.android_market_link !== '';
        });
      } else if ($.os.ios || (!$.os.ios && !$.os.android)) {
        apps = _(objects).filter(function(obj) {
          obj['link'] = obj.itunes_store_link;
          return obj.itunes_store_link !== '';
        });
      }
      return OtherApps.__super__.constructor.fromJSON.call(this, apps);
    };

    OtherApps.filter = function(category) {
      if (!category || category === Constants.ALL_CATEGORIES) {
        return this.all();
      }
      return this.select(function(c) {
        return _(c.categories).pluck('name').indexOf(category) !== -1;
      });
    };

    OtherApps.categories = function() {
      var apps, flatSortedApps;
      apps = _(this.all()).map(function(otherApp) {
        return _(otherApp.categories).pluck('name');
      });
      flatSortedApps = _(apps).flatten().sort();
      flatSortedApps.unshift(Constants.ALL_CATEGORIES);
      return _(flatSortedApps).uniq(true);
    };

    return OtherApps;

  })(Spine.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.Reward = (function(_super) {

    __extends(Reward, _super);

    function Reward() {
      this.remainingPointsToRedeem = __bind(this.remainingPointsToRedeem, this);
      return Reward.__super__.constructor.apply(this, arguments);
    }

    Reward.configure('Reward', 'index', 'title', 'description', 'point_cost', 'quantity_available', 'detail_image_path');

    Reward.inOrder = function() {
      return _(TopFan.Models.Reward.all()).sortBy(function(e) {
        return e.index;
      });
    };

    Reward.prototype.isAvailable = function() {
      if (TopFan.Services.AccountService.getInstance().currentAccount()) {
        return TopFan.Services.AccountService.getInstance().currentAccount().redeemable_points >= this.point_cost;
      } else {
        return false;
      }
    };

    Reward.prototype.remainingPointsToRedeem = function() {
      if (TopFan.Services.AccountService.getInstance().currentAccount()) {
        if (this.isAvailable()) {
          return 0;
        } else {
          return this.point_cost - TopFan.Services.AccountService.getInstance().currentAccount().redeemable_points;
        }
      } else {
        return this.point_cost;
      }
    };

    return Reward;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.SocialItem = (function(_super) {

    __extends(SocialItem, _super);

    function SocialItem() {
      return SocialItem.__super__.constructor.apply(this, arguments);
    }

    SocialItem.PROVIDER_INSTAGRAM = 'instagram';

    SocialItem.PROVIDER_FACEBOOK = 'facebook';

    SocialItem.PROVIDER_TWITTER = 'twitter';

    SocialItem.KIND_PHOTO = 'photo';

    SocialItem.configure('SocialItem', 'title', 'link', 'photo_url', 'provider', 'uid', 'posted_at');

    SocialItem.belongsTo('client', 'TopFan.Models.Client');

    return SocialItem;

  })(Spine.Model);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Models.UserToken = (function(_super) {

    __extends(UserToken, _super);

    function UserToken() {
      return UserToken.__super__.constructor.apply(this, arguments);
    }

    UserToken.configure('UserToken', 'token');

    return UserToken;

  })(Spine.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.AccountObserver = (function(_super) {

    __extends(AccountObserver, _super);

    function AccountObserver() {
      this.userDidLogout = __bind(this.userDidLogout, this);

      this.userDidLogin = __bind(this.userDidLogin, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return AccountObserver.__super__.constructor.apply(this, arguments);
    }

    AccountObserver.prototype.bindEventHandlers = function() {
      AccountObserver.__super__.bindEventHandlers.apply(this, arguments);
      TopFan.Models.Account.bind('login', this.userDidLogin);
      return TopFan.Models.Account.bind('logout', this.userDidLogout);
    };

    AccountObserver.prototype.unbindEventHandlers = function() {
      AccountObserver.__super__.unbindEventHandlers.apply(this, arguments);
      TopFan.Models.Account.unbind('login', this.userDidLogin);
      return TopFan.Models.Account.unbind('logout', this.userDidLogout);
    };

    AccountObserver.prototype.userDidLogin = function() {
      this.log('Observed: userDidLogin');
      TopFan.AppState.getInstance().setIsLoggedIn(true);
      TopFan.AppMenu.getInstance().render();
      return true;
    };

    AccountObserver.prototype.userDidLogout = function() {
      this.log('Observed: userDidLogout');
      TopFan.AppState.getInstance().setIsLoggedIn(false);
      TopFan.AppMenu.getInstance().render();
      TopFan.Models.Completion.destroyAll();
      TopFan.Services.ChallengeRetrievalService.getInstance().retrieve();
      TopFan.Services.RewardRetrievalService.getInstance().retrieve();
      return true;
    };

    return AccountObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.AppStageManagerObserver = (function(_super) {

    __extends(AppStageManagerObserver, _super);

    function AppStageManagerObserver() {
      this.managerDidChange = __bind(this.managerDidChange, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return AppStageManagerObserver.__super__.constructor.apply(this, arguments);
    }

    AppStageManagerObserver.prototype.currentPath = null;

    AppStageManagerObserver.prototype.bindEventHandlers = function() {
      AppStageManagerObserver.__super__.bindEventHandlers.apply(this, arguments);
      return TopFan.Initializer.getInstance().applicationStage.getManager().bind('change', this.managerDidChange);
    };

    AppStageManagerObserver.prototype.unbindEventHandlers = function() {
      AppStageManagerObserver.__super__.unbindEventHandlers.apply(this, arguments);
      return TopFan.Initializer.getInstance().applicationStage.getManager().unbind('change', this.managerDidChange);
    };

    AppStageManagerObserver.prototype.managerDidChange = function(controller) {
      this.log('Observed: managerDidChange');
      FormDisabler.getInstance().disableDuringTransition(controller);
      return true;
    };

    return AppStageManagerObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.ChallengeObserver = (function(_super) {

    __extends(ChallengeObserver, _super);

    function ChallengeObserver() {
      this.challengeDidComplete = __bind(this.challengeDidComplete, this);

      this.collectionDidRefresh = __bind(this.collectionDidRefresh, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return ChallengeObserver.__super__.constructor.apply(this, arguments);
    }

    ChallengeObserver.prototype.bindEventHandlers = function() {
      TopFan.Models.Challenge.bind('change refresh', this.collectionDidRefresh);
      return TopFan.Models.Challenge.bind('complete', this.challengeDidComplete);
    };

    ChallengeObserver.prototype.unbindEventHandlers = function() {
      TopFan.Models.Challenge.unbind('change', this.collectionDidRefresh);
      TopFan.Models.Challenge.unbind('refresh', this.collectionDidRefresh);
      return TopFan.Models.Challenge.unbind('complete', this.challengeDidComplete);
    };

    ChallengeObserver.prototype.collectionDidRefresh = function() {
      this.log('Observed: challengeCollectionDidRefresh');
      TopFan.AppMenu.getInstance().updateChallengesBadge();
      return true;
    };

    ChallengeObserver.prototype.challengeDidComplete = function() {
      this.log('Observed: challengeDidComplete');
      TopFan.Services.ChallengeRetrievalService.getInstance().retrieve();
      TopFan.Services.RewardRetrievalService.getInstance().retrieve();
      TopFan.Services.AccountService.getInstance().fetch();
      return true;
    };

    return ChallengeObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.ClientObserver = (function(_super) {

    __extends(ClientObserver, _super);

    function ClientObserver() {
      this.clientDidChange = __bind(this.clientDidChange, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return ClientObserver.__super__.constructor.apply(this, arguments);
    }

    ClientObserver.prototype.bindEventHandlers = function() {
      return TopFan.Models.Client.bind('refresh create update', this.clientDidChange);
    };

    ClientObserver.prototype.unbindEventHandlers = function() {
      TopFan.Models.Client.unbind('refresh', this.clientDidChange);
      TopFan.Models.Client.unbind('create', this.clientDidChange);
      return TopFan.Models.Client.unbind('update', this.clientDidChange);
    };

    ClientObserver.prototype.clientDidChange = function(e) {
      var currentClient;
      if (TopFan.Models.Client.count() > 0) {
        currentClient = TopFan.Models.Client.currentClient();
        if (!TopFan.AppState.getInstance().isTopFan()) {
          TopFan.Services.LocationService.getInstance().setCenter();
        }
        this.log('Observed: clientDidChange');
        GoogleAnalytics.getInstance().initWithCurrentClient();
        if (TopFan.Models.Client.isTalkChainEnabled()) {
          TalkChain.getInstance().initWithCurrentClient();
        }
        if (TopFan.AppState.getInstance().isOnline()) {
          TopFan.Managers.SocialFeedManager.getInstance().fetch();
          if (currentClient.is_loyalty_available) {
            TopFan.Services.ChallengeRetrievalService.getInstance().retrieve();
            TopFan.Services.RewardRetrievalService.getInstance().retrieve();
          }
          if (currentClient.enable_push_notifications) {
            TopFan.PushNotificationHelper.register();
          }
          if (TopFan.AppState.getInstance().isTopFan()) {
            if (!currentClient.hide_other_apps_section) {
              TopFan.Models.OtherApps.sync();
            }
          } else {
            TopFan.MapView.getInstance().removeMarkers();
          }
        }
        TopFan.Managers.ContentSectionManager.getInstance().createSections();
        TopFan.AppMenu.getInstance().render();
        TopFan.Managers.ContentSectionManager.getInstance().activateDefaultSection();
      }
      return true;
    };

    return ClientObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.ClientTokenObserver = (function(_super) {

    __extends(ClientTokenObserver, _super);



    function ClientTokenObserver() {


      this.tokenWasObtained = __bind(this.tokenWasObtained, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return ClientTokenObserver.__super__.constructor.apply(this, arguments);
    }

    ClientTokenObserver.prototype.bindEventHandlers = function() {
      return TopFan.Models.ClientToken.bind('retrieve', this.tokenWasObtained);
    };

    ClientTokenObserver.prototype.unbindEventHandlers = function() {
      return TopFan.Models.ClientToken.unbind('retrieve', this.tokenWasObtained);
    };

    ClientTokenObserver.prototype.tokenWasObtained = function() {
      if (TopFan.AppState.getInstance().hasClientToken()) {
        this.log('Observed: clientTokenWasObtained');
         TopFan.Models.Client.sync(localStorage.getItem('city_id'),localStorage.getItem('list_id'),localStorage.getItem('filter_id'));
      }
      return true;
    };

    return ClientTokenObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.RewardObserver = (function(_super) {

    __extends(RewardObserver, _super);

    function RewardObserver() {
      this.rewardWasRedeemed = __bind(this.rewardWasRedeemed, this);

      this.collectionDidRefresh = __bind(this.collectionDidRefresh, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return RewardObserver.__super__.constructor.apply(this, arguments);
    }

    RewardObserver.prototype.bindEventHandlers = function() {
      RewardObserver.__super__.bindEventHandlers.apply(this, arguments);
      TopFan.Models.Reward.bind('redeem', this.rewardWasRedeemed);
      return TopFan.Models.Reward.bind('change refresh', this.collectionDidRefresh);
    };

    RewardObserver.prototype.unbindEventHandlers = function() {
      RewardObserver.__super__.unbindEventHandlers.apply(this, arguments);
      TopFan.Models.Reward.unbind('redeem', this.rewardWasRedeemed);
      TopFan.Models.Reward.unbind('change', this.collectionDidRefresh);
      return TopFan.Models.Reward.unbind('refresh', this.collectionDidRefresh);
    };

    RewardObserver.prototype.collectionDidRefresh = function() {
      TopFan.AppMenu.getInstance().updateRewardsBadge();
      return true;
    };

    RewardObserver.prototype.rewardWasRedeemed = function() {
      this.log('Observed: rewardWasRedeemed');
      TopFan.Services.AccountService.getInstance().fetch();
      TopFan.Services.RewardRetrievalService.getInstance().retrieve();
      return true;
    };

    return RewardObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.RouteObserver = (function(_super) {

    __extends(RouteObserver, _super);

    function RouteObserver() {
      this.routeDidChange = __bind(this.routeDidChange, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return RouteObserver.__super__.constructor.apply(this, arguments);
    }

    RouteObserver.prototype.currentPath = null;

    RouteObserver.prototype.bindEventHandlers = function() {
      RouteObserver.__super__.bindEventHandlers.apply(this, arguments);
      return Spine.Route.bind('change', this.routeDidChange);
    };

    RouteObserver.prototype.unbindEventHandlers = function() {
      RouteObserver.__super__.unbindEventHandlers.apply(this, arguments);
      return Spine.Route.unbind('change', this.routeDidChange);
    };

    RouteObserver.prototype.routeDidChange = function(route, path) {
      TopFan.SoftKeyboard.hide();
      this.log('Observed: routeDidChange');
      if (this.currentPath !== path) {
        this.currentPath = path;
        GoogleAnalytics.getInstance().trackPageView(this.currentPath);
      }
      SectionImageLoader.getInstance().waitForLoad();
      TopFan.AppMenu.getInstance().sectionWasChanged(path);
      return true;
    };

    return RouteObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Observers.UserTokenObserver = (function(_super) {

    __extends(UserTokenObserver, _super);

    function UserTokenObserver() {
      this.tokenWasRetrieved = __bind(this.tokenWasRetrieved, this);

      this.unbindEventHandlers = __bind(this.unbindEventHandlers, this);

      this.bindEventHandlers = __bind(this.bindEventHandlers, this);
      return UserTokenObserver.__super__.constructor.apply(this, arguments);
    }

    UserTokenObserver.prototype.bindEventHandlers = function() {
      return TopFan.Models.UserToken.bind('retrieve fetch', this.tokenWasRetrieved);
    };

    UserTokenObserver.prototype.unbindEventHandlers = function() {
      TopFan.Models.UserToken.unbind('retrieve', this.tokenWasRetrieved);
      return TopFan.Models.UserToken.unbind('fetch', this.tokenWasRetrieved);
    };

    UserTokenObserver.prototype.tokenWasRetrieved = function() {
      if (TopFan.AppState.getInstance().hasUserToken()) {
        this.log('Observed: userTokenWasRetrieved');
        TopFan.Services.AccountService.getInstance().fetch();
        TopFan.Services.ChallengeRetrievalService.getInstance().retrieve();
        TopFan.Services.ChallengeCompletionService.getInstance().retrieve();
      }
      return true;
    };

    return UserTokenObserver;

  })(Spine.Observer);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.RoutePanel = (function(_super) {

    __extends(RoutePanel, _super);

    RoutePanel.prototype.location = null;

    function RoutePanel(location) {
      if (location == null) {
        location = null;
      }
      RoutePanel.__super__.constructor.apply(this, arguments);
      this.location = location;
      if (this.location) {
        Spine.Route.add(this.location, this.proxy(this.active));
      }
    }

    return RoutePanel;

  })(Spine.Mobile.Panel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.BasePanel = (function(_super) {

    __extends(BasePanel, _super);

    BasePanel.prototype.bindable = null;

    function BasePanel(runNow) {
      if (runNow == null) {
        runNow = true;
      }
      this.clearMarkup = __bind(this.clearMarkup, this);

      this.unbindModelEvents = __bind(this.unbindModelEvents, this);

      this.deactivateBindables = __bind(this.deactivateBindables, this);

      this.dispose = __bind(this.dispose, this);

      this.deactivatePanel = __bind(this.deactivatePanel, this);

      this.bindModelEvents = __bind(this.bindModelEvents, this);

      this.activateBindables = __bind(this.activateBindables, this);

      this.render = __bind(this.render, this);

      BasePanel.__super__.constructor.apply(this, arguments);
      if (runNow) {
        this.bindLifecycleEvents();
      }
      this.buildDisabler();
    }

    BasePanel.prototype.bindLifecycleEvents = function() {
      this.bind('active', this.activatePanel);
      return this.bind('deactivated', this.deactivatePanel);
    };

    BasePanel.prototype.buildDisabler = function() {
      return this.disabler = Disabler.getInstance();
    };

    BasePanel.prototype.activatePanel = function(params) {
      var _this = this;
      this.disabler.disable('article.viewport');
      this.log("ACTIVATE: " + (this.location || window.location.hash));
      this.deactivateBindables();
      this.unbindModelEvents();
      this.render(params);
      this.trigger('afterRender');
      this.activateBindables();
      this.bindModelEvents();
      return setTimeout(function() {
        return _this.disabler.detach();
      }, 200);
    };

    BasePanel.prototype.render = function() {
      return this.html('Render Something Here!');
    };

    BasePanel.prototype.activateBindables = function() {
      this.bindable = new Bindable(this.el);
      return this.bindable.bindAll();
    };

    BasePanel.prototype.bindModelEvents = function() {
      return this.log('Binding model events');
    };

    BasePanel.prototype.deactivatePanel = function() {
      this.log("DEACTIVATE: " + (this.location || window.location.hash));
      this.dispose();
      this.deactivateBindables();
      this.unbindModelEvents();
      return this.clearMarkup();
    };

    BasePanel.prototype.dispose = function() {
      return this.log('Disposing base panel');
    };

    BasePanel.prototype.deactivateBindables = function() {
      if (this.bindable) {
        this.bindable.unbindAll();
        this.bindable = null;
        return delete this.bindable;
      }
    };

    BasePanel.prototype.unbindModelEvents = function() {
      return this.log('Unbinding model events');
    };

    BasePanel.prototype.clearMarkup = function() {
      return this.html('');
    };

    return BasePanel;

  })(TopFan.Panels.RoutePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.AccountPanel = (function(_super) {

    __extends(AccountPanel, _super);

    function AccountPanel() {
      this.updateFailure = __bind(this.updateFailure, this);

      this.updateSuccess = __bind(this.updateSuccess, this);

      this.update = __bind(this.update, this);

      this.dispose = __bind(this.dispose, this);

      this.submitForm = __bind(this.submitForm, this);

      this.render = __bind(this.render, this);
      return AccountPanel.__super__.constructor.apply(this, arguments);
    }

    AccountPanel.prototype.events = {
      'submit form': 'update',
      'tap #logout_button': 'logout',
      'click #update_button': 'cancelUpdateClick'
    };

    AccountPanel.prototype.elements = {
      'form': 'form',
      '#update_button': 'updateButton'
    };

    AccountPanel.prototype.render = function(params) {
      var _ref;
      this.account = TopFan.Services.AccountService.getInstance().currentAccount();
      this.html(JST['views/signup']({
        account: ((_ref = this.account) != null ? _ref.attributes() : void 0) || {},
        isUpdate: true
      }));
      return this.touchCallback = new ButtonTouchCallback(this.updateButton[0], this.submitForm);
    };

    AccountPanel.prototype.cancelUpdateClick = function(e) {
      return e.preventDefault();
    };

    AccountPanel.prototype.submitForm = function() {
      return this.form.submit();
    };

    AccountPanel.prototype.dispose = function() {
      var _ref;
      return (_ref = this.touchCallback) != null ? _ref.dispose() : void 0;
    };

    AccountPanel.prototype.update = function(e) {
      var params, _ref;
      e.preventDefault();
      e.stopPropagation();
      $('input, select').blur();
      params = TopFan.FormHelper.serializedArrayToHash($(e.target).serializeArray());
      params.date_of_birth = (_ref = moment(params.date_of_birth, ['YYYY-MM-DD', 'MM-DD-YYYY'])) != null ? _ref.format('YYYY-MM-DD') : void 0;
      this.account.load(params);
      return TopFan.Services.AccountService.getInstance().update(this.account, this.updateSuccess, this.updateFailure);
    };

    AccountPanel.prototype.updateSuccess = function(account) {
      history.go(-1);
      return TopFan.Notification.alert('Your account was updated!');
    };

    AccountPanel.prototype.updateFailure = function(xhr, type) {
      var message;
      if (xhr.responseText && xhr.responseText !== '') {
        message = JSON.parse(xhr.responseText)['message'];
      } else {
        message = 'Update failed.';
      }
      return TopFan.Notification.alert(message);
    };

    AccountPanel.prototype.logout = function(e) {
      e.preventDefault();
      TopFan.Models.UserToken.deleteAll();
      TopFan.Models.Account.trigger('logout');
      this.navigate(Constants.DASHBOARD_PATH);
      return TopFan.Notification.alert('You have been successfully logged out.');
    };

    return AccountPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.ApplicationStage = (function(_super) {

    __extends(ApplicationStage, _super);

    function ApplicationStage() {
      this.showContentHideLoader = __bind(this.showContentHideLoader, this);

      this.hideContentShowLoader = __bind(this.hideContentShowLoader, this);
      return ApplicationStage.__super__.constructor.apply(this, arguments);
    }

    ApplicationStage.prototype.hideContentShowLoader = function() {
      this.content.css('opacity', '0');
      return TopFan.Loader.getInstance().show();
    };

    ApplicationStage.prototype.showContentHideLoader = function() {
      this.content.css('opacity', '1');
      return TopFan.Loader.getInstance().hide();
    };

    return ApplicationStage;

  })(Spine.Mobile.Stage.Global);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel = (function(_super) {

    __extends(ChallengeDetailPanel, _super);

    function ChallengeDetailPanel() {
      this.afterValidation = __bind(this.afterValidation, this);

      this.challengeDidNotComplete = __bind(this.challengeDidNotComplete, this);

      this.challengeDidComplete = __bind(this.challengeDidComplete, this);

      this.unbindModelEvents = __bind(this.unbindModelEvents, this);

      this.bindModelEvents = __bind(this.bindModelEvents, this);

      this.hide = __bind(this.hide, this);

      this.show = __bind(this.show, this);

      this.updateItem = __bind(this.updateItem, this);
      return ChallengeDetailPanel.__super__.constructor.apply(this, arguments);
    }

    ChallengeDetailPanel.prototype.className = 'details challenges';

    ChallengeDetailPanel.prototype.elements = {
      '.scroll-container': 'scrollContainer',
      '.scroll-container .validate': 'completeChallengeBtn',
      '.return-btn .caret': 'returnCaret',
      '.return-btn .label': 'returnTitle'
    };

    ChallengeDetailPanel.prototype.events = {
      'tap .close': 'hide',
      'tap .validate': 'validateChallenge',
      'tap .item:not(.valid)': 'openStepPanel',
      'tap .finish-later': 'hide',
      'tap .return-btn': 'hide'
    };

    ChallengeDetailPanel.prototype.init = function() {
      TopFan.Models.ChallengeStep.bind('validation', this.updateItem);
      this.render();
      return this.bindModelEvents();
    };

    ChallengeDetailPanel.prototype.dispose = function() {
      this.currentChallenge = null;
      this.unbindModelEvents();
      this.scrollableContent.dispose();
      this.html('');
      return TopFan.Models.ChallengeStep.unbind('validation', this.updateItem);
    };

    ChallengeDetailPanel.prototype.updateItem = function(step) {
      return this.el.find("[data-id='" + step.id + "']").replaceWith(JST['views/shared/_challenge_step_list_item'](step));
    };

    ChallengeDetailPanel.prototype.render = function() {
      this.html(JST['views/challenge_detail_base']());
      return this.scrollableContent = new TopFan.ScrollableContent(this.scrollContainer);
    };

    ChallengeDetailPanel.prototype.showChallenge = function(challenge) {
      var _ref;
      this.scrollableContent.scrollToTop();
      this.currentChallenge = challenge;
      if ((_ref = this.stepDetail) == null) {
        this.stepDetail = new TopFan.Panels.ChallengeStepDetailPanel();
      }
      this.el.append(this.stepDetail.el);
      this.scrollContainer.html(JST['views/challenge_detail'](this.currentChallenge));
      this.setChallengeColors();
      return this.show();
    };

    ChallengeDetailPanel.prototype.showCompletion = function(challenge) {
      this.scrollableContent.scrollToTop();
      this.currentChallenge = challenge;
      this.scrollContainer.html(JST['views/completion_detail'](this.currentChallenge));
      this.setChallengeColors();
      return this.show();
    };

    ChallengeDetailPanel.prototype.setChallengeColors = function() {
      this.refreshElements();
      this.returnCaret.css('border-color', "transparent " + this.currentChallenge.background_color + " transparent transparent");
      return this.returnTitle.css('color', this.currentChallenge.background_color);
    };

    ChallengeDetailPanel.prototype.show = function() {
      return this.el.addClass('active');
    };

    ChallengeDetailPanel.prototype.hide = function(e) {
      if (e && $(e.target).closest('.details').get(0) !== this.el.get(0)) {
        return;
      }
      return this.el.removeClass('active');
    };

    ChallengeDetailPanel.prototype.openStepPanel = function(e) {
      var step, stepId,
        _this = this;
      stepId = $(e.target).closest('.item').data('id');
      step = TopFan.Models.ChallengeStep.find(stepId);
      return setTimeout(function() {
        return _this.stepDetail.show(step);
      }, 300);
    };

    ChallengeDetailPanel.prototype.bindModelEvents = function() {
      TopFan.Models.Challenge.bind('complete', this.challengeDidComplete);
      return TopFan.Models.Challenge.bind('completeError', this.challengeDidNotComplete);
    };

    ChallengeDetailPanel.prototype.unbindModelEvents = function() {
      TopFan.Models.Challenge.unbind('complete', this.challengeDidComplete);
      return TopFan.Models.Challenge.unbind('completeError', this.challengeDidNotComplete);
    };

    ChallengeDetailPanel.prototype.challengeDidComplete = function() {
      this.currentChallenge.clearStepValues();
      if (this.currentChallenge.is_instant_reward && this.currentChallenge.point_value) {
        TopFan.Notification.alert("Challenge Validated! Your account has been credited with " + (this.currentChallenge.point_value.withDelimiter()) + " points. You also qualified for an Instant Reward, instructions on how to redeem it can be found in the completed challenge details.", this.afterValidation, 'Success');
      } else if (this.currentChallenge.is_instant_reward) {
        TopFan.Notification.alert('You also qualified for an Instant Reward, instructions on how to redeem it can be found in the completed challenge details.', this.afterValidation, 'Success');
      } else {
        TopFan.Notification.alert("Challenge Validated! Your account has been credited with " + (this.currentChallenge.point_value.withDelimiter()) + " points.", this.afterValidation, 'Success');
      }
      return this.enableButtons();
    };

    ChallengeDetailPanel.prototype.challengeDidNotComplete = function(xhr, type) {
      var obj;
      obj = JSON.parse(xhr.responseText);
      this.updateStepStatus(obj.ids);
      TopFan.Notification.alert(obj.message);
      return this.enableButtons();
    };

    ChallengeDetailPanel.prototype.updateStepStatus = function(ids) {
      var step, _i, _len, _ref, _results;
      _ref = this.currentChallenge.challengeSteps();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        step = _ref[_i];
        if (ids.indexOf(step.id.toString()) >= 0) {
          step.setState('invalid');
        } else {
          step.setState('valid');
        }
        _results.push(this.updateItem(step));
      }
      return _results;
    };

    ChallengeDetailPanel.prototype.enableButtons = function() {
      return this.completeChallengeBtn.removeAttr('disabled');
    };

    ChallengeDetailPanel.prototype.afterValidation = function() {
      this.trigger('aftervalidation');
      return this.hide();
    };

    ChallengeDetailPanel.prototype.validateChallenge = function(e) {
      if (this.completeChallengeBtn.is(':disabled')) {
        return;
      }
      this.completeChallengeBtn.attr('disabled', 'disabled');
      e.preventDefault();
      if (!TopFan.AppState.getInstance().isOnline()) {
        TopFan.Notification.alert('Need Internet Connection to Validate Step Completion');
        return;
      }
      if (TopFan.Services.AccountService.getInstance().currentAccount()) {
        return TopFan.Services.ChallengeCompletionService.getInstance().completeChallenge(this.currentChallenge);
      } else {
        TopFan.Notification.alert('Please log in or create an account to complete this challenge');
        return this.navigate(Constants.LOGIN_PATH, {
          dontDisable: true
        });
      }
    };

    return ChallengeDetailPanel;

  })(Spine.Controller);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.Base = (function(_super) {

    __extends(Base, _super);

    function Base() {
      this.failure = __bind(this.failure, this);

      this.success = __bind(this.success, this);

      this.pending = __bind(this.pending, this);

      this.validateBtnWasTapped = __bind(this.validateBtnWasTapped, this);
      return Base.__super__.constructor.apply(this, arguments);
    }

    Base.prototype.className = 'challenge-step';

    Base.prototype.elements = {
      'button': 'formBtn'
    };

    Base.prototype.events = {
      'tap .inputs .btn': 'validateBtnWasTapped'
    };

    Base.prototype.init = function() {
      this.step.bind('validationSuccess', this.success);
      this.step.bind('validationFailure', this.failure);
      this.step.bind('validationPending', this.pending);
      this.render();
      return this.el.addClass(this.step.state());
    };

    Base.prototype.render = function() {
      return this.html(JST['views/challenge_detail_panels/use_code'](this.step));
    };

    Base.prototype.validateBtnWasTapped = function(e) {
      return this.validateStep();
    };

    Base.prototype.validateStep = function(proceed) {
      if (proceed == null) {
        proceed = true;
      }
      if (this.formBtn.is(':disabled')) {
        return;
      }
      this.disableBtn();
      this.storeValue();
      if (!proceed) {
        return;
      }
      if (TopFan.Services.AccountService.getInstance().currentAccount()) {
        return this.completeStep();
      } else {
        TopFan.Notification.alert('Please log in or create an account to complete this challenge');
        return this.navigate(Constants.LOGIN_PATH, {
          dontDisable: true
        });
      }
    };

    Base.prototype.disableBtn = function() {
      return this.formBtn.attr('disabled', 'disabled');
    };

    Base.prototype.enableBtn = function() {
      return this.formBtn.removeAttr('disabled');
    };

    Base.prototype.storeValue = function() {
      this.value = this.el.find('.inputs input').val();
      return this.step.attemptedCompletion().updateAttributes({
        value: this.value
      });
    };

    Base.prototype.completeStep = function() {
      return this.validate(this.value);
    };

    Base.prototype.validate = function(value) {
      return this.step.validateValue(value);
    };

    Base.prototype.pending = function() {
      this.render();
      this.enableBtn();
      this.el.addClass('pending');
      this.el.removeClass('invalid');
      this.el.removeClass('valid');
      return TopFan.Notification.alert('Need Internet Connection to Validate Step Completion');
    };

    Base.prototype.success = function() {
      this.render();
      this.enableBtn();
      this.el.removeClass('pending');
      this.el.removeClass('invalid');
      this.el.addClass('valid');
      return this.showSuccessAlert();
    };

    Base.prototype.showSuccessAlert = function() {
      return TopFan.Notification.alert('Your code was accepted!', null, 'Success');
    };

    Base.prototype.failure = function(step, xhr) {
      var message;
      this.render();
      this.enableBtn();
      this.el.removeClass('pending');
      this.el.addClass('invalid');
      this.el.removeClass('valid');
      if (xhr) {
        message = JSON.parse(xhr.responseText).message;
        return TopFan.Notification.alert("" + message + ".");
      }
    };

    Base.prototype.release = function() {
      Base.__super__.release.apply(this, arguments);
      this.step.unbind('validationSuccess', this.success);
      this.step.unbind('validationFailure', this.failure);
      return this.step.unbind('validationPending', this.pending);
    };

    return Base;

  })(Spine.Controller);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.FacebookLike = (function(_super) {

    __extends(FacebookLike, _super);

    function FacebookLike() {
      this.facebookDidLogin = __bind(this.facebookDidLogin, this);

      this.validateBtnWasTapped = __bind(this.validateBtnWasTapped, this);

      this.storeValue = __bind(this.storeValue, this);
      return FacebookLike.__super__.constructor.apply(this, arguments);
    }

    FacebookLike.prototype.className = 'challenge-step facebook_like';

    FacebookLike.prototype.render = function() {
      var $cta;
      this.html(JST['views/challenge_detail_panels/facebook_like'](this.step));
      $cta = this.el.find('.buttons.call-to-action .btn');
      $cta.removeClass('grey').addClass('facebook');
      return $cta.prepend('<div class="facebook-icon"></div>');
    };

    FacebookLike.prototype.storeValue = function() {
      this.log("Storing " + this.value);
      this.step.attemptedCompletion().updateAttributes({
        value: this.value
      });
      return this.log(this.step.attemptedCompletion());
    };

    FacebookLike.prototype.validateBtnWasTapped = function(e) {
      var _ref, _ref1;
      return (_ref = window.plugins) != null ? (_ref1 = _ref.facebookConnect) != null ? _ref1.login({
        scope: 'user_likes',
        appId: window.buildConfig.facebookAppId
      }, this.facebookDidLogin) : void 0 : void 0;
    };

    FacebookLike.prototype.showSuccessAlert = function() {
      return TopFan.Notification.alert('Validated successfully!', null, 'Success');
    };

    FacebookLike.prototype.facebookDidLogin = function(response) {
      var _ref;
      if ((_ref = response.accessToken) != null ? _ref.length : void 0) {
        this.value = response.accessToken;
        return this.validateStep();
      } else {
        return TopFan.Notification.alert("Facebook login failed. Please try again.", null, 'Failure');
      }
    };

    return FacebookLike;

  })(TopFan.Panels.ChallengeDetailPanel.Base);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.Geolocation = (function(_super) {

    __extends(Geolocation, _super);

    function Geolocation() {
      this.geolocationDidNotSucceed = __bind(this.geolocationDidNotSucceed, this);

      this.geolocationDidSucceed = __bind(this.geolocationDidSucceed, this);
      return Geolocation.__super__.constructor.apply(this, arguments);
    }

    Geolocation.prototype.className = 'challenge-step geolocation';

    Geolocation.prototype.setValue = function() {
      var position, _ref;
      position = (_ref = TopFan.Services.LocationService.getInstance().currentPosition()) != null ? _ref.coords : void 0;
      return this.value = position ? [position.latitude, position.longitude] : [null, null];
    };

    Geolocation.prototype.completeStep = function() {
      return navigator.geolocation.getCurrentPosition(this.geolocationDidSucceed, this.geolocationDidNotSucceed);
    };

    Geolocation.prototype.render = function() {
      return this.html(JST['views/challenge_detail_panels/geolocation'](this.step));
    };

    Geolocation.prototype.geolocationDidSucceed = function(position) {
      var _ref, _ref1;
      return this.validate([position != null ? (_ref = position.coords) != null ? _ref.latitude : void 0 : void 0, position != null ? (_ref1 = position.coords) != null ? _ref1.longitude : void 0 : void 0]);
    };

    Geolocation.prototype.geolocationDidNotSucceed = function(positionError) {
      return this.validate([null, null]);
    };

    Geolocation.prototype.showSuccessAlert = function() {
      return TopFan.Notification.alert('Check-in successful!', null, 'Success');
    };

    return Geolocation;

  })(TopFan.Panels.ChallengeDetailPanel.Base);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.MultipleUseCode = (function(_super) {

    __extends(MultipleUseCode, _super);

    function MultipleUseCode() {
      return MultipleUseCode.__super__.constructor.apply(this, arguments);
    }

    MultipleUseCode.prototype.className = 'challenge-step multiple-use-code code-entry';

    return MultipleUseCode;

  })(TopFan.Panels.ChallengeDetailPanel.Base);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.Scan = (function(_super) {

    __extends(Scan, _super);

    function Scan() {
      this.scanDidSucceed = __bind(this.scanDidSucceed, this);

      this.completeStep = __bind(this.completeStep, this);
      return Scan.__super__.constructor.apply(this, arguments);
    }

    Scan.prototype.className = 'challenge-step scan';

    Scan.prototype.render = function() {
      return this.html(JST['views/challenge_detail_panels/scan'](this.step));
    };

    Scan.prototype.completeStep = function() {
      return TopFan.PluginHelper.scanBarcode(this.scanDidSucceed, this.scanDidFail);
    };

    Scan.prototype.scanDidSucceed = function(result) {
      this.enableBtn();
      if (!result.cancelled) {
        return this.validate(result.text);
      }
    };

    Scan.prototype.scanDidFail = function(error) {
      this.enableBtn();
      return TopFan.Notification.alert("Scan failed. Please try again.", null, 'Failure');
    };

    Scan.prototype.showSuccessAlert = function() {
      this.enableBtn();
      return TopFan.Notification.alert('Scan was successful!', null, 'Success');
    };

    return Scan;

  })(TopFan.Panels.ChallengeDetailPanel.Base);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.SingleUseCode = (function(_super) {

    __extends(SingleUseCode, _super);

    function SingleUseCode() {
      return SingleUseCode.__super__.constructor.apply(this, arguments);
    }

    SingleUseCode.prototype.className = 'challenge-step single-use-code code-entry';

    return SingleUseCode;

  })(TopFan.Panels.ChallengeDetailPanel.Base);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeDetailPanel.TwitterFollow = (function(_super) {

    __extends(TwitterFollow, _super);

    function TwitterFollow() {
      return TwitterFollow.__super__.constructor.apply(this, arguments);
    }

    TwitterFollow.prototype.className = 'challenge-step twitter_follow';

    TwitterFollow.prototype.render = function() {
      return this.html(JST['views/challenge_detail_panels/twitter_follow'](this.step));
    };

    TwitterFollow.prototype.showSuccessAlert = function() {
      return TopFan.Notification.alert('Validated successfully!', null, 'Success');
    };

    return TwitterFollow;

  })(TopFan.Panels.ChallengeDetailPanel.Base);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengeStepDetailPanel = (function(_super) {

    __extends(ChallengeStepDetailPanel, _super);

    function ChallengeStepDetailPanel() {
      this.hide = __bind(this.hide, this);

      this.show = __bind(this.show, this);

      this.render = __bind(this.render, this);
      return ChallengeStepDetailPanel.__super__.constructor.apply(this, arguments);
    }

    ChallengeStepDetailPanel.prototype.className = 'details challenge-step';

    ChallengeStepDetailPanel.prototype.elements = {
      '.return-btn .caret': 'returnCaret',
      '.return-btn .label': 'returnTitle',
      '.step-deets .content': 'deets',
      '.step-scroll-container': 'scrollContainer'
    };

    ChallengeStepDetailPanel.prototype.events = {
      'tap .close, .return-btn': 'hide',
      'tap .link': 'openChallengeLink'
    };

    ChallengeStepDetailPanel.prototype.init = function() {
      return this.render();
    };

    ChallengeStepDetailPanel.prototype.dispose = function() {
      TopFan.SoftKeyboard.hide();
      this.scrollableContent.dispose();
      return this.html('');
    };

    ChallengeStepDetailPanel.prototype.render = function() {
      this.html(JST['views/challenge_step_detail']());
      return this.scrollableContent = new TopFan.ScrollableContent(this.scrollContainer);
    };

    ChallengeStepDetailPanel.prototype.show = function(step) {
      this.step = step;
      this.challenge = this.step.challenge();
      this.stepController = new TopFan.Panels.ChallengeDetailPanel[this.step.type]({
        step: this.step
      });
      this.step.bind('validationSuccess', this.hide);
      this.deets.html(this.stepController.el);
      this.refreshElements();
      this.returnCaret.css('border-color', "transparent " + this.challenge.background_color + " transparent transparent");
      this.returnTitle.css('color', this.challenge.background_color);
      return this.el.addClass('active');
    };

    ChallengeStepDetailPanel.prototype.hide = function(e) {
      TopFan.SoftKeyboard.hide();
      if (e && e.target && $(e.target).closest('.details').get(0) !== this.el.get(0)) {
        return;
      }
      this.step.unbind('validationSuccess', this.hide);
      if (this.step && this.step.attemptedCompletion().state === !'valid') {
        this.stepController.validateStep(false);
      }
      return this.el.removeClass('active');
    };

    ChallengeStepDetailPanel.prototype.openChallengeLink = function() {
      if (this.step && this.step.link) {
        return TopFan.ExternalLinkHelper.open(this.step.link, this.step.open_externally_on_ios, this.step.open_externally_on_android, this.step.use_restricted_internal_browser);
      }
    };

    return ChallengeStepDetailPanel;

  })(Spine.Controller);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ChallengesPanel = (function(_super) {

    __extends(ChallengesPanel, _super);

    function ChallengesPanel() {
      this.showCompletionList = __bind(this.showCompletionList, this);

      this.showChallengeList = __bind(this.showChallengeList, this);

      this.showCompletionDetail = __bind(this.showCompletionDetail, this);

      this.showChallengeDetail = __bind(this.showChallengeDetail, this);

      this.render = __bind(this.render, this);

      this.triggerActive = __bind(this.triggerActive, this);

      this.retrieveData = __bind(this.retrieveData, this);
      return ChallengesPanel.__super__.constructor.apply(this, arguments);
    }

    ChallengesPanel.prototype.events = {
      'tap #available_challenges_button': 'showChallengeList',
      'tap #earned_challenges_button': 'showCompletionList',
      'tap .challenges-tab>.item': 'showChallengeDetail',
      'tap .completions-tab>.item': 'showCompletionDetail'
    };

    ChallengesPanel.prototype.elements = {
      '#available_challenges_button': 'available_challenges_button',
      '#earned_challenges_button': 'earned_challenges_button'
    };

    ChallengesPanel.prototype.init = function() {
      return this.routes({
        '/challenges': function(params) {
          this.currentChallenges = null;
          this.currentCompletions = null;
          this.active();
          return this.retrieveData();
        }
      });
    };

    ChallengesPanel.prototype.retrieveData = function() {
      if (TopFan.AppState.getInstance().hasClientToken()) {
        TopFan.Services.LocationService.getInstance().updateCurrentLocation();
        TopFan.Services.ChallengeRetrievalService.getInstance().retrieve();
      }
      if (TopFan.AppState.getInstance().hasUserToken()) {
        return TopFan.Services.ChallengeCompletionService.getInstance().retrieve();
      }
    };

    ChallengesPanel.prototype.bindModelEvents = function() {
      TopFan.Models.Challenge.bind('refresh change', this.triggerActive);
      return TopFan.Models.Completion.bind('refresh change', this.triggerActive);
    };

    ChallengesPanel.prototype.unbindModelEvents = function() {
      TopFan.Models.Challenge.unbind('refresh', this.triggerActive);
      TopFan.Models.Challenge.unbind('change', this.triggerActive);
      TopFan.Models.Completion.unbind('refresh', this.triggerActive);
      return TopFan.Models.Completion.unbind('change', this.triggerActive);
    };

    ChallengesPanel.prototype.triggerActive = function() {
      return this.trigger('active');
    };

    ChallengesPanel.prototype.render = function() {
      var challenges, completions, _ref;
      if (TopFan.Services.ChallengeRetrievalService.getInstance().hasSynced) {
        challenges = TopFan.Models.Challenge.inOrder();
        completions = TopFan.Models.Completion.inOrder();
        if ($.os.ios && (JSON.stringify(challenges) === JSON.stringify(this.currentChallenges)) && (JSON.stringify(completions) === JSON.stringify(this.currentCompletions))) {
          return;
        }
        this.html(JST['views/challenges']({
          challenges: challenges,
          completions: completions
        }));
        if ((_ref = this.detailPanel) == null) {
          this.detailPanel = new TopFan.Panels.ChallengeDetailPanel;
        }
        this.detailPanel.unbind('aftervalidation', this.retrieveData);
        this.detailPanel.bind('aftervalidation', this.retrieveData);
        this.el.append(this.detailPanel.el);
        this.currentChallenges = challenges;
        return this.currentCompletions = completions;
      }
    };

    ChallengesPanel.prototype.showChallengeDetail = function(e) {
      var challenge, challengeId, _ref;
      challengeId = $(e.target).closest('.item').data('id');
      challenge = TopFan.Models.Challenge.find(challengeId);
      if (this.appSupportsChallenge(challenge)) {
        return (_ref = this.detailPanel) != null ? _ref.showChallenge(challenge) : void 0;
      }
    };

    ChallengesPanel.prototype.showCompletionDetail = function(e) {
      var completion, completionId, _ref;
      completionId = $(e.target).closest('.item').data('id');
      completion = TopFan.Models.Completion.find(completionId);
      return (_ref = this.detailPanel) != null ? _ref.showCompletion(completion) : void 0;
    };

    ChallengesPanel.prototype.showChallengeList = function(e) {
      var _ref;
      if ((_ref = this.detailPanel) != null) {
        _ref.hide();
      }
      this.available_challenges_button.addClass('active');
      this.earned_challenges_button.removeClass('active');
      this.el.find('.challenges-tab').show();
      return this.el.find('.completions-tab').hide();
    };

    ChallengesPanel.prototype.showCompletionList = function(e) {
      var _ref;
      if ((_ref = this.detail) != null) {
        _ref.hide();
      }
      this.available_challenges_button.removeClass('active');
      this.earned_challenges_button.addClass('active');
      this.el.find('.challenges-tab').hide();
      return this.el.find('.completions-tab').show();
    };

    ChallengesPanel.prototype.dispose = function() {
      var _ref, _ref1;
      if ((_ref = this.detailPanel) != null) {
        _ref.unbind('aftervalidation', this.retrieveData);
      }
      if ((_ref1 = this.detailPanel) != null) {
        _ref1.dispose();
      }
      this.detailPanel = null;
      delete this.detailPanel;
      this.currentChallenges = null;
      return this.currentCompletions = null;
    };

    ChallengesPanel.prototype.appSupportsChallenge = function(challenge) {
      var step, _i, _len, _ref;
      _ref = challenge.challengeSteps();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        step = _ref[_i];
        if (typeof TopFan.Panels.ChallengeDetailPanel[step.type] === 'undefined') {
          TopFan.Notification.alert('You need to install the latest version of the app in order to complete this challenge.', null, 'Update Required');
          return false;
        }
      }
      return true;
    };

    return ChallengesPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.PromoImageBasePanel = (function(_super) {

    __extends(PromoImageBasePanel, _super);

    function PromoImageBasePanel() {
      this.resetPromoImageHeight = __bind(this.resetPromoImageHeight, this);
      PromoImageBasePanel.__super__.constructor.apply(this, arguments);
      this.bind('afterRender', this.resetPromoImageHeight);
      if (window.buildConfig.platform === 'web') {
        $(window).on('resize', this.resetPromoImageHeight);
      }
    }

    PromoImageBasePanel.prototype.resetPromoImageHeight = function() {
      var _this = this;
      return setTimeout(function() {
        var contentScroller, promoHolder, promoImageHeight, scrollerHeight;
        contentScroller = _this.el.children('.scroll-outer');
        if (!(contentScroller.length > 0)) {
          contentScroller = _this.el.children('.native-scroll');
        }
        promoHolder = _this.el.find('.promo-image');
        promoImageHeight = Math.floor($(window).width() * .54);
        scrollerHeight = promoImageHeight + 50;
        promoHolder.css('height', promoImageHeight);
        return contentScroller.css({
          top: scrollerHeight,
          height: window.innerHeight - scrollerHeight
        });
      }, 20);
    };

    PromoImageBasePanel.prototype.dispose = function() {
      PromoImageBasePanel.__super__.dispose.apply(this, arguments);
      return $(window).off('resize');
    };

    return PromoImageBasePanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ContentSectionPanel = (function(_super) {

    __extends(ContentSectionPanel, _super);

    ContentSectionPanel.prototype.events = {
      'tap .content-entries>.item': 'handleTap'
    };

    function ContentSectionPanel(key, section) {
      this.render = __bind(this.render, this);
      this.location = key;
      this.section = section;
      ContentSectionPanel.__super__.constructor.apply(this, arguments);
    }

    ContentSectionPanel.prototype.render = function() {
      return this.html(JST['views/content_section'](this.section));
    };

    ContentSectionPanel.prototype.handleTap = function(e) {
      var el, link;
      el = $(e.target).closest('.item');
      link = el.data('link');
      GoogleAnalytics.getInstance().trackEvent('Content Section', 'Entry Click', el.find('.title').text(), link);
      return TopFan.ExternalLinkHelper.open(link, el.data('open-externally-ios') === 'yes', el.data('open-externally-android') === 'yes', el.data('use-restricted-browser') === 'yes');
    };

    return ContentSectionPanel;

  })(TopFan.Panels.PromoImageBasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.MapBasePanel = (function(_super) {

    __extends(MapBasePanel, _super);

    function MapBasePanel() {
      this.toggleMap = __bind(this.toggleMap, this);

      this.targetIsSwipeable = __bind(this.targetIsSwipeable, this);

      this.swipeUp = __bind(this.swipeUp, this);

      this.swipeDown = __bind(this.swipeDown, this);

      this.setupSwipeable = __bind(this.setupSwipeable, this);

      this.showEntryDetail = __bind(this.showEntryDetail, this);

      this.showMarkerDetail = __bind(this.showMarkerDetail, this);

      this.setupPanel = __bind(this.setupPanel, this);

      this.geolocationSuccess = __bind(this.geolocationSuccess, this);
      MapBasePanel.__super__.constructor.apply(this, arguments);
      this.calculateValues();
    }

    MapBasePanel.prototype.render = function() {
      TopFan.Services.LocationService.getInstance().bind('locationSuccess', this.geolocationSuccess);
      this.calculateValues();
      return this.setupPanel();
    };

    MapBasePanel.prototype.calculateValues = function() {
      this.mapContainerHeight = Math.floor($(window).width() * .57);
      this.scrollerHeight = $(window).height() - this.mapContainerHeight;
      return this.enlargedHeight = Math.floor($(window).height());
    };

    MapBasePanel.prototype.geolocationSuccess = function() {
      return console.log('geolocationSuccess');
    };

    MapBasePanel.prototype.setupPanel = function() {
      this.mapPlaceholder = $('.map-placeholder');
      if (this.mapPlaceholder.length === 1) {
        this.mapView = TopFan.MapView.getInstance();
        this.mapView.watchPosition();
        if (this.mapView.isEnlarged) {
          this.mapView.enlarge(this.enlargedHeight);
        }
        this.mapView.addMapToEl(this.mapPlaceholder);
        this.mapView.el.on('showdetail', this.showMarkerDetail);
        this.mapView.el.on('markersremoved', this.mapDidInitialize);
        this.setupSwipeable();
        return this.mapDidInitialize();
      } else {
        this.mapImage = $('.map-image');
        return this.mapImage.css({
          height: this.mapContainerHeight
        });
      }
    };

    MapBasePanel.prototype.showMarkerDetail = function(e, entry) {
      return this.showEntryDetail(entry);
    };

    MapBasePanel.prototype.showEntryDetail = function(entry) {
      return this.navigate(Constants.ENTRY_PATH, entry.id);
    };

    MapBasePanel.prototype.mapDidInitialize = function() {
      return console.log('Add markers and such from this');
    };

    MapBasePanel.prototype.setupSwipeable = function() {
      this.swipeable = $('.swipeable');
      if (this.swipeable.length === 0) {
        return typeof console !== "undefined" && console !== null ? console.error('Must have a ".swipeable" element in order to enlarge the map.') : void 0;
      }
      this.swipeable.on('swipeDown', this.swipeDown);
      this.swipeable.on('swipeUp', this.swipeUp);
      return this.swipeable.on('tap', this.toggleMap);
    };

    MapBasePanel.prototype.swipeDown = function(e) {
      var _ref;
      if (e != null) {
        e.preventDefault();
      }
      return (_ref = this.mapView) != null ? _ref.enlarge(this.enlargedHeight) : void 0;
    };

    MapBasePanel.prototype.swipeUp = function(e) {
      var _ref;
      if (e != null) {
        e.preventDefault();
      }
      return (_ref = this.mapView) != null ? _ref.shrink() : void 0;
    };

    MapBasePanel.prototype.targetIsSwipeable = function(e) {
      return this.swipeable.length && $(e.target).hasClass('swipeable');
    };

    MapBasePanel.prototype.toggleMap = function(e) {
      e.preventDefault();
      if (!this.targetIsSwipeable(e)) {
        return;
      }
      if (this.mapView.el.height() === this.mapContainerHeight) {
        return this.swipeDown();
      } else {
        return this.swipeUp();
      }
    };

    MapBasePanel.prototype.dispose = function() {
      var _ref, _ref1, _ref2, _ref3;
      TopFan.Services.LocationService.getInstance().unbind('locationSuccess', this.geolocationSuccess);
      if ((_ref = this.swipeable) != null) {
        _ref.off('swipeDown');
      }
      if ((_ref1 = this.swipeable) != null) {
        _ref1.off('swipeUp');
      }
      if ((_ref2 = this.swipeable) != null) {
        _ref2.off('tap');
      }
      if (this.el.find('.map-content').length === 1) {
        if ((_ref3 = this.mapView) != null) {
          _ref3.reset();
        }
      }
      return MapBasePanel.__super__.dispose.apply(this, arguments);
    };

    return MapBasePanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.EntryDetailPanel = (function(_super) {

    __extends(EntryDetailPanel, _super);

    function EntryDetailPanel() {
      this.targetIsSwipeable = __bind(this.targetIsSwipeable, this);

      this.geocoderDidFinish = __bind(this.geocoderDidFinish, this);

      this.updateDistances = __bind(this.updateDistances, this);

      this.geolocationSuccess = __bind(this.geolocationSuccess, this);

      this.render = __bind(this.render, this);
      return EntryDetailPanel.__super__.constructor.apply(this, arguments);
    }

    EntryDetailPanel.prototype.elements = {
      '.entryActions': 'entryActions',
      '.js-favorite': 'favoriteButton',
      '.js-unfavorite': 'unfavoriteButton',
      '.entry--distance': 'distance',
      '.js-redirect-Topfan' :'redirectButton' 
    };

    EntryDetailPanel.prototype.events = {
      'tap .js-favorite': 'favoriteEntry',
      'tap .js-unfavorite': 'unfavoriteEntry',
      'tap .js-share': 'shareEntry',
      'tap .js-geolocation': 'geolocateEntry',
      'tap .js-driving-directions': 'getDrivingDirections',
      'tap .js-redirect-Topfan': 'redirectToTopfan'
    };

    EntryDetailPanel.prototype.init = function() {
      var _ref;
      if (TopFan.AppState.getInstance().isOnline() && ((typeof google !== "undefined" && google !== null ? (_ref = google.maps) != null ? _ref.Geocoder : void 0 : void 0) != null)) {
        return this.geocoder = new google.maps.Geocoder();
      }
    };

    EntryDetailPanel.prototype.render = function(params) {
      this.entry = TopFan.Models.ListSectionEntry.find(params.id);
      this.html(JST['views/entry_detail']({
        entry: this.entry,
        scrollerHeight: this.scrollerHeight
      }));
      this.toggleFavoriteButton();
      var user_name=this.entry.username;
      if((user_name==undefined)||(user_name==null) || (user_name =="") || (user_name.length==0) ) {
        $('.js-redirect-Topfan').addClass('hidden');
      }else {
        $('.js-redirect-Topfan').removeClass('hidden');
      }
      EntryDetailPanel.__super__.render.apply(this, arguments);
      return TopFan.ExternalLinkHelper.captureLinks(this.el);
    };

    EntryDetailPanel.prototype.calculateValues = function() {
      EntryDetailPanel.__super__.calculateValues.apply(this, arguments);
      this.scrollerHeight -= 76;
      if (this.entryActions.length > 0) {
        return this.enlargedHeight = Math.floor($(window).height() - $($('.entryContent--text')[0]).position().top);
      }
    };

    EntryDetailPanel.prototype.mapDidInitialize = function() {
      var _ref;
      return (_ref = this.mapView) != null ? _ref.addMarkersForEntries([this.entry]) : void 0;
    };

    EntryDetailPanel.prototype.geolocationSuccess = function() {
      return this.distance.html(this.entry.distanceDescriptionD(true));
    };

    EntryDetailPanel.prototype.updateDistances = function() {
      var entry, entryItem, _i, _len, _ref, _results;
      _ref = this.section.list_section_entries().all();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        entryItem = this.listEntries.find(".js-item[data-id='" + entry.id + "'] .js-distance");
        _results.push(entryItem.html(entry.distanceDescriptionD()));
      }
      return _results;
    };

    EntryDetailPanel.prototype.toggleFavoriteButton = function() {
      try{
        TopFan.Models.Favorite.fetch();
        TopFan.Models.Favorite.all();
      }catch(e){
        console.log('error hai', JSON.stringify(e))
      }

      if (TopFan.Models.Favorite.exists(this.entry.id)) {
        this.favoriteButton.addClass('hidden');
        return this.unfavoriteButton.removeClass('hidden');
      } else {
        this.unfavoriteButton.addClass('hidden');
        return this.favoriteButton.removeClass('hidden');
      }
    };

    EntryDetailPanel.prototype.favoriteEntry = function(e) {
      this.entry.addToFavorites();
      return this.toggleFavoriteButton();
    };

    EntryDetailPanel.prototype.unfavoriteEntry = function(e) {
      this.entry.removeFromFavorites();
      return this.toggleFavoriteButton();
    };
     EntryDetailPanel.prototype.redirectToTopfan = function(e) {
      
      //navigator.notification.alert("Comming Soon");
      // GoogleAnalytics.getInstance().bridge.redirectToTopfanPlugin(this.entry.username);
      GoogleAnalyticsPlugin.prototype.redirectToTopfanPlugin(this.entry.username); 
    };

    EntryDetailPanel.prototype.shareEntry = function(e) {
      return console.log('share entry', this.entry.name);
    };

    EntryDetailPanel.prototype.geolocateEntry = function(e) {
      return console.log('geolocate entry', this.entry.name);
    };

    EntryDetailPanel.prototype.getDrivingDirections = function(e) {
      return this.geocoder.geocode({
        location: new google.maps.LatLng(this.entry.latitude, this.entry.longitude)
      }, this.geocoderDidFinish);
    };

    EntryDetailPanel.prototype.geocoderDidFinish = function(results, status) {
      var destAddr, link;
      if (status === 'OK') {
        destAddr = escape(results[0].formatted_address);
      } else {
        destAddr = escape("" + this.entry.latitude + "," + this.entry.longitude);
      }
      link = "http://maps.google.com/maps?t=m&saddr=&daddr=" + destAddr;
      return TopFan.ExternalLinkHelper.open(link);
    };

    EntryDetailPanel.prototype.showEntryDetail = function() {};

    EntryDetailPanel.prototype.targetIsSwipeable = function(e) {
      return this.swipeable.length && _(this.swipeable).indexOf($(e.target).closest('.swipeable')[0]) > -1;
    };

    EntryDetailPanel.prototype.dispose = function() {
      this.entry = null;
      TopFan.ExternalLinkHelper.releaseLinks(this.el);
      return EntryDetailPanel.__super__.dispose.apply(this, arguments);
    };

    return EntryDetailPanel;

  })(TopFan.Panels.MapBasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.FilterDetailPanel = (function(_super) {

    __extends(FilterDetailPanel, _super);

    function FilterDetailPanel() {
      this.toggle = __bind(this.toggle, this);

      this.hide = __bind(this.hide, this);

      this.show = __bind(this.show, this);

      this.activateFilter = __bind(this.activateFilter, this);

      this.deactivateFilters = __bind(this.deactivateFilters, this);

      this.itemWasTapped = __bind(this.itemWasTapped, this);
      return FilterDetailPanel.__super__.constructor.apply(this, arguments);
    }

    FilterDetailPanel.prototype.className = 'details filter';

    FilterDetailPanel.prototype.elements = {
      '.deets': 'deets'
    };

    FilterDetailPanel.prototype.events = {
      'tap .close': 'hide',
      'tap .return-btn': 'hide'
    };

    FilterDetailPanel.prototype.init = function(listItems, options) {
      this.listItems = listItems;
      this.options = options;
      return this.render();
    };

    FilterDetailPanel.prototype.dispose = function() {
      var binding, _i, _len, _ref, _results;
      this.scrollableContent.dispose();
      this.deactivateFilters();
      this.itemButtonEventBindings || (this.itemButtonEventBindings = []);
      _ref = this.itemButtonEventBindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.dispose());
      }
      return _results;
    };

    FilterDetailPanel.prototype.render = function() {
      var el;
      this.html(JST['views/filter_detail']({
        items: this.listItems,
        title: this.options.listTitle,
        backTitle: this.options.backTitle
      }));
      $($('.content ul li .item', this.el)[0]).addClass('active');
      this.scrollableContent = new TopFan.ScrollableContent(this.deets);
      return this.itemButtonEventBindings = (function() {
        var _i, _len, _ref, _results;
        _ref = $('li .item', this.el);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          el = _ref[_i];
          _results.push(new ButtonTouchCallback(el, this.itemWasTapped, 'active-press'));
        }
        return _results;
      }).call(this);
    };

    FilterDetailPanel.prototype.itemWasTapped = function(el) {
      var filter;
      filter = $(el).closest('[data-filter]').data('filter');
      this.deactivateFilters();
      this.activateFilter(filter);
      this.trigger('filter', filter);
      return this.hide();
    };

    FilterDetailPanel.prototype.deactivateFilters = function() {
      return this.el.find('[data-filter]').removeClass('active');
    };

    FilterDetailPanel.prototype.activateFilter = function(filter) {
      var selectorStr;
      this.deactivateFilters();
      selectorStr = "[data-filter='" + filter + "']";
      return $(selectorStr).addClass('active');
    };

    FilterDetailPanel.prototype.show = function() {
      return this.el.addClass('active');
    };

    FilterDetailPanel.prototype.hide = function() {
      return this.el.removeClass('active');
    };

    FilterDetailPanel.prototype.toggle = function() {
      if (this.el.hasClass('active')) {
        return this.hide();
      } else {
        return this.show();
      }
    };

    return FilterDetailPanel;

  })(Spine.Controller);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.HelpInfoPanel = (function(_super) {

    __extends(HelpInfoPanel, _super);

    function HelpInfoPanel() {
      this.render = __bind(this.render, this);
      return HelpInfoPanel.__super__.constructor.apply(this, arguments);
    }

    HelpInfoPanel.prototype.events = {
      'tap .help-info>.item': 'goToUrl'
    };

    HelpInfoPanel.prototype.render = function() {
      return this.html(JST['views/help_info']());
    };

    HelpInfoPanel.prototype.goToUrl = function(e) {
      var url;
      url = $(e.target).closest('.item').data('link');
      if (url && url.indexOf('mailto:') > -1) {
        return TopFan.PluginHelper.showEmailComposer("" + (TopFan.Models.Client.currentClient().name) + " TopFan App Feedback", '', 'customer.support@top-fan.com');
      } else if (url) {
        return TopFan.ExternalLinkHelper.open(url);
      }
    };

    return HelpInfoPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.IconGridPanel = (function(_super) {

    __extends(IconGridPanel, _super);

    IconGridPanel.prototype.className = 'icon-grid';

    IconGridPanel.prototype.elements = {
      '.grid-list_sections': 'listSections',
      '.banner-client_name': 'clientName'
    };

    function IconGridPanel() {
      this.dispose = __bind(this.dispose, this);

      this.deactivatePanel = __bind(this.deactivatePanel, this);

      this.renderAdditionalIcons = __bind(this.renderAdditionalIcons, this);

      this.adjustClientName = __bind(this.adjustClientName, this);

      this.bindModelEvents = __bind(this.bindModelEvents, this);

      this.activatePanel = __bind(this.activatePanel, this);
      this.currentClient = null;
      this.calculateValues();
      IconGridPanel.__super__.constructor.apply(this, arguments);
    }

    IconGridPanel.prototype.activatePanel = function() {
      var sections;
      this.currentClient = TopFan.Models.Client.currentClient();
      sections = JSON.stringify(TopFan.Models.ListSection.inOrder());
      if (!this.currentClient || sections === this.currentSections) {
        return;
      }
      this.deactivateBindables();
      this.html(JST['views/icon_grid']({
        client: this.currentClient,
        scrollerHeight: this.scrollerHeight,
        promoHeight: this.promoHeight,
        scrollerTop: this.scrollerTop
      }));
      this.activateBindables();
      this.adjustClientName();
      if (this.namePop) {
        this.namePop.dispose();
        this.namePop = null;
      }
      this.namePop = new TopFan.NamePopup(this.el);
      return this.currentSections = sections;
    };

    IconGridPanel.prototype.bindModelEvents = function() {
      return TopFan.Models.Client.bind('create refresh update', this.render);
    };

    IconGridPanel.prototype.adjustClientName = function() {
      var breakIndex, breakWords, index, word, words, _i, _len, _ref;
      if (((_ref = this.currentClient.name) != null ? _ref.length : void 0) > 15) {
        this.clientName.addClass('long');
        words = this.currentClient.name.split(' ');
        breakIndex = Math.floor(words.length / 2);
        if (breakIndex === 0) {
          return;
        }
        breakWords = '';
        for (index = _i = 0, _len = words.length; _i < _len; index = ++_i) {
          word = words[index];
          switch (index) {
            case breakIndex - 1:
              breakWords += word + '\n';
              break;
            case words.length - 1:
              breakWords += word;
              break;
            default:
              breakWords += word + ' ';
          }
        }
        return this.clientName.html(breakWords);
      }
    };

    IconGridPanel.prototype.renderAdditionalIcons = function() {
      var additionalIcons, colorIndex, iconHeight, listHeight, numRows, numSections, remainder;
      if (!this.currentClient.color_palette) {
        return;
      }
      numSections = this.currentClient.list_sections().all().length;
      numRows = Math.ceil(numSections / 4);
      iconHeight = $('.icon').height();
      listHeight = numRows * iconHeight;
      remainder = numRows * 4 - numSections;
      colorIndex = numSections % this.currentClient.color_palette.length;
      if (remainder > 0) {
        colorIndex = this.addAdditionalIcons(remainder, colorIndex);
      }
      if (listHeight < this.scrollerHeight) {
        additionalIcons = (Math.ceil((this.scrollerHeight - listHeight) / iconHeight)) * 4;
        return this.addAdditionalIcons(additionalIcons, colorIndex);
      }
    };

    IconGridPanel.prototype.addAdditionalIcons = function(additionalIcons, colorIndex) {
      var div, index;
      index = 0;
      while (index < additionalIcons) {
        div = $('<div class="icon">');
        div.css({
          backgroundColor: this.currentClient.color_palette[colorIndex]
        });
        this.listSections.append(div);
        if (colorIndex === this.currentClient.color_palette.length - 1) {
          colorIndex = 0;
        } else {
          colorIndex++;
        }
        index++;
      }
      return colorIndex;
    };

    IconGridPanel.prototype.calculateValues = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient.promo_image_size === "SMALLER") {
        this.promoHeight = Math.floor($(window).width() * .57);
      } else {
        this.promoHeight = Math.floor($(window).width() * .77);
      }
      this.scrollerTop = this.promoHeight + 85;
      return this.scrollerHeight = $(window).height() - this.scrollerTop;
    };

    IconGridPanel.prototype.deactivatePanel = function() {};

    IconGridPanel.prototype.dispose = function() {};

    return IconGridPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.ListSectionPanel = (function(_super) {

    __extends(ListSectionPanel, _super);

    ListSectionPanel.MAX_LIST_ITEMS = 100;

    ListSectionPanel.MAX_DATE_LIST_ITEMS = 50;

    ListSectionPanel.prototype.elements = {
      '.distance-filter': 'distanceFilter',
      '.list-entries': 'listEntries',
      '.filter-results .amt': 'resultsAmt',
      '.filter-results .label': 'resultsLabel',
      '.js-offers-filter': 'offersFilter',
      '.featured-entries': 'featuredEntries',
      '.scroll-content': 'scrollContent'
    };

    ListSectionPanel.prototype.events = {
      'tap .js-offers-filter': 'filterByOffers',
      'tap .js-page-up': 'pageUpList',
      'swipeDown .js-page-up': 'pageUpList',
      'tap .js-page-down': 'pageDownList',
      'swipeUp .js-page-down': 'pageDownList',
      'tap .js-item': 'showItemDetail'
    };

    function ListSectionPanel(key, section) {
      this.sectionIsSortedByDate = __bind(this.sectionIsSortedByDate, this);

      this.dispose = __bind(this.dispose, this);

      this.showItemDetail = __bind(this.showItemDetail, this);

      this.findEntryItemById = __bind(this.findEntryItemById, this);

      this.updateDistances = __bind(this.updateDistances, this);

      this.geolocationSuccess = __bind(this.geolocationSuccess, this);

      this.filterByOffers = __bind(this.filterByOffers, this);

      this.filterByFeature = __bind(this.filterByFeature, this);

      this.filterByCategory = __bind(this.filterByCategory, this);

      this.filterByDistance = __bind(this.filterByDistance, this);

      this.forceShowFeaturedEntries = __bind(this.forceShowFeaturedEntries, this);

      this.addEntriesToMap = __bind(this.addEntriesToMap, this);

      this.getBufferForDateEntries = __bind(this.getBufferForDateEntries, this);

      this.getCurrentEntriesFromLabels = __bind(this.getCurrentEntriesFromLabels, this);

      this.createDateSortData = __bind(this.createDateSortData, this);

      this.getBufferForEntries = __bind(this.getBufferForEntries, this);

      this.forceShowScrollContent = __bind(this.forceShowScrollContent, this);

      this.pageDownList = __bind(this.pageDownList, this);

      this.pageUpList = __bind(this.pageUpList, this);

      this.addPageButtons = __bind(this.addPageButtons, this);

      this.setViewableEntries = __bind(this.setViewableEntries, this);

      this.render = __bind(this.render, this);
      this.location = key;
      this.section = section;
      if (this.section) {
        this.sectionObj = {
          name: this.section.name,
          color: this.section.color,
          icon: this.section.icon,
          default_sort: this.section.default_sort,
          subcat_filter_label: this.section.subcat_filter_label,
          subcat_filter_icon_url: this.section.subcat_filter_icon_url,
          feature_filter_label: this.section.feature_filter_label,
          feature_filter_icon_url: this.section.feature_filter_icon_url,
          icon_path: this.section.icon_path
        };
      } else {
        this.sectionObj = {
          name: 'Favorites',
          color: '#43C7F4',
          icon: 'vm_heart',
          default_sort: TopFan.Managers.EntryManager.DEFAULT_SORT_DISTANCE,
          icon_path: 'assets/visitmobile/icon_heart@2x.png'
        };
        if (TopFan.AppState.getInstance().isOnline()) {
          this.sectionObj.subcat_filter_label = localStorage.getItem('subcat_filter_label');
          this.sectionObj.subcat_filter_icon_url = localStorage.getItem('subcat_filter_icon_url');
          this.sectionObj.feature_filter_label = localStorage.getItem('feature_filter_label');
          this.sectionObj.feature_filter_icon_url = localStorage.getItem('feature_filter_icon_url');
        } else {
          this.sectionObj.subcat_filter_label = 'Subcategories';
          this.sectionObj.subcat_filter_icon_url = 'assets/visitmobile/icon_filter@2x.png';
          this.sectionObj.feature_filter_label = 'Features';
          this.sectionObj.feature_filter_icon_url = 'assets/visitmobile/icon_features@2x.png';
        }
      }
      this.itemButtonEventBindings = [];
      this.entryManager = new TopFan.Managers.EntryManager(this.sectionObj.default_sort);
      ListSectionPanel.__super__.constructor.apply(this, arguments);
    }

    ListSectionPanel.prototype.render = function() {
      var _base;
      if (this.section) {
        this.entryManager.setEntries(typeof (_base = this.section).activeListSectionEntries === "function" ? _base.activeListSectionEntries() : void 0);
      } else {
        TopFan.Models.Favorite.fetch();
        
        var list = TopFan.Models.Favorite.all();
        var filter_id = localStorage.getItem('filter_id');
        if(filter_id == 0) {
          favoriteEnteries = list.filter(function(entry) {
            return entry.list_section_id == localStorage.getItem('list_id');
          });
        } else {
          favoriteEnteries = list.filter(function(entry) {
            return entry.list_section_id == localStorage.getItem('list_id') && entry.retailer_type_ids.indexOf(filter_id) >= 0;
          });
        } 
        var section_ids = localStorage.getItem('section_ids');
        var section_ids_split = section_ids.split(',');
        favoriteEnteries = list.filter(function(entry) {
            console.log(entry.id);
            return section_ids_split.indexOf(entry.id) >= 0;
          });
        this.entryManager.setEntries(favoriteEnteries);
      }
      this.html(JST['views/list_section']({
        entryManager: this.entryManager,
        sectionObj: this.sectionObj,
        scrollerHeight: this.scrollerHeight
      }));
      
      this.setEntries(this.entryManager.sortEntries());
      this.setupFiltering();
      // var data_id = localStorage.getItem('data_id');
      // if(data_id!='') {
      //   entry = TopFan.Models.ListSectionEntry.find(data_id);
      //     this.showEntryDetail(entry);
      // }
      return ListSectionPanel.__super__.render.apply(this, arguments);
    };

    ListSectionPanel.prototype.calculateValues = function() {
      ListSectionPanel.__super__.calculateValues.apply(this, arguments);
      this.scrollerHeight -= 50;
      return this.enlargedHeight = Math.floor($(window).height() - 50);
    };

    ListSectionPanel.prototype.mapDidInitialize = function() {
      var _ref;
      if ((_ref = this.mapView) != null) {
        _ref.addMarkersForEntries(this.currentEntries, this.sectionObj.color);
      }
      this.geolocationSuccess();
      return this.mapViewInitialized = true;
    };

    ListSectionPanel.prototype.setEntries = function(entries) {
      var mToday;
      this.startPointer = 0;
      this.entries = entries;
      if (this.sectionIsSortedByDate()) {
        mToday = moment().hours(0).minutes(0).seconds(0).milliseconds(0);
        this.entries = _(entries).filter(function(entry) {
          return entry.start_date && entry.end_date && moment(entry.end_date) >= mToday;
        });
      }
      if (this.entries.length === 0) {
        this.listEntries.html(JST['views/shared/_no_list_results']({
          message: "No " + this.sectionObj.name + " Found"
        }));
        return this.setResultsLabel(this.entries.length);
      } else {
        this.scrollContent[0].scrollTop = 0;
        if (this.sectionIsSortedByDate()) {
          this.createDateSortData();
        }
        this.setViewableEntries();
        this.setResultsLabel(this.entries.length);
        return this.forceShowFeaturedEntries();
      }
    };

    ListSectionPanel.prototype.setViewableEntries = function() {
      if (this.sectionIsSortedByDate()) {
        this.endPointer = this.startPointer + this.constructor.MAX_DATE_LIST_ITEMS;
        if (this.endPointer > this.dateLabels.length) {
          this.endPointer = this.dateLabels.length;
        }
        this.currentLabels = this.dateLabels.slice(this.startPointer, this.endPointer);
        this.currentEntries = this.getCurrentEntriesFromLabels(this.currentLabels);
        this.listEntries.html(this.getBufferForDateEntries(this.currentLabels));
      } else {
        this.endPointer = this.startPointer + this.constructor.MAX_LIST_ITEMS;
        if (this.endPointer > this.entries.length) {
          this.endPointer = this.entries.length;
        }
        this.currentEntries = this.entries.slice(this.startPointer, this.endPointer);
        this.listEntries.html(this.getBufferForEntries(this.currentEntries));
      }
      this.addPageButtons();
      return this.addEntriesToMap(this.currentEntries);
    };

    ListSectionPanel.prototype.addPageButtons = function() {
      var isLastPage, numPages;
      this.scrollContent.find('.list-page-btn').remove();
      if (this.sectionObj.default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        numPages = Math.ceil(this.dateLabels.length / this.constructor.MAX_DATE_LIST_ITEMS);
        isLastPage = this.startPointer / this.constructor.MAX_DATE_LIST_ITEMS + 1 === numPages;
      } else {
        numPages = Math.ceil(this.entries.length / this.constructor.MAX_LIST_ITEMS);
        isLastPage = this.startPointer / this.constructor.MAX_LIST_ITEMS + 1 === numPages;
      }
      if (numPages > 1) {
        if (this.startPointer === 0) {
          return this.scrollContent.append(JST['views/shared/_list_page_down']());
        } else if (isLastPage) {
          return this.scrollContent.prepend(JST['views/shared/_list_page_up']());
        } else {
          this.scrollContent.prepend(JST['views/shared/_list_page_up']());
          return this.scrollContent.append(JST['views/shared/_list_page_down']());
        }
      }
    };

    ListSectionPanel.prototype.pageUpList = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.sectionObj.default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        this.startPointer -= this.constructor.MAX_DATE_LIST_ITEMS;
      } else {
        this.startPointer -= this.constructor.MAX_LIST_ITEMS;
      }
      if (this.startPointer < 0) {
        this.startPointer = 0;
      }
      this.setViewableEntries();
      if (this.startPointer === 0) {
        this.scrollContent[0].scrollTop = 0;
      } else {
        this.scrollContent[0].scrollTop = 35;
      }
      return this.forceShowScrollContent();
    };

    ListSectionPanel.prototype.pageDownList = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.sectionObj.default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE) {
        this.startPointer += this.constructor.MAX_DATE_LIST_ITEMS;
      } else {
        this.startPointer += this.constructor.MAX_LIST_ITEMS;
      }
      this.setViewableEntries();
      this.scrollContent[0].scrollTop = 35;
      return this.forceShowScrollContent();
    };

    ListSectionPanel.prototype.forceShowScrollContent = function() {
      this.scrollContent.css({
        display: 'inline-block'
      });
      this.scrollContent[0].offsetHeight;
      return this.scrollContent.css({
        display: 'block'
      });
    };

    ListSectionPanel.prototype.getBufferForEntries = function(entries) {
      var buffer, color, entry, prevEntry, _i, _len;
      buffer = '';
      prevEntry = null;
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        entry = entries[_i];
        if (this.sectionObj.name === 'Favorites') {
          color = entry.color;
        }
        if (prevEntry && prevEntry.is_member !== entry.is_member) {
          buffer += [
            JST['views/shared/_list_entry_divider']({
              title: 'Other Listings'
            })
          ];
        }
        buffer += JST['views/shared/_list_entry_item']({
          entry: entry,
          color: color
        });
        prevEntry = entry;
      }
      return buffer;
    };

    ListSectionPanel.prototype.createDateSortData = function() {
      var entry, lookupDate, mEnd, mNow, mStart, mToday, _i, _len, _ref, _results;
      this.dateObj = {};
      this.dateLabels = [];
      this.dateEntryObj = {};
      mToday = moment().hours(0).minutes(0).seconds(0).milliseconds(0);
      _ref = this.entries;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        mStart = moment(entry.start_date);
        mEnd = moment(entry.end_date);
        mNow = mStart >= mToday ? mStart : moment(mToday);
        _results.push((function() {
          var _results1;
          _results1 = [];
          while (mNow <= mEnd) {
            lookupDate = mNow.format(Constants.LONG_DATE);
            if (this.dateLabels.indexOf(lookupDate) === -1) {
              this.dateLabels.push(lookupDate);
            }
            if (!this.dateObj[lookupDate]) {
              this.dateObj[lookupDate] = [
                JST['views/shared/_list_entry_divider']({
                  title: lookupDate
                })
              ];
            }
            this.dateObj[lookupDate].push(JST['views/shared/_list_entry_item']({
              entry: entry
            }));
            if (!this.dateEntryObj[lookupDate]) {
              this.dateEntryObj[lookupDate] = [];
            }
            this.dateEntryObj[lookupDate].push(entry);
            _results1.push(mNow.add('days', 1));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    ListSectionPanel.prototype.getCurrentEntriesFromLabels = function(labels) {
      var entries, entry, label, _i, _j, _len, _len1, _ref;
      entries = [];
      for (_i = 0, _len = labels.length; _i < _len; _i++) {
        label = labels[_i];
        _ref = this.dateEntryObj[label];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          entry = _ref[_j];
          entries.push(entry);
        }
      }
      return _(entries).uniq();
    };

    ListSectionPanel.prototype.getBufferForDateEntries = function(labels) {
      var buffer, element, label, _i, _j, _len, _len1, _ref;
      buffer = '';
      for (_i = 0, _len = labels.length; _i < _len; _i++) {
        label = labels[_i];
        _ref = this.dateObj[label];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          element = _ref[_j];
          buffer += element;
        }
      }
      return buffer;
    };

    ListSectionPanel.prototype.setResultsLabel = function(amt) {
      var label;
      label = amt === 1 ? 'result' : 'results';
      this.resultsAmt.html(amt.withDelimiter());
      return this.resultsLabel.html(label);
    };

    ListSectionPanel.prototype.addEntriesToMap = function(entries) {
      if (this.mapViewInitialized) {
        return this.mapView.addMarkersForEntries(entries, this.sectionObj.color);
      }
    };

    ListSectionPanel.prototype.forceShowFeaturedEntries = function() {
      if (this.featuredEntries.length > 0) {
        this.featuredEntries.css({
          display: 'inline-block'
        });
        this.featuredEntries[0].offsetHeight;
        return this.featuredEntries.css({
          display: 'block'
        });
      }
    };

    ListSectionPanel.prototype.setupFiltering = function() {
      if (this.entryManager.categoriesForFilter().length > 0) {
        this.categoryFilter = new TopFan.FilterDrop($('.js-category-filter'));
        this.categoryFilter.el.on('filter', this.filterByCategory);
      }
      if (this.entryManager.featuresForFilter().length > 0) {
        this.featureFilter = new TopFan.FilterDrop($('.js-feature-filter'));
        this.featureFilter.el.on('filter', this.filterByFeature);
      }
      this.currentCategory = null;
      this.currentRange = null;
      this.currentFeature = null;
      return this.onlyShowOffers = false;
    };

    ListSectionPanel.prototype.filterByDistance = function(e, value) {
      this.currentRange = value;
      return this.setEntries(this.entryManager.applyFilters(this.currentRange, this.currentCategory, this.currentFeature, this.onlyShowOffers));
    };

    ListSectionPanel.prototype.filterByCategory = function(e, value) {
      $('.feature-filter .drop-item').css('background-color','transparent');
      $('.feature-filter .drop-item').removeClass('active');
      this.currentCategory = value;
      $('.featured-entries').show();
      $(".featured-entry").show();
      var show = 0;
      $(".featured-entry:not([data-subcategories*='"+value+"'])").hide();
      $(".featured-entry").each(function(e,v) {
          if($(v).css('display')=="none") {
             show++;
          }
      });
      var len = $(".featured-entry").length
      if(value =="all" || value =="any") {
        $(".featured-entry").show();
        show = 0;
      }
      var wid = (len-show)*150+12;
      $('.featured-scroller').css({'width':wid+'px'});
      if(show == len) {
        setTimeout(function(){
          $('.featured-entries').hide();
        }, 0);
      }
      return this.setEntries(this.entryManager.applyFilters(this.currentRange, this.currentCategory, this.currentFeature, this.onlyShowOffers));
    };

    ListSectionPanel.prototype.filterByFeature = function(e, value) {
      $('.category-filter .drop-item').css('background-color','transparent');
      $('.category-filter .drop-item').removeClass('active');
      this.currentFeature = value;
      $('.featured-entries').show();
      $(".featured-entry").show();
      var show = 0;
      $(".featured-entry:not([data-features*='"+value+"'])").hide();
      $(".featured-entry").each(function(e,v) {
          if($(v).css('display')=="none") {
             show++;
          }
      });
      var len = $(".featured-entry").length
      if(value =="all" || value =="any") {
        $(".featured-entry").show();
        show = 0;
      }
      var wid = (len-show)*150+12;
      $('.featured-scroller').css({'width':wid+'px'});
      if(show == len) {
        setTimeout(function(){
          $('.featured-entries').hide();
        }, 0);
      }
      return this.setEntries(this.entryManager.applyFilters(this.currentRange, this.currentCategory, this.currentFeature, this.onlyShowOffers));
    };

    ListSectionPanel.prototype.filterByOffers = function(e) {

      if (!this.offersFilter.css('backgroundColor')) {
        value = 1;
        $('.feature-filter .drop-item').css('background-color','transparent');
        $('.feature-filter .drop-item').removeClass('active');
        $('.category-filter .drop-item').css('background-color','transparent');
        $('.category-filter .drop-item').removeClass('active');
        
        $('.featured-entries').show();
        $(".featured-entry").show();
        var show = 0;
        $(".featured-entry:not([data-offers*='"+value+"'])").hide();
        $(".featured-entry").each(function(e,v) {
            if($(v).css('display')=="none") {
               show++;
            }
        });
        var len = $(".featured-entry").length
        if(value =="all" || value =="any") {
          $(".featured-entry").show();
          show = 0;
        }
        var wid = (len-show)*150+12;
        $('.featured-scroller').css({'width':wid+'px'});
        if(show == len) {
          setTimeout(function(){
            $('.featured-entries').hide();
          }, 0);
        }
      } else {
        $('.featured-entries').show();
        $(".featured-entry").show();
        var len = $(".featured-entry").length
        var wid = (len)*150+12;
        $('.featured-scroller').css({'width':wid+'px'});
      }

      if (!this.offersFilter.css('backgroundColor')) {
        this.offersFilter.css({
          backgroundColor: this.sectionObj.color.toRGBA(.2)
        });
        this.onlyShowOffers = true;
        return this.setEntries(this.entryManager.applyFilters(this.currentRange, this.currentCategory, this.currentFeature, this.onlyShowOffers));
      } else {
        this.offersFilter.css({
          backgroundColor: null
        });
        this.onlyShowOffers = false;
        return this.setEntries(this.entryManager.applyFilters(this.currentRange, this.currentCategory, this.currentFeature, this.onlyShowOffers));
      }
    };

    ListSectionPanel.prototype.geolocationSuccess = function() {
      return this.updateDistances();
      if (this.entryManager.default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DISTANCE && !this.initiallySorted) {
        this.setEntries(this.entryManager.sortEntries(this.entries));
        return this.initiallySorted = true;
      } else if (this.sectionObj.default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE && !this.initiallySorted) {
        this.createDateSortData();
        return this.initiallySorted = true;
      } else {
        return this.updateDistances();
      }
    };

    ListSectionPanel.prototype.updateDistances = function() {
      var entry, entryItem, _i, _len, _ref, _results;
      _ref = this.entryManager.entries;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        entryItem = this.findEntryItemById(entry.id).find(".js-distance");
        _results.push(entryItem.html(entry.distanceDescription()));
      }
      return _results;
    };

    ListSectionPanel.prototype.findEntryItemById = function(id) {
      return this.listEntries.find(".js-item[data-id='" + id + "']");
    };

    ListSectionPanel.prototype.showItemDetail = function(e) {
      var entry, id;
      e.preventDefault();
      e.stopPropagation();
      id = $(e.target).closest('.js-item').data('id');
      entry = TopFan.Models.ListSectionEntry.find(id);
      return this.showEntryDetail(entry);
    };

    ListSectionPanel.prototype.dispose = function() {
      this.entries = [];
      this.dateLabels = [];
      this.currentLabels = [];
      this.currentEntries = [];
      this.dateObj = null;
      this.dateEntryObj = null;
      return ListSectionPanel.__super__.dispose.apply(this, arguments);
    };

    ListSectionPanel.prototype.sectionIsSortedByDate = function() {
      return this.sectionObj.default_sort === TopFan.Managers.EntryManager.DEFAULT_SORT_DATE;
    };

    return ListSectionPanel;

  })(TopFan.Panels.MapBasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.LoginPanel = (function(_super) {

    __extends(LoginPanel, _super);

    function LoginPanel() {
      this.signup = __bind(this.signup, this);

      this.loginDidError = __bind(this.loginDidError, this);

      this.loginDidSucceed = __bind(this.loginDidSucceed, this);

      this.login = __bind(this.login, this);

      this.render = __bind(this.render, this);
      return LoginPanel.__super__.constructor.apply(this, arguments);
    }

    LoginPanel.prototype.events = {
      'tap #signup_button': 'signup',
      'submit form#login': 'login'
    };

    LoginPanel.prototype.elements = {
      '#login_button': 'loginButton'
    };

    LoginPanel.prototype.bindModelEvents = function() {
      TopFan.Models.Account.bind('login', this.loginDidSucceed);
      return TopFan.Models.UserToken.bind('retrieveError', this.loginDidError);
    };

    LoginPanel.prototype.unbindModelEvents = function() {
      TopFan.Models.Account.unbind('login', this.loginDidSucceed);
      return TopFan.Models.UserToken.unbind('retrieveError', this.loginDidError);
    };

    LoginPanel.prototype.render = function(params) {
      this.html(JST['views/login']());
      return TopFan.ExternalLinkHelper.captureLinks(this.el);
    };

    LoginPanel.prototype.login = function(e) {
      var params;
      e.preventDefault();
      e.stopPropagation();
      this.loginButton.attr('disabled', 'disabled');
      $('input, select').blur();
      params = TopFan.FormHelper.serializedArrayToHash($(e.target).serializeArray());
      return TopFan.Services.UserTokenService.getInstance().retrieve(params.email, params.password);
    };

    LoginPanel.prototype.loginDidSucceed = function() {
      this.loginButton.removeAttr('disabled');
      history.go(-1);
      return TopFan.Notification.alert('You have logged in successfully!', null, 'Login Success');
    };

    LoginPanel.prototype.loginDidError = function() {
      this.loginButton.removeAttr('disabled');
      return TopFan.Notification.alert('Unable to log you in. Please check your email and password.', null, 'Login Failed');
    };

    LoginPanel.prototype.signup = function(e) {
      var _this = this;
      e.preventDefault();
      return setTimeout(function() {
        return _this.navigate(Constants.SIGNUP_PATH, {
          trans: 'left'
        });
      }, 200);
    };

    LoginPanel.prototype.dispose = function(e) {
      return TopFan.ExternalLinkHelper.releaseLinks(this.el);
    };

    return LoginPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.MarkdownPanel = (function(_super) {

    __extends(MarkdownPanel, _super);

    MarkdownPanel.prototype.elements = {
      '.content-area': 'contentArea'
    };

    function MarkdownPanel(key, section, isListSection) {
      this.key = key;
      this.section = section;
      this.isListSection = isListSection;
      this.renderedContent = __bind(this.renderedContent, this);

      this.calculateValues = __bind(this.calculateValues, this);

      this.render = __bind(this.render, this);

      MarkdownPanel.__super__.constructor.apply(this, arguments);
    }

    MarkdownPanel.prototype.render = function() {
      this.calculateValues();
      this.html(JST['views/markdown']({
        scrollerTop: this.scrollerTop,
        scrollerHeight: this.scrollerHeight,
        content: this.renderedContent(),
        isListSection: this.isListSection,
        icon: this.section.icon,
        primary_text: this.section.primary_text
      }));
      return TopFan.ExternalLinkHelper.captureLinks(this.el, this.scrollerHeight);
    };

    MarkdownPanel.prototype.calculateValues = function() {
      this.scrollerTop = this.isListSection ? 58 : 108;
      return this.scrollerHeight = $(window).height() - this.scrollerTop;
    };

    MarkdownPanel.prototype.renderedContent = function() {
      return TopFan.MarkdownParser.getInstance().parseMarkdown(this.section.internal_content);
    };

    MarkdownPanel.prototype.dispose = function() {
      return TopFan.ExternalLinkHelper.releaseLinks(this.el);
    };

    return MarkdownPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.MobileConciergePanel = (function(_super) {

    __extends(MobileConciergePanel, _super);

    function MobileConciergePanel() {
      this.dispose = __bind(this.dispose, this);

      this.makeRecommendations = __bind(this.makeRecommendations, this);

      this.nextAction = __bind(this.nextAction, this);

      this.renderQuestion = __bind(this.renderQuestion, this);

      this.clientDidChange = __bind(this.clientDidChange, this);

      this.unbindModelEvents = __bind(this.unbindModelEvents, this);

      this.bindModelEvents = __bind(this.bindModelEvents, this);

      this.render = __bind(this.render, this);
      return MobileConciergePanel.__super__.constructor.apply(this, arguments);
    }

    MobileConciergePanel.prototype.elements = {
      '.concierge-interview-questions': 'interviewQuestions'
    };

    MobileConciergePanel.prototype.events = {
      'tap .next-action': 'nextAction'
    };

    MobileConciergePanel.prototype.render = function() {
      this.html(JST['views/mobile_concierge']());
      return this.clientDidChange();
    };

    MobileConciergePanel.prototype.bindModelEvents = function() {
      return TopFan.Models.Client.bind('change', this.clientDidChange);
    };

    MobileConciergePanel.prototype.unbindModelEvents = function() {
      return TopFan.Models.Client.unbind('change', this.clientDidChange);
    };

    MobileConciergePanel.prototype.clientDidChange = function() {
      if (!TopFan.Models.Client.isMobileConciergeAvailable()) {
        return;
      }
      this.answers = [];
      this.questions = TopFan.Models.Client.currentClient().interview_questions;
      return this.renderQuestion(0);
    };

    MobileConciergePanel.prototype.renderQuestion = function(index) {
      this.index = index;
      return this.interviewQuestions.html(JST['views/shared/_interview_question']({
        questions: this.questions,
        index: this.index
      }));
    };

    MobileConciergePanel.prototype.nextAction = function(e) {
      this.answers.push($(e.target).siblings('.answers').find('select').val());
      if (++this.index < this.questions.length) {
        return this.renderQuestion(this.index);
      } else {
        return this.makeRecommendations();
      }
    };

    MobileConciergePanel.prototype.makeRecommendations = function() {
      return this.navigate(Constants.MOBILE_CONCIERGE_RESULTS_PATH, this.answers.join(','));
    };

    MobileConciergePanel.prototype.dispose = function() {
      this.answers = [];
      return this.questions = [];
    };

    return MobileConciergePanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.MobileConciergeResultsPanel = (function(_super) {

    __extends(MobileConciergeResultsPanel, _super);

    MobileConciergeResultsPanel.prototype.elements = {
      '.swipe-holder': 'swipeHolder',
      '.swipe-directions': 'swipeDirections'
    };

    MobileConciergeResultsPanel.prototype.events = {
      'tap .js-restart-concierge': 'restartConcierge',
      'tap .js-item': 'showItemDetail'
    };

    function MobileConciergeResultsPanel() {
      this.showItemDetail = __bind(this.showItemDetail, this);

      this.restartConcierge = __bind(this.restartConcierge, this);

      this.updateContent = __bind(this.updateContent, this);

      this.setEntries = __bind(this.setEntries, this);

      this.findEntryItemById = __bind(this.findEntryItemById, this);

      this.updateDistances = __bind(this.updateDistances, this);

      this.geolocationSuccess = __bind(this.geolocationSuccess, this);

      this.render = __bind(this.render, this);
      this.entryManager = new TopFan.Managers.EntryManager(TopFan.Managers.EntryManager.DEFAULT_SORT_DISTANCE);
      MobileConciergeResultsPanel.__super__.constructor.apply(this, arguments);
    }

    MobileConciergeResultsPanel.prototype.render = function(params) {
      var entries;
      entries = TopFan.Models.ListSectionEntry.findByAnswerIds(params.ids.split(','));
      this.entryManager.setEntries(entries);
      this.html(JST['views/mobile_concierge_results']({
        scrollerHeight: this.scrollerHeight
      }));
      this.setEntries();
      return MobileConciergeResultsPanel.__super__.render.apply(this, arguments);
    };

    MobileConciergeResultsPanel.prototype.calculateValues = function() {
      MobileConciergeResultsPanel.__super__.calculateValues.apply(this, arguments);
      this.scrollerHeight -= 42;
      return this.enlargedHeight = Math.floor($(window).height() - 42);
    };

    MobileConciergeResultsPanel.prototype.mapDidInitialize = function() {
      var _ref;
      return (_ref = this.mapView) != null ? _ref.addMarkersForEntries(this.entryManager.entries, '#43C7F4') : void 0;
    };

    MobileConciergeResultsPanel.prototype.geolocationSuccess = function() {
      return this.updateDistances();
    };

    MobileConciergeResultsPanel.prototype.updateDistances = function() {
      var entry, entryItem, _i, _len, _ref, _results;
      _ref = this.entryManager.entries;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        entryItem = this.findEntryItemById(entry.id).find(".js-distance");
        _results.push(entryItem.html(entry.distanceDescription(true)));
      }
      return _results;
    };

    MobileConciergeResultsPanel.prototype.findEntryItemById = function(id) {
      return this.swipeHolder.find(".js-item[data-id='" + id + "']");
    };

    MobileConciergeResultsPanel.prototype.setEntries = function() {
      if (this.entryManager.entries.length === 0) {
        this.swipeHolder.css({
          height: '2rem'
        });
        this.swipeHolder.html(JST['views/shared/_no_list_results']({
          message: 'No Recommendations Found'
        }));
        return this.swipeDirections.removeClass('showing');
      } else {
        this.swipeHolder.css({
          height: '11.25rem'
        });
        this.swipeView = new SwipeView(this.swipeHolder, this.entryManager.entries, this.updateContent);
        return this.swipeDirections.addClass('showing');
      }
    };

    MobileConciergeResultsPanel.prototype.updateContent = function(entry) {
      return JST['views/shared/_slide_view']({
        entry: entry
      });
    };

    MobileConciergeResultsPanel.prototype.restartConcierge = function() {
      return this.navigate(Constants.MOBILE_CONCIERGE_PATH);
    };

    MobileConciergeResultsPanel.prototype.showItemDetail = function(e) {
      var entry, id;
      e.preventDefault();
      e.stopPropagation();
      id = $(e.target).closest('.js-item').data('id');
      entry = TopFan.Models.ListSectionEntry.find(id);
      return this.showEntryDetail(entry);
    };

    return MobileConciergeResultsPanel;

  })(TopFan.Panels.MapBasePanel);

}).call(this);

var cp = cp || {};

// Audio player - uses soundManager2 ----------------------------------------------------------
cp.CachePlayer = function( element, audioFile, autoPlay ) {
  var _smSound = null,
      _controls = null;

  var init = function() {
    // initialize audio player with callbacks --------------
    var _smId = "tune";
    _smSound = soundManager.createSound({
      id: _smId,
      url: audioFile,
      volume: 100,
      autoPlay: false,
      useWaveformData: false,
      whileloading: function() { loadProgress( this.bytesLoaded, this.bytesTotal ); },
      whileplaying: function() { playProgress( this.position, this.duration ); },
      onfinish: function(){}
    });
    if( autoPlay ) _smSound.play();
  };

  var loadProgress = function( bytesLoaded, bytesTotal ) {
    var percent = ( bytesLoaded && bytesTotal ) ? bytesLoaded / bytesTotal : 0;
    _controls.setLoadedPercent( percent );
  };

  var playProgress = function( position, duration ) {
    // var percent = position / duration;
    _controls.setCurTime( position );
    _controls.setTotalTime( duration );
  };

  // create controls -------------------------------------
  var controlsDelegate = {
    seekTo: function( milliseconds ) {
      _smSound.setPosition( milliseconds );
      _smSound.play();
    },
    pause: function() {
      _smSound.pause();
    },
    play: function() {
      _smSound.play();

    },
    close: function() {
      dispose();
    }
  };
  _controls = new cp.CachePlayerConrols( element, controlsDelegate );
  if( autoPlay ) _controls.setPlaying();

  // initialize ----------
  init();

  // public interface -------------------------------------

  var dispose = function() {
    _smSound.destruct();
  };

  return {
    dispose: dispose
  };
};

// Player controls - audio library independent -------------------------------------------------
cp.CachePlayerConrols = function( element, delegate ) {

  var _timeCur = 0,
      _timeTotal = 0,
      _timeTouch = 0,
      _playPercent = 0,
      _loadedPercent = 0,
      _playing = false,

      _delegate = delegate,

      _container = element,
      _loadedEl = _container.querySelector(".cp-loaded"),
      _progressEl = _container.querySelector(".cp-progress"),
      _playheadEl = _container.querySelector(".cp-playhead"),
      _timeCurEl = _container.querySelector(".cp-time-cur"),
      _timeTotalEl = _container.querySelector(".cp-time-total"),
      _closeEl = _container.querySelector(".cp-close"),
      _playEl = _container.querySelector(".cp-play"),

      _width = 0,
      _height = 0;

  // track player size -------------------------------------------------------
  var calculatePlayerDimensions = function() {
    _width = _container.offsetWidth;
    _height = _container.offsetHeight;
  };

  // window.addEventListener( 'resize', calculatePlayerDimensions, false );
  calculatePlayerDimensions();

  // touch event responders --------------------------------------------------
  var lockTouchScreen = function( isLocked ) {
    if( isLocked == false ) {
      document.ontouchmove = null;
    } else {
      document.ontouchmove = function( event ) {
        event.preventDefault();
      };
    }
  };


  var onStart = function( touchEvent ) {
    lockTouchScreen(true);
    if( _touchTracker.touch_is_inside == true ) _container.classList.add('touching');
    calculateTouchTime();
    setCurTime( _timeTouch );
    _delegate.pause( _timeTouch );
  };

  var onMove = function( touchEvent ) {
    calculateTouchTime();
    setCurTime( _timeTouch );
  };

  var onEnd = function( touchEvent ) {
    lockTouchScreen(false);
    _container.classList.remove('touching');
    calculateTouchTime();
    setCurTime( _timeTouch );
    _delegate.seekTo( _timeTouch );
  };

  var onEnter = function( touchEvent ) {
    _container.classList.add('hovering');
  };

  var onLeave = function( touchEvent ) {
    _container.classList.remove('hovering');
  };

  var calculateTouchTime = function() {
    _playPercent = constrain( _touchTracker.touchcurrent.x / _width, 0, 1 );
    if( _playPercent > _loadedPercent ) _playPercent = _loadedPercent;
    _timeTouch = _playPercent * _timeTotal;
  }

  // initialize mouse/touch tracking for the player --------------------------
  var touchUpdated = function( state, touchEvent ) {
    if( !_playing ) return;
    switch( state ) {
      case utensils.MouseAndTouchTracker.state_start :
        onStart(touchEvent);
        break;
      case utensils.MouseAndTouchTracker.state_move :
        onMove(touchEvent);
        break;
      case utensils.MouseAndTouchTracker.state_end :
        onEnd(touchEvent);
        break;
      case utensils.MouseAndTouchTracker.state_enter :
        onEnter(touchEvent);
        break;
      case utensils.MouseAndTouchTracker.state_leave :
        onLeave(touchEvent);
        break;
    }
    utensils.CursorHand.setCursorFromTouchTrackerState( _touchTracker, _cursor, state );
  };

  var _cursor = new utensils.CursorHand(); // ( element )
  var _touchTracker = new utensils.MouseAndTouchTracker( element, touchUpdated, false, 'div img' );

  // initialize close button -------
  if( _closeEl ) {
    _closeEl.addEventListener('click', function(){
      _delegate.close();
      dispose();
      _container.parentNode.removeChild(_container);
    });
  }

  // initialize play button -------
  if( _playEl ) {
    _playEl.addEventListener('click', function(){
      _playing = true;
      _delegate.play();
      onEnter();
    });
  }


  // helper methods -----------------------------------------------------------
  var formatTime = function( milliseconds ) {
     var secs = Math.floor(milliseconds/1000);
     var mins = Math.floor(secs/60);
     secs %= 60;
     var secsStr = secs + '';
     var minsStr = mins + '';
     if ( secs < 10 ) secsStr = "0"+secs;
     if ( mins < 10)  minsStr = "0"+mins;
     // don't return if NaN
     if( minsStr == 'NaN' || secsStr == 'NaN' ) {
       return( '' );
     } else {
       return( minsStr + ":" + secsStr );
     }
  };

  var constrain = function( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  // public interface ---------------------------------------------------------
  var setLoadedPercent = function( percent ) {
    _loadedPercent = percent;
    _loadedEl.style.width = ( _loadedPercent * 100 ) + '%';
    if( _touchTracker.is_touching == true ) onMove();
  };

  var setCurTime = function( milliseconds ) {
    if( _touchTracker.is_touching ) milliseconds = _timeTouch;
    else _playPercent = constrain( milliseconds / _timeTotal, 0, 1 );
    _timeCur = milliseconds;
    _timeCurEl.innerHTML = formatTime( milliseconds );
    _playheadEl.style.left = utensils.CSSHelper.roundForCSS( _playPercent * 100 ) + '%';
    _progressEl.style.width = utensils.CSSHelper.roundForCSS( _playPercent * 100 ) + '%';
  };

  var setTotalTime = function( milliseconds ) {
    // take into account the loaded percentage when calculating the track's total time
    _timeTotal = Math.ceil( milliseconds / _loadedPercent );
    _timeTotalEl.innerHTML = formatTime( _timeTotal );
  };

  var setPlaying = function() {
    _playing = true;
  }

  var setBuffering = function( isBuffering ) {
    if( isBuffering ) {
      _container.classList.add('buffering');
      $('.music-player').addClass('buffering');
      $('.track-buffering .spinner').addClass('rotating');
    } else {
      _container.classList.remove('buffering');
      $('.music-player').removeClass('buffering');
      $('.track-buffering .spinner').removeClass('rotating');
    }
  };

  var dispose = function() {
    window.removeEventListener( 'resize', calculatePlayerDimensions );
    _touchTracker.dispose();
  };

  return {
    setLoadedPercent: setLoadedPercent,
    setTotalTime: setTotalTime,
    setCurTime: setCurTime,
    setPlaying: setPlaying,
    setBuffering: setBuffering,
    dispose: dispose,
    constrain: constrain
  };
};
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.MusicPlayerPanel = (function(_super) {

    __extends(MusicPlayerPanel, _super);

    function MusicPlayerPanel() {
      this.disablePlayerInteraction = __bind(this.disablePlayerInteraction, this);

      this.stopTrack = __bind(this.stopTrack, this);

      this.pauseTrack = __bind(this.pauseTrack, this);

      this.updatePlayCount = __bind(this.updatePlayCount, this);

      this.playTrack = __bind(this.playTrack, this);

      this.resetOnNewPlaylist = __bind(this.resetOnNewPlaylist, this);

      this.nextTrack = __bind(this.nextTrack, this);

      this.prevTrack = __bind(this.prevTrack, this);

      this.tapBuyNow = __bind(this.tapBuyNow, this);

      this.updateTrack = __bind(this.updateTrack, this);

      this.setIndexAndTrack = __bind(this.setIndexAndTrack, this);

      this.handleTap = __bind(this.handleTap, this);

      this.toggleMenu = __bind(this.toggleMenu, this);

      this.trackComplete = __bind(this.trackComplete, this);

      this.clientDidChange = __bind(this.clientDidChange, this);

      this.renderList = __bind(this.renderList, this);

      this.render = __bind(this.render, this);
      return MusicPlayerPanel.__super__.constructor.apply(this, arguments);
    }

    MusicPlayerPanel.prototype.elements = {
      '.track-art': 'trackArt',
      '.cache-player': 'cachePlayer',
      '.track-title': 'trackTitle',
      '.cp-bg-img': 'playerInterfaceBackground',
      '.cp-fg-img': 'playerInterfaceForeground',
      '.play': 'playButton',
      '.pause': 'pauseButton',
      '.cp-time-cur': 'currentTime',
      '.cp-time-total': 'totalTime',
      '.cp-progress': 'progress',
      '.music-player': 'musicPlayer',
      '.list.tracks': 'list',
      '.buy-now-link': 'buyNowLink',
      '.btn.sort': 'sortButton'
    };

    MusicPlayerPanel.prototype.deactivatePanel = function() {
      return this.unbindEvents();
    };

    MusicPlayerPanel.prototype.activatePanel = function() {
      var _this = this;
      if (!this.isActivated) {
        MusicPlayerPanel.__super__.activatePanel.apply(this, arguments);
      } else {
        this.playerInterfaceForeground.find('img')[0].style.width = this.playerInterfaceBackground.find('img').width() + 'px';
        setTimeout(function() {
          Spine.Mobile.Stage.globalStage().showContentHideLoader();
          return _this.bindEvents();
        }, 600);
      }
      return this.isActivated = true;
    };

    MusicPlayerPanel.prototype.bindEvents = function() {
      $('.tracks>.item').on('tap', this.handleTap);
      $('.player-button.prev').on('tap', this.prevTrack);
      $('.player-button.next').on('tap', this.nextTrack);
      this.playButton.on('tap', this.playTrack);
      this.pauseButton.on('tap', this.pauseTrack);
      this.buyNowLink.on('tap', this.tapBuyNow);
      this.cachePlayer.on('tap', this.playTrack);
      return TopFan.Models.Client.bind('refresh create update', this.clientDidChange);
    };

    MusicPlayerPanel.prototype.unbindEvents = function() {
      $('.tracks>.item').off('tap');
      $('.player-button.prev').off('tap');
      $('.player-button.next').off('tap');
      this.playButton.off('tap');
      this.pauseButton.off('tap');
      this.buyNowLink.off('tap');
      this.cachePlayer.off('tap');
      TopFan.Models.Client.unbind('refresh', this.clientDidChange);
      TopFan.Models.Client.unbind('create', this.clientDidChange);
      return TopFan.Models.Client.unbind('update', this.clientDidChange);
    };

    MusicPlayerPanel.prototype.render = function() {
      this.playtime = 0;
      this.looping = true;
      this.musicData = TopFan.Models.Client.currentClient().audio_tracks;
      this.html(JST['views/music_player']());
      $('.player-disabler').on('tap touchmove touchstart touchend', this.disablePlayerInteraction);
      $('.info-disabler').on('tap touchmove touchstart touchend', this.disablePlayerInteraction);
      this.buildAudioStreamer();
      this.renderList();
      this.addFilterMenu();
      return this.bindEvents();
    };

    MusicPlayerPanel.prototype.renderList = function(category) {
      var data, index, isCurrentTrackAvailable, _i, _len, _ref;
      $('.tracks>.item').off('tap');
      this.currentMusicData = [];
      if ((!category && this.currentFilter) || (category && category !== 'all')) {
        if (category) {
          this.currentFilter = category;
        }
        _ref = this.musicData;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          if (data.tags && data.tags.indexOf(this.currentFilter) !== -1) {
            this.currentMusicData.push(data);
          }
        }
        this.currentMusicData = _(this.currentMusicData).uniq();
      } else if (this.musicData.length) {
        this.currentFilter = null;
        this.currentMusicData = this.musicData;
      }
      this.list.html(JST['views/music_player_list']({
        musicData: this.currentMusicData
      }));
      $('.tracks>.item').on('tap', this.handleTap);
      if (!this.hasPlayed) {
        this.currentIndex = -1;
        this.setIndexAndTrack(0, false);
        return this.resetIndex = true;
      } else {
        isCurrentTrackAvailable = _(this.currentMusicData).contains(this.currentTrack);
        if (isCurrentTrackAvailable) {
          index = this.currentMusicData.indexOf(this.currentTrack);
          return this.setIndexAndTrack(index, false);
        } else {
          return this.resetIndex = true;
        }
      }
    };

    MusicPlayerPanel.prototype.buildAudioStreamer = function() {
      var _ref, _ref1,
        _this = this;
      if (window.AudioStreamer && !this.audioStreamer) {
        this.audioStreamer = (_ref = window.plugins) != null ? _ref.AudioStreamer(this.cachePlayer[0], this.trackComplete) : void 0;
      }
      if ($.os.ios && ((_ref1 = window.plugins) != null ? _ref1.AudioStream : void 0)) {
        return window.plugins.AudioStream.registerNativeCallback(function(result) {
          var _ref2;
          switch (result) {
            case 'play':
              return _this.playTrack();
            case 'pause':
              return _this.pauseTrack();
            case 'next':
              return _this.nextTrack();
            case 'prev':
              return _this.prevTrack();
            case 'stop':
              return _this.stopTrack();
            case 'toggle':
              if ((_ref2 = _this.audioStreamer) != null ? _ref2.isPaused() : void 0) {
                return _this.playTrack();
              } else {
                return _this.pauseTrack();
              }
              break;
            case 'complete':
              return _this.trackComplete();
          }
        });
      }
    };

    MusicPlayerPanel.prototype.clientDidChange = function(e) {
      this.currentIndex = -1;
      this.resetIndex = true;
      this.musicData = TopFan.Models.Client.currentClient().audio_tracks;
      this.renderList();
      return this.addFilterMenu();
    };

    MusicPlayerPanel.prototype.trackComplete = function() {
      if (Date.now() > this.playtime + 1000) {
        return this.nextTrack();
      }
    };

    MusicPlayerPanel.prototype.addFilterMenu = function() {
      var data, filterArray, tag, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      if (this.filterMenu) {
        $(this.filterMenu.el).remove();
        this.filterMenu.dispose();
        this.toggleFilterCallback.dispose();
        this.filterMenu = null;
      }
      filterArray = [];
      _ref = this.musicData;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        if (data.tags) {
          _ref1 = data.tags;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            tag = _ref1[_j];
            filterArray.push(tag);
          }
        }
      }
      filterArray = _(filterArray).uniq();
      if (filterArray.length > 0) {
        filterArray.sort(function(a, b) {
          if (a < b) {
            return -1;
          }
          if (b < a) {
            return 1;
          }
          return 0;
        });
        filterArray.splice(0, 0, 'all');
        this.filterMenu = new TopFan.Panels.FilterDetailPanel(filterArray, {
          listTitle: 'Filter Your Playlist',
          backTitle: 'Music'
        });
        this.filterMenu.bind('filter', this.renderList);
        this.musicPlayer.append(this.filterMenu.el);
        this.toggleFilterCallback = new ButtonTouchCallback($('.btn.sort', this.el)[0], this.toggleMenu);
        this.filterMenu.activateFilter(this.currentFilter || 'all');
        return this.sortButton.show();
      } else {
        return this.sortButton.hide();
      }
    };

    MusicPlayerPanel.prototype.toggleMenu = function(el, e) {
      var timeout,
        _this = this;
      timeout = $.os.android ? 400 : 10;
      return setTimeout(function() {
        _this.filterMenu.toggle();
        if (_this.filterMenu.el.hasClass('active')) {
          return _this.cachePlayer.addClass('buffering');
        } else {
          return _this.cachePlayer.removeClass('buffering');
        }
      }, timeout);
    };

    MusicPlayerPanel.prototype.handleTap = function(e) {
      var trackIndex;
      trackIndex = $(e.target).closest('.item').data('track-index');
      return this.setIndexAndTrack(trackIndex);
    };

    MusicPlayerPanel.prototype.setIndexAndTrack = function(trackIndex, plays) {
      if (plays == null) {
        plays = true;
      }
      if (!this.currentMusicData.length) {
        return;
      }
      if (trackIndex !== this.currentIndex || this.resetIndex) {
        this.currentTime.html('00:00');
        this.totalTime.html('00:00');
        this.currentIndex = trackIndex;
        this.currentTrack = this.currentMusicData[this.currentIndex];
        this.updateTrack();
        if (plays) {
          return this.playTrack(null, true);
        }
      }
    };

    MusicPlayerPanel.prototype.updateTrack = function() {
      var _this = this;
      this.trackArt.html("<img src='" + this.currentTrack.promo_image_path + "'>");
      this.playerInterfaceBackground.html("<img src='" + this.currentTrack.waveform_path + "'>");
      this.playerInterfaceForeground.html("<img src='" + this.currentTrack.color_waveform_path + "'>");
      this.playerInterfaceBackground.find('img')[0].onload = function() {
        return _this.playerInterfaceForeground.find('img')[0].style.width = _this.playerInterfaceBackground.find('img').width() + 'px';
      };
      this.trackTitle.text(this.currentTrack.name);
      if (($.os.android && this.currentTrack.play_link) || this.currentTrack.itunes_link) {
        return this.buyNowLink.show();
      } else {
        return this.buyNowLink.hide();
      }
    };

    MusicPlayerPanel.prototype.tapBuyNow = function(e) {
      var _ref, _ref1,
        _this = this;
      setTimeout(function() {
        var _ref;
        return (_ref = _this.filterMenu) != null ? _ref.hide() : void 0;
      }, 600);
      if ($.os.android && ((_ref = this.currentTrack) != null ? _ref.play_link : void 0)) {
        TopFan.ExternalLinkHelper.open(this.currentTrack.play_link);
      }
      if ($.os.ios && ((_ref1 = this.currentTrack) != null ? _ref1.itunes_link : void 0)) {
        return TopFan.ExternalLinkHelper.open(this.currentTrack.itunes_link);
      }
    };

    MusicPlayerPanel.prototype.prevTrack = function(e) {
      if (this.resetIndex) {
        return this.resetOnNewPlaylist();
      } else if (this.currentIndex > 0) {
        return this.setIndexAndTrack(this.currentIndex - 1);
      }
    };

    MusicPlayerPanel.prototype.nextTrack = function(e) {
      if (this.resetIndex) {
        return this.resetOnNewPlaylist();
      } else if (this.currentIndex < this.currentMusicData.length - 1) {
        return this.setIndexAndTrack(this.currentIndex + 1);
      } else if (this.looping && this.currentIndex === this.currentMusicData.length - 1) {
        this.currentIndex = -1;
        return this.setIndexAndTrack(0);
      }
    };

    MusicPlayerPanel.prototype.resetOnNewPlaylist = function() {
      this.resetIndex = false;
      this.currentIndex = -1;
      return this.setIndexAndTrack(0);
    };

    MusicPlayerPanel.prototype.playTrack = function(e, force) {
      var _ref, _ref1, _ref2;
      if (force == null) {
        force = false;
      }
      if (!this.currentTrack) {
        return;
      }
      this.cachePlayer.off('tap');
      this.playtime = Date.now();
      this.hasPlayed = true;
      if (((_ref = this.audioStreamer) != null ? _ref.isPaused() : void 0) && !force) {
        if ((_ref1 = this.audioStreamer) != null) {
          _ref1.pause();
        }
      } else {
        if ((_ref2 = this.audioStreamer) != null) {
          _ref2.play(this.currentTrack.audio_path, TopFan.Models.Client.currentClient().name, this.currentTrack.name);
        }
        this.trackPlaylistCount();
      }
      this.playButton.addClass('hidden');
      this.pauseButton.removeClass('hidden');
      this.resetIndex = false;
      this.playing = true;
      if (window.serviceForegrounder && $.os.android) {
        return window.serviceForegrounder.start(TopFan.Models.Client.currentClient().name, this.currentTrack.name);
      }
    };

    MusicPlayerPanel.prototype.trackPlaylistCount = function() {
      var request;
      request = new TopFan.Request({
        type: 'POST',
        token: TopFan.Request.TOKEN_CLIENT,
        url: this.currentTrack.track_play_path,
        success: this.updatePlayCount
      });
      return request.perform();
    };

    MusicPlayerPanel.prototype.updatePlayCount = function(data) {
      var selector;
      selector = "[data-track-index='" + this.currentIndex + "']";
      return $(selector).find('.play-count').html("" + (data.count.withDelimiter()) + " Play" + (data.count === 1 ? '' : 's'));
    };

    MusicPlayerPanel.prototype.pauseTrack = function(e) {
      var _ref, _ref1;
      if (this.currentTrack && !((_ref = this.audioStreamer) != null ? _ref.isPaused() : void 0)) {
        if ((_ref1 = this.audioStreamer) != null) {
          _ref1.pause();
        }
        this.playButton.removeClass('hidden');
        this.pauseButton.addClass('hidden');
        this.playing = false;
        if (window.serviceForegrounder && $.os.android) {
          return window.serviceForegrounder.stop(true);
        }
      }
    };

    MusicPlayerPanel.prototype.stopTrack = function(e) {
      var _ref,
        _this = this;
      if (!((_ref = this.audioStreamer) != null ? _ref.isPaused() : void 0)) {
        return setTimeout(function() {
          _this.playButton.removeClass('hidden');
          _this.pauseButton.addClass('hidden');
          _this.hasPlayed = false;
          _this.resetIndex = true;
          _this.cachePlayer.addClass('buffering');
          _this.audioStreamer.reset();
          if (window.serviceForegrounder && $.os.android) {
            return window.serviceForegrounder.stop(true);
          }
        }, 400);
      }
    };

    MusicPlayerPanel.prototype.disablePlayerInteraction = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.hasPlayed) {
        return this.playTrack();
      }
    };

    return MusicPlayerPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.OtherAppsPanel = (function(_super) {

    __extends(OtherAppsPanel, _super);

    function OtherAppsPanel() {
      this.dispose = __bind(this.dispose, this);

      this.goToApp = __bind(this.goToApp, this);

      this.renderList = __bind(this.renderList, this);

      this.toggleMenu = __bind(this.toggleMenu, this);

      this.render = __bind(this.render, this);

      this.triggerActive = __bind(this.triggerActive, this);
      return OtherAppsPanel.__super__.constructor.apply(this, arguments);
    }

    OtherAppsPanel.prototype.elements = {
      '.other-apps': 'list'
    };

    OtherAppsPanel.prototype.events = {
      'tap .other-apps>.item': 'goToApp'
    };

    OtherAppsPanel.prototype.init = function() {
      return this.routes({
        '/other_apps': function(params) {
          this.active();
          return TopFan.Models.OtherApps.sync();
        }
      });
    };

    OtherAppsPanel.prototype.bindModelEvents = function() {
      return TopFan.Models.OtherApps.bind('refresh change', this.triggerActive);
    };

    OtherAppsPanel.prototype.unbindModelEvents = function() {
      TopFan.Models.OtherApps.unbind('refresh', this.triggerActive);
      return TopFan.Models.OtherApps.unbind('change', this.triggerActive);
    };

    OtherAppsPanel.prototype.triggerActive = function() {
      return this.trigger('active');
    };

    OtherAppsPanel.prototype.render = function() {
      var _ref;
      if (TopFan.Models.OtherApps.hasSynced) {
        this.html(JST['views/other_apps']());
        this.renderList();
        if ((_ref = this.filterMenu) == null) {
          this.filterMenu = new TopFan.Panels.FilterDetailPanel(TopFan.Models.OtherApps.categories(), {
            listTitle: 'Filter By Category',
            backTitle: 'Other TopFan Apps'
          });
        }
        this.filterMenu.bind('filter', this.renderList);
        this.el.append(this.filterMenu.el);
        this.toggleFilterCallback = new ButtonTouchCallback($('.btn.sort', this.el)[0], this.toggleMenu);
        return this.filterMenu.activateFilter(Constants.ALL_CATEGORIES);
      }
    };

    OtherAppsPanel.prototype.toggleMenu = function() {
      console.log('TOGGLE MENU');
      return this.filterMenu.toggle();
    };

    OtherAppsPanel.prototype.renderList = function(category) {
      return this.list.html(JST['views/other_apps_list']({
        otherApps: TopFan.Models.OtherApps.filter(category)
      }));
    };

    OtherAppsPanel.prototype.showFilters = function() {
      return this.filterMenu.show();
    };

    OtherAppsPanel.prototype.goToApp = function(e) {
      var appLink;
      appLink = $(e.target).closest('.item').data('link');
      return TopFan.ExternalLinkHelper.open(appLink);
    };

    OtherAppsPanel.prototype.dispose = function() {
      var _ref;
      if ((_ref = this.filterMenu) != null) {
        _ref.dispose();
      }
      return this.filterMenu = null;
    };

    return OtherAppsPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.RewardDetailPanel = (function(_super) {

    __extends(RewardDetailPanel, _super);

    function RewardDetailPanel() {
      this.redeemReward = __bind(this.redeemReward, this);

      this.navigateToAccount = __bind(this.navigateToAccount, this);

      this.userDidVerifyAddress = __bind(this.userDidVerifyAddress, this);

      this.userDidConfirm = __bind(this.userDidConfirm, this);

      this.userNeedsAddress = __bind(this.userNeedsAddress, this);

      this.userNeedsToLogin = __bind(this.userNeedsToLogin, this);

      this.redeem = __bind(this.redeem, this);

      this.hide = __bind(this.hide, this);
      return RewardDetailPanel.__super__.constructor.apply(this, arguments);
    }

    RewardDetailPanel.prototype.className = 'details reward';

    RewardDetailPanel.prototype.elements = {
      '.deets': 'deets',
      '.image': 'image',
      '.deets .content .title': 'title',
      '.deets .point_value': 'points',
      '.deets .body': 'body',
      '.deets .description': 'description'
    };

    RewardDetailPanel.prototype.events = {
      'tap .close': 'hide',
      'tap .redeem': 'redeem',
      'tap .return-btn': 'hide'
    };

    RewardDetailPanel.prototype.init = function() {
      return this.render();
    };

    RewardDetailPanel.prototype.dispose = function() {
      return this.html('');
    };

    RewardDetailPanel.prototype.render = function() {
      return this.html(JST['views/reward_detail']());
    };

    RewardDetailPanel.prototype.show = function(reward) {
      this.currentReward = reward;
      this.deets.data('id', this.currentReward.id);
      if (TopFan.Services.AccountService.getInstance().currentAccount()) {
        if (reward.isAvailable()) {
          this.body.html('Enough Points');
          this.body.removeClass('primary');
        } else {
          this.body.html("" + (this.currentReward.remainingPointsToRedeem().withDelimiter()) + " More Points Needed");
          this.body.addClass('primary');
        }
      } else {
        this.body.html("" + (this.currentReward.point_cost.withDelimiter()) + " More Points Needed");
        this.body.addClass('primary');
      }
      this.image.html(this.currentReward.detail_image_path ? "<img src='" + this.currentReward.detail_image_path + "'/>" : '');
      this.title.html("" + this.currentReward.title + "<br/><span class='available'>" + (StringUtil.remaining(this.currentReward.quantity_available)) + "</span>");
      this.points.html("" + (this.currentReward.point_cost.withDelimiter()) + " POINTS");
      this.description.html(this.currentReward.description);
      return this.el.addClass('active');
    };

    RewardDetailPanel.prototype.hide = function() {
      return this.el.removeClass('active');
    };

    RewardDetailPanel.prototype.redeem = function() {
      var message;
      if (!TopFan.AppState.getInstance().isLoggedIn()) {
        return TopFan.Notification.confirm('You need to log in or signup for an account.', this.userNeedsToLogin);
      } else if (this.currentReward.isAvailable()) {
        if (TopFan.Services.AccountService.getInstance().currentAccount().name) {
          message = "Are you sure you want to redeem " + (this.currentReward.point_cost.withDelimiter()) + " points for this item?";
          return TopFan.Notification.confirm(message, this.userDidConfirm, this.currentReward.title);
        } else {
          return TopFan.Notification.confirm('To send your reward to you, we need your shipping address. Please provide this in Account Settings.', this.userNeedsAddress);
        }
      } else {
        return TopFan.Notification.alert("You do not have enough points to redeem this reward.");
      }
    };

    RewardDetailPanel.prototype.userNeedsToLogin = function(int) {
      if (int === 1) {
        return this.navigate(Constants.LOGIN_PATH);
      }
    };

    RewardDetailPanel.prototype.userNeedsAddress = function(int) {
      if (int === 1) {
        return this.navigate(Constants.ACCOUNT_PATH);
      }
    };

    RewardDetailPanel.prototype.userDidConfirm = function(int) {
      var currentAccount, message, _ref;
      if (int === 1) {
        currentAccount = TopFan.Services.AccountService.getInstance().currentAccount();
        if (((_ref = currentAccount.name) != null ? _ref.length : void 0) > 0) {
          message = "Is this your correct address:\n" + currentAccount.name + "\n" + currentAccount.address + "\n" + currentAccount.city + ", " + currentAccount.state + " " + currentAccount.zip_code;
          return TopFan.Notification.confirm(message, this.userDidVerifyAddress, 'Confirm', 'Yes,No');
        } else {
          message = "Please add an address in Account Settings and try again.";
          return TopFan.Notification.alert(message, this.navigateToAccount);
        }
      }
    };

    RewardDetailPanel.prototype.userDidVerifyAddress = function(int) {
      if (int === 1) {
        return this.redeemReward();
      } else if (int === 2) {
        return this.navigateToAccount();
      }
    };

    RewardDetailPanel.prototype.navigateToAccount = function() {
      return this.navigate(Constants.ACCOUNT_PATH, {
        dontDisable: true
      });
    };

    RewardDetailPanel.prototype.redeemReward = function() {
      TopFan.Services.RewardRedemptionService.getInstance().redeemReward(this.currentReward.id);
      this.trigger('redeemReward', this.currentReward);
      return this.hide();
    };

    return RewardDetailPanel;

  })(Spine.Controller);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.Rewards = (function(_super) {

    __extends(Rewards, _super);

    function Rewards() {
      this.setLifetimePoints = __bind(this.setLifetimePoints, this);

      this.setRedeemablePoints = __bind(this.setRedeemablePoints, this);

      this.updateRewardAvailability = __bind(this.updateRewardAvailability, this);

      this.decrementRedeemablePoints = __bind(this.decrementRedeemablePoints, this);

      this.redeemReward = __bind(this.redeemReward, this);

      this.showDetail = __bind(this.showDetail, this);

      this.render = __bind(this.render, this);

      this.triggerActive = __bind(this.triggerActive, this);

      this.updatePointsFromAccount = __bind(this.updatePointsFromAccount, this);

      this.rewardWasNotRedeemed = __bind(this.rewardWasNotRedeemed, this);

      this.unbindModelEvents = __bind(this.unbindModelEvents, this);

      this.bindModelEvents = __bind(this.bindModelEvents, this);
      return Rewards.__super__.constructor.apply(this, arguments);
    }

    Rewards.prototype.elements = {
      '.redeemable .total': 'redeemablePoints',
      '.lifetime .total': 'lifetimePoints'
    };

    Rewards.prototype.events = {
      'tap .item': 'showDetail'
    };

    Rewards.prototype.init = function() {
      return this.routes({
        '/rewards': function(params) {
          this.active();
          if (TopFan.AppState.getInstance().hasClientToken()) {
            return TopFan.Services.RewardRetrievalService.getInstance().retrieve();
          }
        }
      });
    };

    Rewards.prototype.bindModelEvents = function() {
      TopFan.Models.Reward.bind('refresh change', this.triggerActive);
      TopFan.Models.Reward.bind('redeem', this.rewardWasRedeemed);
      TopFan.Models.Reward.bind('redeemError', this.rewardWasNotRedeemed);
      return TopFan.Models.Account.bind('login change', this.updatePointsFromAccount);
    };

    Rewards.prototype.unbindModelEvents = function() {
      TopFan.Models.Reward.unbind('refresh', this.triggerActive);
      TopFan.Models.Reward.unbind('change', this.triggerActive);
      TopFan.Models.Reward.unbind('redeem', this.rewardWasRedeemed);
      TopFan.Models.Reward.unbind('redeemError', this.rewardWasNotRedeemed);
      TopFan.Models.Account.unbind('login', this.updatePointsFromAccount);
      return TopFan.Models.Account.unbind('change', this.updatePointsFromAccount);
    };

    Rewards.prototype.rewardWasRedeemed = function(data) {
      if (data.virtual_prize_url) {
        return TopFan.Notification.alert('Reward redeemed! You will now be taken to a website where you can access your Virtual Reward.', function() {
          return TopFan.ExternalLinkHelper.open(data.virtual_prize_url, data.open_externally_on_ios, data.open_externally_on_android, data.use_restricted_internal_browser);
        });
      } else {
        return TopFan.Notification.alert('Reward redeemed! You will receive a confirmation e-mail with further instructions shortly.');
      }
    };

    Rewards.prototype.rewardWasNotRedeemed = function(xhr, type) {
      var message, _ref;
      message = JSON.parse(xhr.responseText).message;
      TopFan.Notification.alert("Sorry, unable to redeem this reward. " + message);
      return (_ref = this.pointEase) != null ? _ref.setTarget(TopFan.Services.AccountService.getInstance().currentAccount().redeemable_points) : void 0;
    };

    Rewards.prototype.updatePointsFromAccount = function() {
      if (TopFan.Services.AccountService.getInstance().currentAccount()) {
        this.setRedeemablePoints(TopFan.Services.AccountService.getInstance().currentAccount().redeemable_points);
        this.setLifetimePoints(TopFan.Services.AccountService.getInstance().currentAccount().lifetime_points);
        if (!this.pointEase) {
          return this.pointEase = new EaseToValueCallback(TopFan.Services.AccountService.getInstance().currentAccount().redeemable_points, 6, this.setRedeemablePoints);
        }
      }
    };

    Rewards.prototype.triggerActive = function() {
      return this.trigger('active');
    };

    Rewards.prototype.render = function() {
      var rewards;
      if (TopFan.Services.RewardRetrievalService.getInstance().hasSynced) {
        rewards = TopFan.Models.Reward.inOrder();
        if ($.os.ios && JSON.stringify(rewards) === JSON.stringify(this.currentRewards)) {
          return;
        }
        this.html(JST['views/rewards']({
          rewards: rewards
        }));
        if (!($('.deets', this.el).length > 0)) {
          this.detail = new TopFan.Panels.RewardDetailPanel;
          this.el.append(this.detail.el);
          this.detail.bind('redeemReward', this.redeemReward);
        }
        this.updatePointsFromAccount();
        return this.currentRewards = rewards;
      }
    };

    Rewards.prototype.showDetail = function(e) {
      var reward, rewardId, _ref;
      rewardId = $(e.target).closest('.item').data('id');
      reward = TopFan.Models.Reward.find(rewardId);
      return (_ref = this.detail) != null ? _ref.show(reward) : void 0;
    };

    Rewards.prototype.redeemReward = function(reward) {
      this.decrementRedeemablePoints(reward.point_cost);
      return this.updateRewardAvailability(reward.id);
    };

    Rewards.prototype.decrementRedeemablePoints = function(cost) {
      var total;
      total = this.getNumberFromElement(this.redeemablePoints);
      console.log("total: " + total + " cost: " + cost);
      return this.pointEase.setTarget(total - cost);
    };

    Rewards.prototype.updateRewardAvailability = function(rewardId) {
      var reward, rewardEl, selector;
      reward = TopFan.Models.Reward.find(rewardId);
      reward.quantity_available -= 1;
      selector = "[data-id='" + rewardId + "'] .title .available";
      rewardEl = $(selector);
      return this.setAvailableRedemptionsForReward(rewardEl, reward.quantity_available);
    };

    Rewards.prototype.getNumberFromElement = function(el) {
      return parseInt(el.html().replace(/\D/, ''));
    };

    Rewards.prototype.setPoints = function(el, value) {
      return el.html(Math.round(value).withDelimiter());
    };

    Rewards.prototype.setRedeemablePoints = function(value) {
      return this.setPoints(this.redeemablePoints, value);
    };

    Rewards.prototype.setLifetimePoints = function(value) {
      return this.setPoints(this.lifetimePoints, value);
    };

    Rewards.prototype.setAvailableRedemptionsForReward = function(el, redemptions) {
      return el.html(StringUtil.remaining(redemptions));
    };

    Rewards.prototype.dispose = function() {
      if (this.detail) {
        this.detail.dispose();
        this.detail.unbind('redeemReward', this.redeemReward);
        this.detail = null;
        delete this.detail;
        return this.currentRewards = null;
      }
    };

    return Rewards;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.SearchPanel = (function(_super) {

    __extends(SearchPanel, _super);

    function SearchPanel() {
      this.showItemDetail = __bind(this.showItemDetail, this);

      this.setEntries = __bind(this.setEntries, this);

      this.clearEntries = __bind(this.clearEntries, this);

      this.searchEntries = __bind(this.searchEntries, this);

      this.render = __bind(this.render, this);
      return SearchPanel.__super__.constructor.apply(this, arguments);
    }

    SearchPanel.prototype.elements = {
      '.list-entries': 'listEntries'
    };

    SearchPanel.prototype.events = {
      'tap .js-item': 'showItemDetail'
    };

    SearchPanel.prototype.render = function() {
      this.calculateValues();
      this.html(JST['views/search']({
        scrollerHeight: this.scrollerHeight
      }));
      this.searchInput = new TopFan.SearchInput(this.el.find('.search-input-container'));
      this.searchInput.input.on('search', this.searchEntries);
      this.searchInput.clearButton.on('clear', this.clearEntries);
      return this.setEntries([]);
    };

    SearchPanel.prototype.calculateValues = function() {
      this.scrollerTop = 140;
      return this.scrollerHeight = $(window).height() - this.scrollerTop;
    };

    SearchPanel.prototype.searchEntries = function(e, obj) {
      return this.setEntries(obj.entries);
    };

    SearchPanel.prototype.clearEntries = function() {
      return this.setEntries([]);
    };

    SearchPanel.prototype.setEntries = function(entries) {
      var buffer, entry, message, _i, _len;
      if (!entries) {
        return;
      }
      if (entries.length === 0) {
        message = this.searchInput.input.val() ? 'No results found' : 'Please enter your search criteria';
        return this.listEntries.html(JST['views/shared/_no_list_results']({
          message: message
        }));
      } else {
        this.listEntries.html('');
        buffer = '';
        for (_i = 0, _len = entries.length; _i < _len; _i++) {
          entry = entries[_i];
          buffer += JST['views/shared/_list_entry_item']({
            entry: entry,
            color: entry.color
          });
        }
        return this.listEntries.append(buffer);
      }
    };

    SearchPanel.prototype.showItemDetail = function(e) {
      var id;
      id = $(e.target).closest('.js-item').data('id');
      this.navigate(Constants.ENTRY_PATH, id);
      return $('.back').addClass('showing');
    };

    SearchPanel.prototype.dispose = function() {
      return this.searchInput.dispose();
    };

    return SearchPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.SignupPanel = (function(_super) {

    __extends(SignupPanel, _super);

    function SignupPanel() {
      this.signupFailure = __bind(this.signupFailure, this);

      this.confirmSignup = __bind(this.confirmSignup, this);

      this.signupSuccess = __bind(this.signupSuccess, this);

      this.showDateLabel = __bind(this.showDateLabel, this);

      this.hideDateLabel = __bind(this.hideDateLabel, this);

      this.signup = __bind(this.signup, this);

      this.dispose = __bind(this.dispose, this);

      this.submitForm = __bind(this.submitForm, this);

      this.render = __bind(this.render, this);
      return SignupPanel.__super__.constructor.apply(this, arguments);
    }

    SignupPanel.prototype.events = {
      'submit form': 'signup',
      'tap #login_button': 'login',
      'tap a': 'handleLink',
      'click a': 'handleLink'
    };

    SignupPanel.prototype.elements = {
      'form': 'form'
    };

    SignupPanel.prototype.render = function(params) {
      this.html(JST['views/signup'](params));
      this.dateLabel = $('label.date');
      $('#date_of_birth').bind('focus', this.hideDateLabel);
      $('#date_of_birth').bind('blur', this.showDateLabel);
      return this.touchCallback = new ButtonTouchCallback(this.el.find('#signup_button')[0], this.submitForm);
    };

    SignupPanel.prototype.submitForm = function(el, e) {
      e.preventDefault();
      return this.form.submit();
    };

    SignupPanel.prototype.dispose = function() {
      var _ref;
      $('#date_of_birth').unbind('blur', this.showDateLabel);
      return (_ref = this.touchCallback) != null ? _ref.dispose() : void 0;
    };

    SignupPanel.prototype.signup = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('input, select').blur();
      return this.validate();
    };

    SignupPanel.prototype.validate = function() {
      var dobMoment, isMissingInfo, msg, prop;
      this.params = TopFan.FormHelper.serializedArrayToHash(this.form.serializeArray());
      dobMoment = moment(this.params.date_of_birth, ['YYYY-MM-DD', 'MM-DD-YYYY', 'M/D/YY']);
      this.params.date_of_birth = dobMoment != null ? dobMoment.format('YYYY-MM-DD') : void 0;
      isMissingInfo = false;
      msg = [];
      for (prop in this.params) {
        if (!(prop && prop !== '' && this.params[prop] !== null && this.params[prop] !== void 0 && this.params[prop] !== '')) {
          switch (prop) {
            case 'email':
              msg.push('Email can\'t be blank');
              break;
            case 'password':
              msg.push('Password can\'t be blank');
              break;
            case 'password_confirmation':
              msg.push('Password confirmation can\'t be blank');
              break;
            case 'gender':
              msg.push('Gender can\'t be blank');
              break;
            case 'date_of_birth':
              msg.push('Date of birth can\'t be blank');
          }
        }
      }
      if (this.params.password.length < 6) {
        msg.push('Password must be at least 6 characters in length');
      }
      if (this.params.password !== this.params.password_confirmation) {
        msg.push('Password and password confirmation must match');
      }
      if (dobMoment > moment().subtract('years', 13).startOf('day')) {
        msg.push('You must be at least 13 years of age to sign up');
      }
      if (!this.params.accepts_terms_and_conditions) {
        msg.push('You need to accept the terms and conditions');
      }
      if (msg.length) {
        return TopFan.Notification.alert(msg.join(', '));
      } else {
        return this.sendParams();
      }
    };

    SignupPanel.prototype.sendParams = function() {
      return TopFan.Services.AccountService.getInstance().signup(this.params, this.signupSuccess, this.signupFailure);
    };

    SignupPanel.prototype.hideDateLabel = function(e) {
      return this.dateLabel.hide();
    };

    SignupPanel.prototype.showDateLabel = function(e) {
      if ($(e.target).val()) {
        return this.hideDateLabel();
      } else {
        return this.dateLabel.show();
      }
    };

    SignupPanel.prototype.handleLink = function(e) {
      e.preventDefault();
      if (e.type === 'tap') {
        return TopFan.ExternalLinkHelper.open($(e.target).attr('href'));
      }
    };

    SignupPanel.prototype.signupSuccess = function(user) {
      TopFan.Notification.alert("Account creation successful. You can use this same email and password with any TopFan application", this.confirmSignup, "Success");
      return TopFan.Services.UserTokenService.getInstance().retrieve(this.params.email, this.params.password);
    };

    SignupPanel.prototype.confirmSignup = function() {
      return this.navigate(Constants.CHALLENGES_PATH);
    };

    SignupPanel.prototype.signupFailure = function(xhr, type) {
      var message;
      if (xhr.responseText && xhr.responseText !== '') {
        message = JSON.parse(xhr.responseText)['message'];
      } else {
        message = 'Sign up failed.';
      }
      return TopFan.Notification.alert(message);
    };

    SignupPanel.prototype.login = function(e) {
      e.preventDefault();
      return this.navigate(Constants.LOGIN_PATH, {
        trans: 'right'
      });
    };

    return SignupPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.SocialFeedPanel = (function(_super) {

    __extends(SocialFeedPanel, _super);

    function SocialFeedPanel() {
      this.render = __bind(this.render, this);
      return SocialFeedPanel.__super__.constructor.apply(this, arguments);
    }

    SocialFeedPanel.prototype.render = function() {
      if (TopFan.Models.Client.currentClient()) {
        this.html(JST['views/social_feed'](TopFan.Models.Client.currentClient()));
        return TopFan.Models.Client.sync();
      }
    };

    return SocialFeedPanel;

  })(TopFan.Panels.PromoImageBasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Panels.VMSocialFeedPanel = (function(_super) {

    __extends(VMSocialFeedPanel, _super);

    function VMSocialFeedPanel() {
      this.render = __bind(this.render, this);
      return VMSocialFeedPanel.__super__.constructor.apply(this, arguments);
    }

    VMSocialFeedPanel.prototype.render = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      if (currentClient) {
        return this.html(JST['views/vm_social_feed']());
      }
    };

    return VMSocialFeedPanel;

  })(TopFan.Panels.BasePanel);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.AccountService = (function(_super) {

    __extends(AccountService, _super);

    function AccountService() {
      this.update = __bind(this.update, this);

      this.signup = __bind(this.signup, this);

      this.logout = __bind(this.logout, this);

      this.fetch = __bind(this.fetch, this);
      return AccountService.__super__.constructor.apply(this, arguments);
    }

    AccountService.prototype.fetch = function(win, fail) {
      var request,
        _this = this;
      request = new TopFan.Request({
        type: 'GET',
        token: TopFan.Request.TOKEN_USER,
        url: '/account',
        success: function(json) {
          TopFan.Models.Account.destroyAll();
          TopFan.Models.Account.create(json);
          if (typeof win === 'function') {
            win.call(TopFan.Models.Account);
          }
          return TopFan.Models.Account.trigger('login');
        },
        error: function(xhr, type) {
          if (typeof fail === 'function') {
            return fail.call(TopFan.Models.Account, xhr, type);
          }
        }
      });
      return request.perform();
    };

    AccountService.prototype.logout = function() {
      TopFan.Models.Account.destroyAll();
      return TopFan.Models.Account.trigger('logout');
    };

    AccountService.prototype.signup = function(params, win, fail) {
      var request,
        _this = this;
      TopFan.Models.Account.destroyAll();
      TopFan.Loader.getInstance().show();
      request = new TopFan.Request({
        type: 'POST',
        url: '/account',
        token: TopFan.Request.TOKEN_CLIENT,
        data: JSON.stringify(params),
        success: function(json) {
          console.log('Signup success!', json);
          TopFan.Models.Account.create(json);
          if (typeof win === 'function') {
            win.call(TopFan.Models.Account);
          }
          return TopFan.Models.Account.trigger('login');
        },
        error: function(xhr, type) {
          console.log('Signup failure!', type, xhr);
          if (typeof fail === 'function') {
            return fail.call(TopFan.Models.Account, xhr, type);
          }
        },
        complete: function() {
          return TopFan.Loader.getInstance().hide();
        }
      });
      return request.perform();
    };

    AccountService.prototype.update = function(account, win, fail) {
      var request,
        _this = this;
      TopFan.Loader.getInstance().show();
      request = new TopFan.Request({
        type: 'PUT',
        token: TopFan.Request.TOKEN_USER,
        url: '/account',
        data: JSON.stringify(account.updatableAttributes()),
        success: function(json) {
          console.log('Update success!', json);
          account.updateAttributes(json);
          if (typeof win === 'function') {
            return win.call(account);
          }
        },
        error: function(xhr, type) {
          console.log('Update failure!', type, xhr);
          if (typeof fail === 'function') {
            return fail.call(account, xhr, type);
          }
        },
        complete: function() {
          return TopFan.Loader.getInstance().hide();
        }
      });
      return request.perform();
    };

    AccountService.prototype.currentAccount = function() {
      return TopFan.Models.Account.first();
    };

    return AccountService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.ChallengeCompletionService = (function(_super) {

    __extends(ChallengeCompletionService, _super);

    function ChallengeCompletionService() {
      this.retrieve = __bind(this.retrieve, this);
      return ChallengeCompletionService.__super__.constructor.apply(this, arguments);
    }

    ChallengeCompletionService.prototype.completeChallenge = function(challenge) {
      var currentPosition, request, _ref, _ref1;
      currentPosition = TopFan.Services.LocationService.getInstance().currentPosition();
      TopFan.Loader.getInstance().show('Validating');
      request = new TopFan.Request({
        type: 'POST',
        token: TopFan.Request.TOKEN_USER,
        url: "/client/completions",
        data: JSON.stringify({
          client_challenge_id: challenge.id,
          step_values: challenge.stepValues(),
          latitude: currentPosition != null ? (_ref = currentPosition.coords) != null ? _ref.latitude : void 0 : void 0,
          longitude: currentPosition != null ? (_ref1 = currentPosition.coords) != null ? _ref1.longitude : void 0 : void 0
        }),
        success: function(data) {
          challenge.destroy();
          return TopFan.Models.Challenge.trigger('complete', data);
        },
        error: function(xhr, type) {
          console.log('Error completing challenge', arguments);
          return TopFan.Models.Challenge.trigger('completeError', xhr, type);
        },
        complete: function() {
          return TopFan.Loader.getInstance().hide();
        }
      });
      request.perform();
      return request;
    };

    ChallengeCompletionService.prototype.retrieve = function() {
      var request;
      request = new TopFan.Request({
        type: 'GET',
        token: TopFan.Request.TOKEN_USER,
        url: "/client/completions",
        success: this.retrieveDidSucceed,
        error: this.retrieveDidError
      });
      return request.perform();
    };

    ChallengeCompletionService.prototype.retrieveDidSucceed = function(json) {
      var index, record, _i, _len;
      TopFan.Models.Completion.hasSynced = true;
      TopFan.Models.Completion.deleteAll();
      for (index = _i = 0, _len = json.length; _i < _len; index = ++_i) {
        record = json[index];
        record['index'] = index;
      }
      return TopFan.Models.Completion.refresh(json);
    };

    ChallengeCompletionService.prototype.retrieveDidError = function() {
      return console.log('Sync blew up', arguments);
    };

    return ChallengeCompletionService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.ChallengeRetrievalService = (function(_super) {

    __extends(ChallengeRetrievalService, _super);

    function ChallengeRetrievalService() {
      this.syncDidSucceed = __bind(this.syncDidSucceed, this);

      this.retrieve = __bind(this.retrieve, this);
      return ChallengeRetrievalService.__super__.constructor.apply(this, arguments);
    }

    ChallengeRetrievalService.prototype.hasSynced = false;

    ChallengeRetrievalService.prototype.retrieve = function() {
      var currentPosition, request, _ref, _ref1;
      currentPosition = TopFan.Services.LocationService.getInstance().currentPosition();
      request = new TopFan.Request({
        type: 'GET',
        token: this.tokenType(),
        url: '/client/challenges',
        data: {
          latitude: currentPosition != null ? (_ref = currentPosition.coords) != null ? _ref.latitude : void 0 : void 0,
          longitude: currentPosition != null ? (_ref1 = currentPosition.coords) != null ? _ref1.longitude : void 0 : void 0
        },
        success: this.syncDidSucceed,
        error: function() {
          return console.log('ChallengeRetrievalService: Retrieval failed', arguments);
        }
      });
      return request.perform();
    };

    ChallengeRetrievalService.prototype.syncDidSucceed = function(json) {
      var index, record, _i, _len;
      this.hasSynced = true;
      TopFan.Models.Challenge.deleteAll();
      for (index = _i = 0, _len = json.length; _i < _len; index = ++_i) {
        record = json[index];
        record['index'] = index;
      }
      return TopFan.Models.Challenge.refresh(json);
    };

    ChallengeRetrievalService.prototype.tokenType = function() {
      if (TopFan.AppState.getInstance().hasUserToken()) {
        return TopFan.Request.TOKEN_USER;
      } else {
        return TopFan.Request.TOKEN_CLIENT;
      }
    };

    return ChallengeRetrievalService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.ClientTokenService = (function(_super) {

    __extends(ClientTokenService, _super);

    function ClientTokenService() {
      this.currentToken = __bind(this.currentToken, this);

      this.retrieveDidComplete = __bind(this.retrieveDidComplete, this);

      this.retrieveDidError = __bind(this.retrieveDidError, this);

      this.retrieveDidSucceed = __bind(this.retrieveDidSucceed, this);
      return ClientTokenService.__super__.constructor.apply(this, arguments);
    }

    ClientTokenService.include(Spine.Log);

    ClientTokenService.extend(Spine.Events);

    ClientTokenService.prototype.isRetrieving = false;

    ClientTokenService.prototype.retrieve = function() {
      var request;
      if (this.isRetrieving) {
        return;
      }
      this.isRetrieving = true;
      request = new TopFan.Request({
        dataType: 'html',
        headers: {
          Accept: 'text/html'
        },
        contentType: 'application/x-www-form-urlencoded',
        type: 'POST',
        url: '/oauth/token',
        data: {
          grant_type: 'client_credentials',
          client_id: window.buildConfig.clientId,
          client_secret: window.buildConfig.clientSecret
        },
        success: this.retrieveDidSucceed,
        error: this.retrieveDidError
      });
      return request.perform();
    };

    ClientTokenService.prototype.retrieveDidSucceed = function(response) {
      var clientToken;
      this.retrieveDidComplete();
      TopFan.Models.ClientToken.destroyAll();
      clientToken = TopFan.Models.ClientToken.create({
        token: JSON.parse(response).access_token
      });
      return TopFan.Models.ClientToken.trigger('retrieve', clientToken);
    };

    ClientTokenService.prototype.retrieveDidError = function(xhr, error) {
      var _ref;
      this.retrieveDidComplete();
      return this.log("CONNECTION TYPE: " + (typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.connection) != null ? _ref.type : void 0 : void 0));
    };

    ClientTokenService.prototype.retrieveDidComplete = function() {
      return this.isRetrieving = false;
    };

    ClientTokenService.prototype.currentToken = function() {
      var _ref;
      return (_ref = TopFan.Models.ClientToken.first()) != null ? _ref.token : void 0;
    };

    return ClientTokenService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.LocalCachingService = (function(_super) {

    __extends(LocalCachingService, _super);

    function LocalCachingService() {
      this.saveModel = __bind(this.saveModel, this);

      this.loadModel = __bind(this.loadModel, this);

      this.bindModel = __bind(this.bindModel, this);

      this.bindAll = __bind(this.bindAll, this);

      this.loadAll = __bind(this.loadAll, this);
      return LocalCachingService.__super__.constructor.apply(this, arguments);
    }

    LocalCachingService.include(Spine.Log);

    LocalCachingService.prototype.loadAll = function() {
      var klass, _results;
      _results = [];
      for (klass in TopFan.Models) {
        _results.push(this.loadModel(TopFan.Models[klass]));
      }
      return _results;
    };

    LocalCachingService.prototype.bindAll = function() {
      var klass, _results;
      _results = [];
      for (klass in TopFan.Models) {
        _results.push(this.bindModel(TopFan.Models[klass]));
      }
      return _results;
    };

    LocalCachingService.prototype.bindModel = function(klass) {
      var debouncedSave, save,
        _this = this;
      save = function() {
        return _this.saveModel(klass);
      };
      debouncedSave = _.debounce(save, 1000);
      klass.bind('change', debouncedSave);
      return klass.bind('refresh', debouncedSave);
    };

    LocalCachingService.prototype.loadModel = function(klass) {
      var fail, gotFileEntry, gotFilesystem, readFromFilesystem,
        _this = this;
      this.log("Loading " + klass.className + " from filesystem...");
      fail = function(error) {
        return _this.logError("Error loading " + klass.className + " from filesystem", error);
      };
      readFromFilesystem = function(filename) {
        var setFileName;
        setFileName = filename;
        return window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024 * 30, gotFilesystem, fail);
      };
      gotFilesystem = function(filesystem) {
        return function(filesystem) {
          return filesystem.root.getFile(setFileName, {
            create: true,
            exclusive: false
          }, gotFileEntry, fail);
        };
      };
      gotFileEntry = function(fileEntry) {
        var reader;
        reader = new FileReader();
        reader.onerror = fail;
        reader.onloadend = function(evt) {
          var result;
          result = evt.target.result;
          return klass.refresh(result || [], {
            clear: true
          });
        };
        return reader.readAsText(fileEntry);
      };
      return readFromFilesystem("" + klass.className + ".json");
    };

    LocalCachingService.prototype.saveModel = function(klass) {
      var fail, gotFileEntry, gotFileWriter, gotFilesystem, writeToFilesystem,
        _this = this;
      this.log("Writing " + klass.className + " to filesystem...");
      writeToFilesystem = function(filename, data) {
        var setData, setFilename;
        setFilename = filename;
        setData = data;
        return window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFilesystem, fail);
      };
      gotFilesystem = function(filesystem) {
        return function(filesystem) {
          return filesystem.root.getFile(setFilename, {
            create: true,
            exclusive: false
          }, gotFileEntry, fail);
        };
      };
      gotFileEntry = function() {
        return function(fileEntry) {
          return fileEntry.createWriter(gotFileWriter, fail);
        };
      };
      gotFileWriter = function() {
        return function(writer) {
          return writer.write(setData);
        };
      };
      fail = function(error) {
        return _this.logError("Error saving " + klass.className + " to filesystem", error);
      };
      return writeToFilesystem("" + klass.className + ".json", JSON.stringify(klass));
    };

    return LocalCachingService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.LocationService = (function(_super) {
    var MAXIMUM_AGE, THROTTLE, TIMEOUT;

    __extends(LocationService, _super);

    function LocationService() {
      this.getDistanceFromEntry = __bind(this.getDistanceFromEntry, this);

      this.setupCentering = __bind(this.setupCentering, this);

      this.positionHasChanged = __bind(this.positionHasChanged, this);

      this.updateCurrentPosition = __bind(this.updateCurrentPosition, this);

      this.currentPosition = __bind(this.currentPosition, this);

      this.clearWatch = __bind(this.clearWatch, this);

      this.geolocationDidNotSucceed = __bind(this.geolocationDidNotSucceed, this);

      this.geolocationDidSucceed = __bind(this.geolocationDidSucceed, this);

      this.updateCurrentLocation = __bind(this.updateCurrentLocation, this);

      this.watchPosition = __bind(this.watchPosition, this);
      return LocationService.__super__.constructor.apply(this, arguments);
    }

    LocationService.include(Spine.Log);

    LocationService.include(Spine.Events);

    MAXIMUM_AGE = 60000;

    TIMEOUT = 30000;

    THROTTLE = 30000;

    LocationService.prototype.setCenter = function() {
      var currentClient, _ref;
      if (!(currentClient = TopFan.Models.Client.currentClient())) {
        return;
      }
      if ((typeof google !== "undefined" && google !== null ? (_ref = google.maps) != null ? _ref.LatLng : void 0 : void 0) != null) {
        this.centerLatLong = new google.maps.LatLng(currentClient.latitude, currentClient.longitude);
      } else {
        this.centerLatLong = {
          lat: function() {
            return currentClient.latitude;
          },
          lng: function() {
            return currentClient.longitude;
          }
        };
      }
      if (TopFan.AppState.getInstance().isOnline()) {
        return this.trigger('locationSuccess');
      }
    };

    LocationService.prototype.watchPosition = function() {
      var options, throttledFailureCallback, throttledSuccessCallback, _ref;
      options = {
        enableHighAccuracy: true,
        maximumAge: MAXIMUM_AGE,
        timeout: TIMEOUT
      };
      throttledSuccessCallback = _.throttle(this.geolocationDidSucceed, THROTTLE);
      throttledFailureCallback = _.throttle(this.geolocationDidNotSucceed, THROTTLE);
      return this.watchId = (_ref = navigator.geolocation) != null ? _ref.watchPosition(throttledSuccessCallback, throttledFailureCallback, options) : void 0;
    };

    LocationService.prototype.updateCurrentLocation = function() {
      var _ref;
      return (_ref = navigator.geolocation) != null ? _ref.getCurrentPosition(this.geolocationDidSucceed, this.geolocationDidNotSucceed) : void 0;
    };

    LocationService.prototype.geolocationDidSucceed = function(position) {
      console.log('geolocationDidSucceed');
      console.log(position);
      console.log('Geo LT '+position.coords.latitude);
      console.log('Geo LN '+position.coords.longitude);
      var _ref;
      TopFan.AppState.getInstance().setIsLocationServicesEnabled(true);
      this.updateCurrentPosition(position);
      this.positionLatLong = typeof google !== "undefined" && google !== null ? (_ref = google.maps) != null ? typeof _ref.LatLng === "function" ? new _ref.LatLng(this.position.coords.latitude, this.position.coords.longitude) : void 0 : void 0 : void 0;
      console.log(this.centerLatLong);
      if (this.centerLatLong) {
        this.setupCentering();
      }
      if (this.positionHasChanged()) {
        console.log('positionHasChanged');
        return this.trigger('locationSuccess', this.position);
      }
    };

    LocationService.prototype.geolocationDidNotSucceed = function(positionError) {
      TopFan.AppState.getInstance().setIsLocationServicesEnabled(false);
      this.logWarn("Geolocation was not successful - " + positionError.message);
      return this.trigger('locationError');
    };

    LocationService.prototype.clearWatch = function() {
      var _ref;
      return (_ref = navigator.geolocation) != null ? _ref.clearWatch(this.watchId) : void 0;
    };

    LocationService.prototype.currentPosition = function() {
      return this.position;
    };

    LocationService.prototype.updateCurrentPosition = function(position) {
      this.prevPosition = this.position;
      return this.position = position;
    };

    LocationService.prototype.positionHasChanged = function() {
      var _ref, _ref1;
      return ((_ref = this.prevPosition) != null ? _ref.coords : void 0) !== ((_ref1 = this.position) != null ? _ref1.coords : void 0);
    };

    LocationService.prototype.setupCentering = function() {
      var currentClient;
      currentClient = TopFan.Models.Client.currentClient();
      console.log('this.positionLatLong--'+this.positionLatLong);
      console.log('this.centerLatLong--'+this.centerLatLong);
      console.log('TopFan.AppState.getInstance--'+TopFan.AppState.getInstance().isOnline());
      console.log('currentClient--'+currentClient);
      if (!(this.positionLatLong && this.centerLatLong && TopFan.AppState.getInstance().isOnline() && currentClient)) {
        return;
      }
      console.log('disctanc');
      console.log(this.getDistanceFromLatLon(this.positionLatLong.lat(), this.positionLatLong.lng(), this.centerLatLong.lat(), this.centerLatLong.lng()));
      console.log(currentClient.destination_radius);
      return this.usePositionToCenter = this.getDistanceFromLatLon(this.positionLatLong.lat(), this.positionLatLong.lng(), this.centerLatLong.lat(), this.centerLatLong.lng()) <= currentClient.destination_radius;
    };

    LocationService.prototype.getDistanceFromEntry = function(entry) {
      console.log('use position')
      if (this.usePositionToCenter) {
        console.log('Get Use ----');
        if (!this.positionLatLong) {
          return;
        }
        return this.getDistanceFromLatLon(this.positionLatLong.lat(), this.positionLatLong.lng(), entry.latitude, entry.longitude);
      } else {
        if (!this.centerLatLong) {
          return;
        }
        console.log('Get centerLatLong ----');
        return this.getDistanceFromLatLon(this.centerLatLong.lat(), this.centerLatLong.lng(), entry.latitude, entry.longitude);
      }
    };

    LocationService.prototype.getFormattedDistance = function(distance) {
      var val;
      val = distance.singleDecimal().withDelimiter();
      console.log('val--dc---'+val);
      return "" + val + (TopFan.Models.Client.currentClient().distance_measurement);
    };

    LocationService.prototype.getDistanceFromLatLon = function(lat1, lon1, lat2, lon2) {
      console.log('current lat1 '+lat1);
      console.log('current lon1 '+lon1);
      console.log('current lat2 '+lat2);
      console.log('current lon2 '+lon2);
      var R, a, c, dLat, dLon, val;
      R = 6371;
      dLat = this.deg2rad(lat2 - lat1);
      dLon = this.deg2rad(lon2 - lon1);
      a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      val = R * c;
      console.log('val--'+val);
      if (TopFan.Models.Client.currentClient().distance_measurement === 'mi') {
        val = val * 0.6214;
      }
      console.log('val--mi---'+val);
      return val;
    };

    LocationService.prototype.deg2rad = function(deg) {
      return deg * (Math.PI / 180);
    };

    return LocationService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.RewardRedemptionService = (function(_super) {

    __extends(RewardRedemptionService, _super);

    function RewardRedemptionService() {
      return RewardRedemptionService.__super__.constructor.apply(this, arguments);
    }

    RewardRedemptionService.prototype.redeemReward = function(reward_id) {
      var request;
      request = new TopFan.Request({
        type: 'POST',
        token: TopFan.Request.TOKEN_USER,
        url: "/client/redemptions",
        data: JSON.stringify({
          reward_id: reward_id
        }),
        success: function(data) {
          return TopFan.Models.Reward.trigger('redeem', data);
        },
        error: function(xhr, type) {
          console.log('Error redeeming reward', arguments);
          return TopFan.Models.Reward.trigger('redeemError', xhr, type);
        }
      });
      return request.perform();
    };

    return RewardRedemptionService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.RewardRetrievalService = (function(_super) {

    __extends(RewardRetrievalService, _super);

    function RewardRetrievalService() {
      this.retrieveDidSucceed = __bind(this.retrieveDidSucceed, this);

      this.retrieve = __bind(this.retrieve, this);
      return RewardRetrievalService.__super__.constructor.apply(this, arguments);
    }

    RewardRetrievalService.prototype.hasSynced = false;

    RewardRetrievalService.prototype.retrieve = function() {
      var request;
      request = new TopFan.Request({
        type: 'GET',
        token: TopFan.Request.TOKEN_CLIENT,
        url: '/client/rewards',
        success: this.retrieveDidSucceed,
        error: function() {
          return console.log('RewardRetrievalService: Retrieval failed', arguments);
        }
      });
      return request.perform();
    };

    RewardRetrievalService.prototype.retrieveDidSucceed = function(json) {
      var index, record, _i, _len;
      this.hasSynced = true;
      TopFan.Models.Reward.deleteAll();
      for (index = _i = 0, _len = json.length; _i < _len; index = ++_i) {
        record = json[index];
        record['index'] = index;
      }
      return TopFan.Models.Reward.refresh(json);
    };

    return RewardRetrievalService;

  })(Spine.Singleton);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Services.UserTokenService = (function(_super) {

    __extends(UserTokenService, _super);

    function UserTokenService() {
      this.deleteToken = __bind(this.deleteToken, this);

      this.currentToken = __bind(this.currentToken, this);

      this.retrieveDidComplete = __bind(this.retrieveDidComplete, this);

      this.retrieveDidError = __bind(this.retrieveDidError, this);

      this.retrieveDidSucceed = __bind(this.retrieveDidSucceed, this);
      return UserTokenService.__super__.constructor.apply(this, arguments);
    }

    UserTokenService.include(Spine.Log);

    UserTokenService.extend(Spine.Events);

    UserTokenService.prototype.isRetrieving = false;

    UserTokenService.prototype.retrieve = function(username, password) {
      var request;
      if (this.isRetrieving) {
        return;
      }
      this.isRetrieving = true;
      TopFan.Loader.getInstance().show();
      request = new TopFan.Request({
        dataType: 'html',
        headers: {
          Accept: 'text/html'
        },
        contentType: 'application/x-www-form-urlencoded',
        type: 'POST',
        url: '/oauth/token',
        data: {
          grant_type: 'password',
          client_id: window.buildConfig.clientId,
          client_secret: window.buildConfig.clientSecret,
          username: username,
          password: password
        },
        success: this.retrieveDidSucceed,
        error: this.retrieveDidError,
        complete: function() {
          return TopFan.Loader.getInstance().hide();
        }
      });
      return request.perform();
    };

    UserTokenService.prototype.retrieveDidSucceed = function(response) {
      var userToken;
      this.retrieveDidComplete();
      TopFan.Models.UserToken.destroyAll();
      userToken = TopFan.Models.UserToken.create({
        token: JSON.parse(response).access_token
      });
      return TopFan.Models.UserToken.trigger('retrieve', userToken);
    };

    UserTokenService.prototype.retrieveDidError = function(xhr, error) {
      this.retrieveDidComplete();
      this.logError('Could not retrieve user token', xhr, error);
      return TopFan.Models.UserToken.trigger('retrieveError');
    };

    UserTokenService.prototype.retrieveDidComplete = function() {
      return this.isRetrieving = false;
    };

    UserTokenService.prototype.currentToken = function() {
      var _ref;
      return (_ref = TopFan.Models.UserToken.first()) != null ? _ref.token : void 0;
    };

    UserTokenService.prototype.deleteToken = function() {
      return TopFan.Models.UserToken.destroyAll();
    };

    return UserTokenService;

  })(Spine.Singleton);

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail"] = (function(context) {
    return (function() {
      var $c, $e, $o, step, stepLength, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='deets'>");
  $o.push("  " + $c(JST['views/shared/_detail_panel_close_button']({
    label: 'Challenge List'
      })));
  if (this.detail_image_path) {
    $o.push("  <div class='image'>\n    <img src='" + ($e($c(this.detail_image_path))) + "'>\n  </div>");
      }
      $o.push("  <div class='title'>" + ($e($c(this.title))) + "</div>");
  if (this.is_instant_reward && this.point_value) {
    $o.push("  <div class='point_value'>" + ($e($c("Instant Reward + " + (this.point_value.withDelimiter()) + " POINTS"))) + "</div>");
  } else if (this.is_instant_reward) {
    $o.push("  <div class='point_value'>Instant Reward</div>");
  } else if (this.point_value) {
    $o.push("  <div class='point_value'>" + ($e($c("" + (this.point_value.withDelimiter()) + " POINTS"))) + "</div>");
      }
  if (this.is_instant_reward) {
    $o.push("  <div class='description'>");
    $o.push("    " + $e($c(this.description)));
    $o.push("    <br>\n    <br>");
    $o.push("    " + $e($c(this.instant_reward_instructions)));
    $o.push("  </div>");
  } else {
    $o.push("  <div class='description'>" + ($e($c(this.description))) + "</div>");
      }
      stepLength = this.challengeSteps().length;
      $o.push("  <div class='validate-title'>");
  if (stepLength > 1) {
    $o.push("    " + $e($c("There are " + stepLength + " steps to this challenge. Click each step below and complete them in any order.")));
  } else {
    $o.push("    There is 1 step to this challenge. Click the step below to complete it.");
      }
      $o.push("  </div>\n</div>\n<div class='challenge-steps list'>");
  if (this.challengeSteps().length) {
    _ref = this.challengeSteps();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      step = _ref[_i];
      $o.push("  " + $c(JST['views/shared/_challenge_step_list_item'](step)));
    }
  } else {
    $o.push("  <div class='empty-list'>");
    $o.push("    " + $e($c("- There are no steps for this challenge -")));
    $o.push("  </div>");
      }
      $o.push("</div>\n<div class='buttons half'>\n  <button class='btn finish-later grey small'>Finish Later</button>\n  <button class='btn primary small validate'>Complete</button>\n</div>\n<br>");
  if (this.locationRestricted()) {
    $o.push("<div class='location-disclaimer'>");
    $o.push("  " + $e($c("* This challenge is location restricted or requires you to check in and may not be available in your area. Please check that location services is turned on for the app \"" + (TopFan.Models.Client.currentClient().name) + "\" in your settings.")));
    $o.push("</div>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_base"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='close'></div>\n<div class='scroll-container'></div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_panels/facebook_like"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/challenge_detail_panels/step_details'](this)));
      $o.push("<div class='inputs'>\n  <button class='btn grey small'>\n    Validate Completion of Step\n  </button>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_panels/geolocation"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/challenge_detail_panels/step_details'](this)));
      $o.push("<div class='inputs'>\n  <button class='btn grey small'>" + ($e($c(this.title))) + "</button>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_panels/scan"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/challenge_detail_panels/step_details'](this)));
      $o.push("<div class='inputs'>\n  <button class='btn grey small'>\n    Scan Code\n  </button>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_panels/step_details"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
  if (this.image_path) {
    $o.push("<div class='image'>\n  <img src='" + ($e($c(this.image_path))) + "'>\n</div>");
      }
      $o.push("<div class='info'>\n  <div class='title'>");
      $o.push("    " + $e($c(this.stepTitle())));
      $o.push("    &nbsp;\n    <span>" + ($e($c(this.messageForState()))) + "</span>\n  </div>\n  <div class='description'>" + ($e($c(this.description))) + "</div>");
  if (this.call_to_action && this.link) {
    $o.push("  <div class='buttons call-to-action'>\n    <button class='btn grey link small'>" + ($e($c(this.call_to_action))) + "</button>\n  </div>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_panels/twitter_follow"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/challenge_detail_panels/step_details'](this)));
      $o.push("<div class='inputs'>\n  <button class='btn grey small'>\n    Validate\n  </button>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_detail_panels/use_code"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/challenge_detail_panels/step_details'](this)));
      $o.push("<div class='inputs'>\n  <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' value='" + ($e($c(this.value ? this.value : ''))) + "'>\n  <button class='btn grey small'>\n    Enter\n  </button>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenge_step_detail"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='close'></div>\n<div class='step-scroll-container'>\n  <div class='deets step-deets'>\n    <div class='navigation'>");
  $o.push("      " + $c(JST['views/shared/_detail_panel_close_button']({
    label: 'Challenge Details'
      })));
      $o.push("    </div>\n    <div class='content'></div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/challenges"] = (function(context) {
    return (function() {
      var $c, $e, $o, challenge, completion, _i, _j, _len, _len1, _ref, _ref1;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='challenges' data-title='Challenges'></div>");
  $o.push("" + $c(JST['headshot/templates/headshot']({
    spacer: true
      })));
      $o.push("<div class='buttons half'>\n  <div class='active btn dark small' id='available_challenges_button'>\n    Available\n  </div>\n  <div class='btn dark small' id='earned_challenges_button'>\n    Completed\n  </div>\n</div>\n<div data-bindable='scrollable-content' data-top='145px'>\n  <div class='list tall challenges-tab " + (this.challenges.length ? '' : 'no-results') + "'>");
  if (this.challenges.length) {
    _ref = this.challenges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      challenge = _ref[_i];
      $o.push("    " + $c(JST['views/shared/_challenges_list_item'](challenge)));
    }
  } else {
    $o.push("    <div class='empty-list'>");
    $o.push("      " + $e($c("- There are no current challenges -")));
    $o.push("    </div>");
      }
      $o.push("  </div>\n  <div class='list tall completions-tab " + (this.completions.length ? '' : 'no-results') + "' style='display: none;'>");
  if (this.completions.length) {
    _ref1 = this.completions;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      completion = _ref1[_j];
      $o.push("    " + $c(JST['views/shared/_completion_list_item'](completion)));
    }
  } else {
    $o.push("    <div class='empty-list'>");
    $o.push("      " + $e($c("- You have not completed any challenges yet -")));
    $o.push("    </div>");
      }
      $o.push("  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/completion_detail"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='deets'>");
  $o.push("  " + $c(JST['views/shared/_detail_panel_close_button']({
    label: 'Completion List'
      })));
  if (this.detail_image_path) {
    $o.push("  <div class='image'>\n    <img src='" + ($e($c(this.detail_image_path))) + "'>\n  </div>");
      }
      $o.push("  <div class='title'>" + ($e($c(this.title))) + "</div>");
  if (this.is_instant_reward && this.points_earned) {
    $o.push("  <div class='point_value'>" + ($e($c("Earned Instant Reward + " + (this.points_earned.withDelimiter()) + " Reward Points on " + (TimeUtil.displayDatetime(this.completed_at))))) + "</div>");
  } else if (this.is_instant_reward) {
    $o.push("  <div class='point_value'>" + ($e($c("Instant Reward completed on " + (TimeUtil.displayDatetime(this.completed_at))))) + "</div>");
  } else if (this.points_earned) {
    $o.push("  <div class='point_value'>" + ($e($c("Earned " + (this.points_earned.withDelimiter()) + " Reward Points on " + (TimeUtil.displayDatetime(this.completed_at))))) + "</div>");
      }
  if (this.is_instant_reward) {
    $o.push("  <div class='description'>");
    $o.push("    " + $e($c(this.description)));
    $o.push("    <br>\n    <br>");
    $o.push("    " + $e($c(this.instant_reward_instructions)));
    $o.push("  </div>");
  } else {
    $o.push("  <div class='description'>" + ($e($c(this.description))) + "</div>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/content_section"] = (function(context) {
    return (function() {
      var $c, $e, $o, entry, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='" + ($e($c(this.icon))) + "' data-title='" + ($e($c(escape(this.primary_text)))) + "'></div>");
  if (this.promo_image_path) {
    $o.push("" + $c(JST['views/shared/_promo_image']({
      image: this.promo_image_path
    })));
    $o.push("<div data-bindable='headshot' data-bio='" + ($e($c(escape(TopFan.Models.Client.currentClient().bioAsHTML())))) + "'></div>");
      }
      $o.push("<div data-bindable='scrollable-content' data-top='222px'>");
  if (this.content_section_entries && this.content_section_entries.length) {
    $o.push("  <div class='content-entries list short'>");
    _ref = this.content_section_entries;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entry = _ref[_i];
      $o.push("    " + $c(JST['views/shared/_content_entry_list_item'](entry)));
    }
    $o.push("  </div>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/entry_detail"] = (function(context) {
    return (function() {
      var $c, $e, $o, offer, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/shared/_map_placeholder']()));
      $o.push("<div class='entryBlock'>\n  <div class='entryContent--image'>");
  if (this.entry.image_path && TopFan.AppState.getInstance().isOnline()) {
    $o.push("    <img class='entry--image' src='" + ($e($c(this.entry.image_path))) + "'>");
  } else {
    $o.push("    <div class='" + (['listItemIcon--short', "" + ($e($c(this.entry.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(this.entry.color))) + ";background-image: url(\"" + ($e($c(this.entry.icon_path))) + "\") !important;'></div>");
  }
      $o.push("    <div class='entry--basics'>\n      <div class='entry--name'>" + ($e($c(this.entry.name))) + "</div>\n    <div style='position: relative;'>  <div class='entry--distance' style='position: absolute;'>" + ($c(this.entry.distanceDescriptionD(true))) + "</div>\n    ");
      $o.push("  <div class='entryActions' style='border: 0;position: absolute;right: 0; top: -18px;'>\n  <div class=' icon js-redirect-Topfan vm_topfan_feed'></div>   <div class='hidden icon js-unfavorite vm_favorite_remove'></div>\n    <div class='icon js-favorite vm_favorite_add'></div>");
      if (TopFan.AppState.getInstance().isOnline()) {
        $o.push("    <div class='icon js-driving-directions vm_driving_directions'></div>");
      }
      $o.push("  </div> </div>");
      $o.push("</div>\n  </div>\n</div>\n<div data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px;'>");
  if (this.entry.address || (this.entry.city && this.entry.state) || this.entry.phone_number || this.entry.website) {
    $o.push("  <div class='entryBlock'>\n    <div class='entryContent--text'>");
    if (this.entry.address) {
      $o.push("      <div class='entry--address'>" + ($e($c(this.entry.address))) + "</div>");
    }
    if (this.entry.city && this.entry.state) {
      $o.push("      <div class='entry--cityStateZip'>" + ($e($c("" + this.entry.city + ", " + this.entry.state + " " + this.entry.zip))) + "</div>");
    }
    if (this.entry.phone_number) {
      $o.push("      <div class='entry--phoneNumber'>\n        <a href='tel:" + ($e($c(this.entry.phone_number))) + "'>" + ($e($c(this.entry.phone_number))) + "</a>\n      </div>");
    }
    if (this.entry.website) {
      $o.push("      <div class='entry--spacer'></div>\n      <div class='entry--website'>\n        <a href='" + ($e($c(this.entry.website))) + "' data-open-externally-ios='" + ($e($c(this.entry.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-android='" + ($e($c(this.entry.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-browser='" + ($e($c(this.entry.use_restricted_internal_browser ? 'yes' : 'no'))) + "'>Website</a>\n      </div>");
    }
    $o.push("    </div>\n  </div>");
      }
  if (this.entry.description && this.entry.description.match(/^\s*$/) === null) {
    $o.push("  <div class='entryBlock'>\n    <div class='entryContent--text'>\n      <div class='entry--description'>");
    $o.push("        " + $c(this.entry.descriptionAsHTML()));
    $o.push("        <div>  " +localStorage.getItem('subcat_filter_label')+": "+ ($e($c(this.entry.subcategoriesAsString()))) + "</div>\n  <div>  " +localStorage.getItem('feature_filter_label')+": "+ ($e($c(this.entry.featuresAsString()))) + "</div>\n   </div>\n    </div>\n  </div>");
      }
      /*
      $o.push("  <div class='entryActions'>\n    <div class='hidden icon js-unfavorite vm_favorite_remove'></div>\n    <div class='icon js-favorite vm_favorite_add'></div>");
  if (TopFan.AppState.getInstance().isOnline()) {
    $o.push("    <div class='icon js-driving-directions vm_driving_directions'></div>");
      }
      $o.push("  </div>");
      */
  if (this.entry.activeOffers().length > 0) {
    _ref = this.entry.activeOffers();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      offer = _ref[_i];
      $o.push("  <div class='entryBlock'>\n    <div class='entryContent--text'>\n      <div class='entry--offerName'>" + ($e($c(offer.name))) + "</div>\n      <div class='entry--offerDescription'>" + ($c(offer.descriptionAsHTML())) + "</div>\n    </div>\n  </div>");
    }
      }
  if (this.entry.additional_description && this.entry.additional_description.match(/^\s*$/) === null) {
    $o.push("  <div>\n    <div class='entryContent--text'>\n      <div class='entry--description'>" + ($c(this.entry.additionalDescriptionAsHTML())) + "</div>\n    </div>\n  </div>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/filter_detail"] = (function(context) {
    return (function() {
      var $c, $e, $o, item, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='close'></div>\n<div class='deets'>\n  <div class='navigation'>");
  $o.push("    " + $c(JST['views/shared/_detail_panel_close_button']({
    label: this.backTitle
      })));
      $o.push("  </div>\n  <div class='content'>\n    <div class='title'>" + ($e($c(this.title))) + "</div>\n    <ul>");
  _ref = this.items;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    item = _ref[_i];
    $o.push("      <li>\n        <div class='item' data-filter='" + ($e($c(item))) + "'>\n          <span>" + ($e($c(item))) + "</span>\n        </div>\n      </li>");
      }
      $o.push("    </ul>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/help_info"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='help' data-title='Help/Info'></div>");
  $o.push("" + $c(JST['headshot/templates/headshot']({
    spacer: true
      })));
      $o.push("<div data-bindable='scrollable-content' data-top='95px'>\n  <div class='help-info list short'>");
  $o.push("    " + $c(JST['views/shared/_help_info_list_item']({
    title: 'Send Feedback',
    description: 'Tell us what you like and suggest how we can improve!',
    body: 'Email Now',
    link: "mailto:customer.support@top-fan.com?subject=" + (TopFan.Models.Client.currentClient().name) + "%20TopFan%20App%20Feedback"
      })));
  $o.push("    " + $c(JST['views/shared/_help_info_list_item']({
    title: 'Frequently Asked Questions',
    description: 'And answers too!',
    link: "http://www.top-fan.com/faq"
      })));
  $o.push("    " + $c(JST['views/shared/_help_info_list_item']({
    title: 'Reward Program Terms & Rules',
    description: 'All about the Challenge and Rewards Program',
    link: "http://www.top-fan.com/rewards_program"
      })));
  $o.push("    " + $c(JST['views/shared/_help_info_list_item']({
    title: 'Privacy Policy',
    description: 'We are serious about protecting your privacy',
    link: "http://www.top-fan.com/privacy"
      })));
  $o.push("    " + $c(JST['views/shared/_help_info_list_item']({
    title: 'General Terms of Use',
    description: 'What you need to know about using this App',
    link: "http://www.top-fan.com/terms"
      })));
      $o.push("    <div class='item'>\n      <div class='text'>\n        <div class='title'>Version Information</div>\n        <div class='description'>" + ($c("TopFan&reg; Platform Build " + window.buildConfig.buildNumber + " for " + window.buildConfig.platformName)) + "</div>\n      </div>\n    </div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/icon_grid"] = (function(context) {
    return (function() {
      var $c, $e, $o, currentClient, section, _i, _j, _len, _len1, _ref, _ref1;
      $o = [];
      currentClient = TopFan.Models.Client.currentClient();
  if (currentClient.color_palette_size === "3inRow") {
    $o.push("<div data-bindable='promo-image' data-height='" + ($e($c(this.promoHeight))) + "' data-image-path='" + ($e($c(this.client.promo_image_url))) + "'></div>\n<div class='banner-client_name'>" + ($e($c(this.client.name))) + "</div>\n<div data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px;' data-top='" + ($e($c(this.scrollerTop))) + "'>\n  <div class='grid-list_sections_next' data-bindable='icon-grid'>");
    _ref = TopFan.Models.ListSection.inOrder();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      section = _ref[_i];
      if (section.icon) {
        $o.push("    <div class='" + (['icon', "" + ($e($c(section.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(section.color))) + ";' data-id='" + ($e($c(section.id))) + "' data-slug='" + ($e($c(section.slug))) + "' data-external-link='" + ($e($c(section.external_link))) + "' data-open-externally-on-ios='" + ($e($c(section.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-on-android='" + ($e($c(section.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-internal-browser='" + ($e($c(section.use_restricted_internal_browser ? 'yes' : 'no'))) + "'></div>");
      } else {
        $o.push("    <div class='icon vm_bar'></div>");
      }
    }
    $o.push("  </div>\n</div>\n<div class='name-pop'></div>");
  } else {
    $o.push("<div data-bindable='promo-image' data-height='" + ($e($c(this.promoHeight))) + "' data-image-path='" + ($e($c(this.client.promo_image_url))) + "'></div>\n<div class='banner-client_name'>" + ($e($c(this.client.name))) + "</div>\n<div data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px;' data-top='" + ($e($c(this.scrollerTop))) + "'>\n  <div class='grid-list_sections' data-bindable='icon-grid'>");
    _ref1 = TopFan.Models.ListSection.inOrder();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      section = _ref1[_j];
      if (section.icon) {
        $o.push("    <div class='" + (['icon', "" + ($e($c(section.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(section.color))) + ";' data-id='" + ($e($c(section.id))) + "' data-slug='" + ($e($c(section.slug))) + "' data-external-link='" + ($e($c(section.external_link))) + "' data-open-externally-on-ios='" + ($e($c(section.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-on-android='" + ($e($c(section.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-internal-browser='" + ($e($c(section.use_restricted_internal_browser ? 'yes' : 'no'))) + "'></div>");
      } else {
        $o.push("    <div class='icon vm_bar'></div>");
      }
    }
    $o.push("  </div>\n</div>\n<div class='name-pop'></div>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/list_section"] = (function(context) {
    return (function() {
      var $c, $e, $o, category, entry, feature, featuredEntries, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/shared/_map_placeholder']()));
      $o.push("<div class='filter-nav'>\n  <div class='" + (['section-icon', 'swipeable', 'icon', "" + ($e($c(this.sectionObj.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(this.sectionObj.color))) + ";background-image: url(\"" + ($e($c(this.sectionObj.icon_path))) + "\") !important;'></div>\n  <div class='content swipeable'>\n    <div class='filter-results'>\n      <div class='amt'>0</div>\n      <div class='label'>results</div>\n    </div>\n    <div class='filter-buttons'>");
  if (this.entryManager.hasOffers()) {
    $o.push("      <div class='icon js-offers-filter vm_deals dollar-sign'></div>");
      }
  if (this.entryManager.categoriesForFilter().length > 0) {
    if($e($c(this.sectionObj.subcat_filter_icon_url))) {
      $o.push("      <div class='" + (['icon', 'js-category-filter', 'vm_filter', "" + ($e($c(this.sectionObj.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' data-active-color='" + ($e($c(this.sectionObj.color))) + "' data-target='.category-filter' style='background-image: url("+($e($c(this.sectionObj.subcat_filter_icon_url)))+") !important'></div>");
    }
  }
  if (this.entryManager.featuresForFilter().length > 0) {
    if($e($c(this.sectionObj.feature_filter_icon_url))) {
      $o.push("      <div class='icon js-feature-filter vm_features' data-active-color='" + ($e($c(this.sectionObj.color))) + "' data-target='.feature-filter' style='background-image: url("+($e($c(this.sectionObj.feature_filter_icon_url)))+") !important'></div>");
    }
  }
      $o.push("    </div>\n  </div>\n</div>\n<div class='scroll-content' data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px;'>");
      featuredEntries = _(this.entryManager.featuredEntries()).shuffle();
  if (featuredEntries.length > 0) {
  
    $o.push("  <div class='featured-entries'>\n    <div class='featured-scroller' style='width: " + ($e($c(featuredEntries.length * 150 + 12))) + "px;'>");
    for (_i = 0, _len = featuredEntries.length; _i < _len; _i++) {
      entry = featuredEntries[_i];
      var hoff = 0;
      if(entry.activeOffers().length!=0) {
        hoff = 1;
      } else {
        hoff = 0;
      }
      $o.push("      <div class='featured-entry js-item' data-features='" + ($e($c(entry.features))) + "' data-subcategories='" + ($e($c(entry.subcategories))) + "' data-offers='" + hoff + "'  data-id='" + ($e($c(entry.id))) + "'>\n        <div class='featured-image'>");
      if (entry.featured_image_path && TopFan.AppState.getInstance().isOnline()) {
        $o.push("          <img src='" + ($e($c(entry.featured_image_path))) + "'>");
      } else {
        $o.push("          <div class='" + (['icon', "" + ($e($c(entry.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(entry.color))) + "'></div>");
      }
      $o.push("        </div>\n        <div class='featured-name'>" + ($e($c(entry.name))) + "</div>\n      </div>");
    }
    $o.push("    </div>\n  </div>");
      }
      $o.push("  <div class='list-entries'></div>\n</div>\n<div class='category-filter filter-drop hidden'>\n  <div class='drop-arrow'></div>\n  <div class='drop-title'>\n"+($e($c(this.sectionObj.subcat_filter_label)))+"\n  </div>\n  <div class='drop-items'>\n    <div class='active drop-item' data-value='all'>\n      All "+($e($c(this.sectionObj.subcat_filter_label)))+"\n    </div>");
  _ref = this.entryManager.categoriesForFilter();
  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
    category = _ref[_j];
    $o.push("    <div class='drop-item' data-value='" + ($e($c(category))) + "'>");
    $o.push("      " + $e($c(category)));
    $o.push("    </div>");
      }
      $o.push("  </div>\n</div>\n<div class='feature-filter filter-drop hidden'>\n  <div class='drop-arrow'></div>\n  <div class='drop-title'>\n"+($e($c(this.sectionObj.feature_filter_label)))+"\n  </div>\n  <div class='drop-items'>\n    <div class='active drop-item' data-value='all'>\n      All "+($e($c(this.sectionObj.feature_filter_label)))+"\n    </div>");
  _ref1 = this.entryManager.featuresForFilter();
  for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
    feature = _ref1[_k];
    $o.push("    <div class='drop-item' data-value='" + ($e($c(feature))) + "'>");
    $o.push("      " + $e($c(feature)));
    $o.push("    </div>");
      }
      $o.push("  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/loader"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='loading'>\n  <div class='text'>Loading...</div>\n  <div class='rotating spinner'></div>\n</div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/login"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='fan-settings' data-title='Account Login'></div>\n<form id='login' autocomplete='off'>\n  <fieldset>\n    <div class='control-group'>\n      <div class='controls'>\n        <input class='field-xlarge' id='email' type='email' name='email' placeholder='Email Address' autocapitalize='off' autocorrect='off'>\n      </div>\n    </div>\n    <div class='control-group'>\n      <div class='controls'>\n        <input class='field-xlarge' id='password' type='password' name='password' placeholder='Password' autocapitalize='off' autocorrect='off'>\n      </div>\n    </div>\n  </fieldset>\n  <div class='buttons form'>\n    <button class='btn grey small' id='signup_button' type='button'>Sign Up</button>\n    <button class='btn primary small' id='login_button'>Login</button>\n  </div>\n</form>\n<div class='forgot-password'>\n  <a href='" + ($e($c(TopFan.Models.Client.currentClient().user_password_reset))) + "' data-user-restricted-browser='yes'>Having trouble signing in?</a>\n</div>\n<div class='note'>\n  Note: Your same login for any other TopFan app will work\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/markdown"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
  if (!this.isListSection) {
    $o.push("<div class='section-title' data-bindable='section-title' data-icon='" + ($e($c(this.icon))) + "' data-title='" + ($e($c(escape(this.primary_text)))) + "'></div>");
    $o.push("" + $c(JST['headshot/templates/headshot']({
      spacer: true
    })));
    $o.push("<div data-bindable='scrollable-content' data-top='" + ($e($c(this.scrollerTop))) + "px'>\n  <div class='content-area'>" + ($c(this.content)) + "</div>\n</div>");
  } else {
    $o.push("<div class='content-area' data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px'>");
    $o.push("  " + $c(this.content));
    $o.push("</div>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/mobile_concierge"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='concierge-portrait' style='height: " + ($e($c(Math.floor($(window).width() * .57)))) + "px;'></div>\n<div class='concierge-title'>Mobile Concierge</div>\n<div class='concierge-interview-questions'></div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/mobile_concierge_results"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("" + $c(JST['views/shared/_map_placeholder']()));
      $o.push("<div class='concierge-title swipeable'>Your Mobile Concierge Recommends:</div>\n<div class='concierge-results scroll-content' data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px;'>\n  <div class='swipe-holder'></div>\n  <div class='showhide swipe-directions'>Swipe Left or Right to see more Recommendations</div>\n  <div class='concierge-actions'>\n    <div class='concierge-restart js-restart-concierge'>\n      <div class='icon vm_restart'></div>\n      <div class='text'>Change your Mobile Concierge Preferences</div>\n    </div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/music_player"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='music' data-title='Music'></div>");
  $o.push("" + $c(JST['headshot/templates/headshot']({
    spacer: true
      })));
      $o.push("<div class='music-player'>\n  <div class='track-player'>\n    <div class='track-art'></div>\n    <div class='track-buffering'>\n      <div class='spinner'></div>\n    </div>\n    <div class='player-interface'>\n      <div class='player-inner'>\n        <div class='cache-player'>\n          <div class='cp-bg-img'></div>\n          <div class='cp-loaded'></div>\n          <div class='cp-progress'>\n            <div class='cp-fg-img'></div>\n          </div>\n          <div class='cp-playhead'>\n            <div class='cp-time-cur'>00:00</div>\n            <div class='cp-time-total'>00:00</div>\n          </div>\n          <div class='player-disabler'></div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class='track-info'>\n    <div class='now-playing'>Now Playing:</div>\n    <div class='track-title'>No Track Data</div>\n    <div class='player-controls'>\n      <div class='player-button prev'></div>\n      <div class='hidden pause player-button'></div>\n      <div class='play player-button'></div>\n      <div class='next player-button'></div>\n      <div class='buy-now-link'>Buy Now</div>\n    </div>\n    <div class='btn dark image sort'></div>\n    <div class='info-disabler'></div>\n  </div>\n  <div class='track-list' data-bindable='scrollable-content' data-top='222px'>\n    <div class='content-entries list short tracks'></div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/music_player_list"] = (function(context) {
    return (function() {
      var $c, $e, $o, count, track, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
  if (this.musicData && this.musicData.length) {
    count = 0;
    _ref = this.musicData;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      track = _ref[_i];
      $o.push("" + $c(JST['views/shared/_music_player_list_item']({
        track: track,
        index: count
      })));
      count += 1;
    }
  } else {
    $o.push("<div class='empty-list'>");
    $o.push("  " + $e($c("- There is no music available at this time -")));
    $o.push("</div>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/other_apps"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='topfan' data-title='Other TopFan Apps'></div>\n<div class='header-box'>\n  <div class='topfan-logo'></div>\n  <div class='btn dark image sort'></div>\n</div>\n<div data-bindable='scrollable-content' data-top='126px'>\n  <div class='list other-apps tall'></div>\n</div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/other_apps_list"] = (function(context) {
    return (function() {
      var $c, $e, $o, app, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
  if (this.otherApps.length) {
    _ref = this.otherApps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      app = _ref[_i];
      if (app.name !== TopFan.Models.Client.currentClient().name) {
        $o.push("" + $c(JST['views/shared/_other_apps_list_item'](app)));
      }
    }
  } else {
    $o.push("<div class='empty-list'>");
    $o.push("  " + $e($c("- There are no other apps available at this time -")));
    $o.push("</div>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/reward_detail"] = (function(context) {
    return (function() {
      var $c, $o;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='close'></div>\n<div class='deets'>\n  <div class='navigation'>");
  $o.push("    " + $c(JST['views/shared/_detail_panel_close_button']({
    label: 'Reward List'
      })));
      $o.push("  </div>\n  <div class='content'>\n    <div class='left'>\n      <div class='image'></div>\n      <div class='btn primary redeem smaller'>Redeem Points</div>\n    </div>\n    <div class='right'>\n      <div class='title'></div>\n      <div class='point_value'></div>\n      <div class='body'></div>\n      <div class='description'></div>\n    </div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/rewards"] = (function(context) {
    return (function() {
      var $c, $e, $o, reward, _i, _len, _ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='rewards' data-title='Rewards'></div>");
  $o.push("" + $c(JST['headshot/templates/headshot']({
    spacer: true
      })));
      $o.push("<div class='points'>\n  <div class='title'>Points</div>\n  <div class='header-box'>");
  if (TopFan.Services.AccountService.getInstance().currentAccount()) {
    $o.push("    <div class='redeemable totals'>\n      <div class='label'>Redeemable</div>\n      <div class='total'>0</div>\n    </div>\n    <div class='lifetime totals'>\n      <div class='label'>Lifetime</div>\n      <div class='total'>0</div>\n    </div>");
  } else {
    $o.push("    <div class='not-logged-in'>\n      Login to see your current points and Fan Rank\n    </div>");
      }
      $o.push("  </div>\n</div>\n<div data-bindable='scrollable-content' data-top='202px'>\n  <div class='list tall rewards " + (this.rewards.length ? '' : 'no-results') + "'>");
  if (this.rewards.length) {
    _ref = this.rewards;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      reward = _ref[_i];
      $o.push("    " + $c(JST['views/shared/_reward_list_item'](reward)));
    }
  } else {
    $o.push("    <div class='empty-list'>");
    $o.push("      " + $e($c("- There are no current rewards -")));
    $o.push("    </div>");
      }
      $o.push("  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/search"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='search-input-container'>\n  <div class='search-wrapper'>\n    <form>\n      <input class='search-input' autofocus='autofocus' type='text' autocapitalize='none' autocorrect='off' placeholder='Keyword Search'>\n    </form>\n    <div class='clear-x hidden'></div>\n  </div>\n</div>\n<div data-bindable='scrollable-content' style='height: " + ($e($c(this.scrollerHeight))) + "px;'>\n  <div class='list-entries'></div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_challenge_step_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item " + (this.state()) + "' data-id='" + ($e($c(this.id))) + "'>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: "right " + (this.state() === 'valid' ? 'no-arrow' : void 0),
    color: this.state() === 'valid' ? '#8e8e8e' : this.challenge().background_color
      })));
      $o.push("  <table class='display-table'>\n    <tr>\n      <td>\n        <div class='text'>\n          <div class='title'>");
      $o.push("            " + $e($c(this.stepTitle())));
      $o.push("            &nbsp;\n            <span>" + ($e($c(this.messageForState()))) + "</span>\n          </div>\n          <div class='description'>" + ($e($c(StringUtil.truncate(this.title, 100, '...')))) + "</div>\n          <div class='complete' style='color: " + ($e($c(this.challenge().background_color))) + ";'>Complete Step</div>\n        </div>\n      </td>\n    </tr>\n  </table>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_challenges_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item " + (this.badge_image_path ? 'has-image' : '') + " no-description' data-id='" + ($e($c(this.id))) + "'>");
  if (this.badge_image_path) {
    $o.push("  <img src='" + ($e($c(this.badge_image_path))) + "'>");
      }
      $o.push("  <div class='text'>\n    <div class='title'>" + ($e($c(this.title))) + "</div>");
  if (this.is_instant_reward && this.point_value) {
    $o.push("    <div class='point_value'>" + ($e($c("Instant Reward + " + (this.point_value.withDelimiter()) + " Points"))) + "</div>");
  } else if (this.is_instant_reward) {
    $o.push("    <div class='point_value'>Instant Reward</div>");
  } else if (this.point_value) {
    $o.push("    <div class='point_value'>" + ($e($c("" + (this.point_value.withDelimiter()) + " Reward Points"))) + "</div>");
      }
      $o.push("  </div>");
  if (!this.completed_at) {
    $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
      direction: 'right',
      color: this.background_color
    })));
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_completion_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item " + (this.badge_image_path ? 'has-image' : '') + "' data-id='" + ($e($c(this.id))) + "'>");
  if (this.badge_image_path) {
    $o.push("  <img src='" + ($e($c(this.badge_image_path))) + "'>");
      }
      $o.push("  <div class='text'>\n    <div class='clipped title'>" + ($e($c(this.title))) + "</div>");
  if (this.is_instant_reward && this.points_earned) {
    $o.push("    <div class='point_value'>" + ($e($c("Earned Instant Reward + " + (this.points_earned.withDelimiter()) + " Reward Points on " + (TimeUtil.displayDatetime(this.completed_at))))) + "</div>");
  } else if (this.is_instant_reward) {
    $o.push("    <div class='point_value'>" + ($e($c("Instant Reward completed on " + (TimeUtil.displayDatetime(this.completed_at))))) + "</div>");
  } else if (this.points_earned) {
    $o.push("    <div class='point_value'>" + ($e($c("Earned " + (this.points_earned.withDelimiter()) + " Reward Points on " + (TimeUtil.displayDatetime(this.completed_at))))) + "</div>");
      }
      $o.push("  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: 'right',
    color: this.background_color
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_content_entry_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item " + (this.image_path && TopFan.AppState.getInstance().isOnline() ? 'has-image' : '') + "' data-link='" + ($e($c(this.link))) + "' data-open-externally-ios='" + ($e($c(this.open_externally_on_ios ? 'yes' : 'no'))) + "' data-open-externally-android='" + ($e($c(this.open_externally_on_android ? 'yes' : 'no'))) + "' data-use-restricted-browser='" + ($e($c(this.use_restricted_internal_browser ? 'yes' : 'no'))) + "'>");
  if (this.image_path && TopFan.AppState.getInstance().isOnline()) {
    $o.push("  <img src='" + ($e($c(this.image_path))) + "'>");
      }
      $o.push("  <div class='text'>\n    <div class='clipped title'>" + ($e($c(this.title))) + "</div>\n    <div class='clipped description'>" + ($e($c(this.description))) + "</div>\n    <div class='body'>" + ($e($c(this.call_to_action))) + "</div>\n  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: "right"
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_detail_panel_close_button"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='return-btn'>\n  <span class='caret west'></span>\n  <span class='label'>" + ($e($c(this.label))) + "</span>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_help_info_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item' data-link='" + ($e($c(this.link))) + "'>\n  <div class='text'>\n    <div class='clipped title'>" + ($e($c(this.title))) + "</div>\n    <div class='description'>" + ($e($c(this.description))) + "</div>\n    <div class='body'>" + ($e($c(this.body ? this.body : 'View Now'))) + "</div>\n  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: 'right'
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_interview_question"] = (function(context) {
    return (function() {
      var $c, $e, $o, answer, index, question, _i, _j, _len, _len1, _ref, _ref1;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='question-text'>" + ($e($c(this.questions[this.index].question))) + "</div>\n<div class='answers'>\n  <select>");
  _ref = this.questions[this.index].interview_answers;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    answer = _ref[_i];
    $o.push("    <option value='" + ($e($c(answer.id))) + "'>" + ($e($c(answer.answer))) + "</option>");
      }
      $o.push("  </select>\n</div>\n<div class='btn next-action primary'>Next</div>\n<div class='paging-dots'>");
  _ref1 = this.questions;
  for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
    question = _ref1[index];
    $o.push("  <div class='" + (['dot', "" + ($e($c(index === this.index ? 'active' : '')))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "'></div>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_list_colored_arrow"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='colored-arrow " + (this.direction ? this.direction : 'right') + "'>");
  if (this.color) {
    if (this.direction.indexOf('no-arrow') === -1) {
      $o.push("  <div class='arrow' style='border-color: " + ($e($c(this.color))) + "'></div>");
    } else {
      $o.push("  <div class='arrow'></div>");
    }
    $o.push("  <div class='solid' style='background-color: " + ($e($c(this.color))) + "'></div>");
  } else {
    $o.push("  <div class='arrow'></div>\n  <div class='solid'></div>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_list_entry_divider"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='js-divider listDivider'>");
      $o.push("  " + $e($c(this.title)));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_list_entry_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='js-item listItem--short' data-id='" + ($e($c(this.entry.id))) + "' data-section-id='" + ($e($c(this.entry.list_section_id))) + "'>");
  if (this.entry.image_path && TopFan.AppState.getInstance().isOnline()) {
    $o.push("  <img class='entry--image' src='" + ($e($c(this.entry.image_path))) + "'>");
  } else {
     $o.push("  <div class='" + (['listItemIcon--short', "" + ($e($c(this.entry.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='" + ($e($c(this.color ? "background-color: " + this.color + ";background-image:url('" + (this.entry.icon_path.replace('/&#47;/g', '/')) + "') !important;" : "background-image:url('" + (this.entry.icon_path.replace('/&#47;/g', '/')) + "') !important;"))) + "'></div>");
      }
      $o.push("  <div class='listItem__entryInfo--short'>\n    <div class='entry--name'>" + ($e($c(this.entry.name))) + "</div>\n    <div class='entry--distance js-distance'>" + ($c(this.entry.distanceDescription(false))) + "</div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_list_page_down"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='down js-page-down list-page-btn'>PAGE DOWN</div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_list_page_up"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<div class='js-page-up list-page-btn up'>PAGE UP</div>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_list_section_icon"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='" + (['icon', "" + ($e($c(this.section.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(this.section.color))) + ";' data-color='" + ($e($c(this.section.color))) + "' data-id='" + ($e($c(this.section.id))) + "'></div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_map_placeholder"] = (function(context) {
    return (function() {
      var $o;
      $o = [];
  if (TopFan.AppState.getInstance().isOnline()) {
    $o.push("<div class='map-placeholder'></div>");
  } else {
    $o.push("<div class='map-image'>\n  <img src='assets/static_google_map.png'>\n  <div class='no-internet-disclaimer'>\n    No Internet Connection: Distances\n    <br>\n    Calculated from Destination Center\n  </div>\n</div>");
      }
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_music_player_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='item " + (this.track.promo_image_path ? 'has-image' : '') + "' data-track-index='" + ($e($c(this.index))) + "'>");
  if (this.track.promo_image_path) {
    $o.push("  <img src='" + ($e($c(this.track.promo_image_path))) + "'>");
      }
      $o.push("  <div class='text'>\n    <div class='clipped title'>" + ($e($c(this.track.name))) + "</div>\n    <div class='clipped description'>" + ($e($c(this.track.description))) + "</div>\n    <div class='body'>Listen</div>\n    <div class='play-count'>" + ($e($c("" + (this.track.play_count.withDelimiter()) + " Play" + (this.track.play_count === 1 ? '' : 's')))) + "</div>\n  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: "right"
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_no_list_results"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='entry--name' style='text-align: center; padding: 20px;'>" + ($e($c(this.message))) + "</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_other_apps_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='has-image item' data-id='" + ($e($c(this.id))) + "' data-link='" + ($e($c(this.link))) + "'>\n  <div class='image'>\n    <img src='" + ($e($c(this.icon_url))) + "'>\n  </div>\n  <div class='text'>\n    <div class='clipped title'>" + ($e($c(this.name))) + "</div>\n    <div class='description'>" + ($e($c(_(this.categories).pluck('name').join(', ')))) + "</div>\n  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: 'right'
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_promo_image"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='promo-image' style='height: " + ($e($c(this.promoHeight ? this.promoHeight : 172))) + "px;'>");
  if (TopFan.AppState.getInstance().isOnline()) {
    $o.push("  <img src='" + ($e($c(this.image))) + "'>");
  } else {
    $o.push("  <img src='assets/promo_default.png'>");
      }
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_reward_list_item"] = (function(context) {
    return (function() {
      var $c, $e, $o, isAvailable;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      isAvailable = this.isAvailable();
      $o.push("<div class='item " + (isAvailable ? 'available' : '') + " " + (this.detail_image_path ? 'has-image' : '') + "' data-id='" + ($e($c(this.id))) + "'>");
  if (this.detail_image_path) {
    $o.push("  <img src='" + ($e($c(this.detail_image_path))) + "'>");
      }
      $o.push("  <div class='text'>\n    <div class='clipped title'>" + ($e($c(this.title))) + "</div>\n    <div class='description'>");
      $o.push("      " + $e($c("" + (this.point_cost.withDelimiter()) + " Points")));
      $o.push("      <span class='available'>" + ($e($c(StringUtil.remaining(this.quantity_available)))) + "</span>\n    </div>");
  if (TopFan.Services.AccountService.getInstance().currentAccount()) {
    $o.push("    <div class='body " + (isAvailable ? '' : 'primary') + "'>" + ($e($c(isAvailable ? 'Enough Points' : "" + (this.remainingPointsToRedeem().withDelimiter()) + " More Points Needed"))) + "</div>");
  } else {
    $o.push("    <div class='body primary'>" + ($e($c("" + (this.point_cost.withDelimiter()) + " More Points Needed"))) + "</div>");
      }
      $o.push("  </div>");
  $o.push("  " + $c(JST['views/shared/_list_colored_arrow']({
    direction: "right",
    color: "" + (isAvailable ? '' : '#8e8e8e')
      })));
      $o.push("</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/shared/_slide_view"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='js-item swipe-view' data-id='" + ($e($c(this.entry.id))) + "'>\n  <div class='contents'>\n    <div class='listItem--short'>\n      <div class='" + (['listItemIcon--short', "" + ($e($c(this.entry.icon)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "' style='background-color: " + ($e($c(this.entry.color))) + ";'></div>\n      <div class='listItem__entryInfo--short'>\n        <div class='entry--name'>" + ($e($c(this.entry.name))) + "</div>\n        <div class='entry--distance js-distance'>" + ($c(this.entry.distanceDescription(true))) + "</div>\n      </div>\n    </div>\n    <div class='entryContent--text'>\n      <div class='entry--description'>");
  if (this.entry.description && this.entry.description.length > 0) {
    $o.push("        " + $c(this.entry.descriptionAsHTML()));
  } else {
    $o.push("        No description available...");
      }
      $o.push("      </div>\n    </div>\n  </div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/signup"] = (function(context) {
    return (function() {
      var $c, $e, $o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='fan-settings' data-title='" + ($e($c(this.isUpdate ? 'Update Account' : 'Sign Up'))) + "'></div>\n<div class='scroll-container' data-bindable='scrollable-content' data-top='44px'>");
  if (this.isUpdate) {
    $o.push("  <button class='btn grey pull-right smaller' id='logout_button'>Logout</button>\n  <div class='clearfixer'></div>");
      }
      $o.push("  <form id='signup'>\n    <fieldset class='inputs'>\n      <div class='control-group'>\n        <label class='control-label'>ACCOUNT INFO:</label>\n        <div class='controls'>\n          <input class='field-xlarge' id='name' type='text' name='name' placeholder='First & Last Name' autocapitalize='on' autocorrect='off' value='" + ($e($c(this.account && this.account.name ? this.account.name : ''))) + "'>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='controls'>\n          <input class='field-xlarge' id='email' type='email' name='email' placeholder='Email Address' autocapitalize='off' autocorrect='off' value='" + ($e($c(this.account && this.account.email ? this.account.email : ''))) + "'>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='controls'>\n          <input class='field-xlarge' id='password' type='password' name='password' placeholder='Password' autocapitalize='off' autocorrect='off'>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='controls'>\n          <input class='field-xlarge' id='password_confirmation' type='password' name='password_confirmation' placeholder='Confirm Password' autocapitalize='off' autocorrect='off'>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='base-row controls gender'>\n          <div class='split-left'>\n            <label for='gender_male'>");
  if (((_ref = this.account) != null ? _ref.gender : void 0) === 'male') {
    $o.push("              <input id='gender_male' type='radio' name='gender' value='male' checked>");
  } else {
    $o.push("              <input id='gender_male' type='radio' name='gender' value='male'>");
      }
      $o.push("              <span>Male</span>\n            </label>\n          </div>\n          <div class='split-right'>\n            <label for='gender_female'>");
  if (((_ref1 = this.account) != null ? _ref1.gender : void 0) === 'female') {
    $o.push("              <input id='gender_female' type='radio' name='gender' value='female' checked>");
  } else {
    $o.push("              <input id='gender_female' type='radio' name='gender' value='female'>");
      }
      $o.push("              <span>Female</span>\n            </label>\n          </div>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='absolute-parent controls'>\n          <label class='date' for='date_of_birth'>");
      $o.push("            " + $e($c(this.account && this.account.date_of_birth ? '' : 'Birthdate')));
      $o.push("          </label>\n          <input class='field-xlarge' id='date_of_birth' type='date' name='date_of_birth' autocapitalize='off' autocorrect='off' data-bindable='date-picker' data-value='" + ($e($c(this.account && this.account.date_of_birth ? this.account.date_of_birth : null))) + "'>\n        </div>\n      </div>");
  if (!this.isUpdate) {
    $o.push("      <div class='control-group'>\n        <label for='accepts_terms_and_conditions'>\n          <div class='boolean controls terms-acceptance'>\n            <input id='accepts_terms_and_conditions' type='checkbox' name='accepts_terms_and_conditions' value='" + ($e($c(1))) + "'>\n            <span>");
    $o.push("              " + $c('I agree to the <a href="http://www.top-fan.com/rewards_program">Terms and Conditions</a> of this Program'));
    $o.push("            </span>\n          </div>\n        </label>\n      </div>");
  } else {
    $o.push("      <div class='control-group'>\n        <label class='control-label'>SHIPPING ADDRESS FOR REWARDS:</label>\n        <div class='controls'>\n          <input class='field-xlarge' id='address' type='text' name='address' placeholder='Address Line 1' autocapitalize='on' autocorrect='off' value='" + ($e($c(this.account && this.account.address ? this.account.address : ''))) + "'>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='controls'>\n          <input class='field-xlarge' id='address2' type='text' name='address2' placeholder='Address Line 2' autocapitalize='on' autocorrect='off' value='" + ($e($c(this.account && this.account.address2 ? this.account.address2 : ''))) + "'>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='base-row controls'>\n          <div class='split-left'>\n            <input class='field-xlarge' id='city' type='text' name='city' placeholder='City / Town' autocapitalize='on' autocorrect='off' value='" + ($e($c(this.account && this.account.city ? this.account.city : ''))) + "'>\n          </div>\n          <div class='split-right'>\n            <input class='field-xlarge' id='state' type='text' name='state' placeholder='State / Region / Province' value='" + ($e($c((_ref2 = (_ref3 = this.account) != null ? _ref3.state : void 0) != null ? _ref2 : ''))) + "'>\n          </div>\n        </div>\n      </div>\n      <div class='control-group'>\n        <div class='base-row controls'>\n          <div class='split-left'>\n            <input class='field-xlarge' id='zip_code' type='text' name='zip_code' placeholder='Postal / Zip Code' autocapitalize='off' autocorrect='off' value='" + ($e($c(this.account && this.account.zip_code ? this.account.zip_code : ''))) + "'>\n          </div>\n          <div class='split-right'>\n            <input class='field-xlarge' id='country' type='text' name='country' placeholder='Country' value='" + ($e($c((_ref4 = (_ref5 = this.account) != null ? _ref5.country : void 0) != null ? _ref4 : ''))) + "'>\n          </div>\n        </div>\n      </div>");
      }
      $o.push("    </fieldset>\n    <div class='buttons form'>");
  if (this.isUpdate) {
    $o.push("      <button class='btn primary small' id='update_button'>Update</button>");
  } else {
    $o.push("      <button class='btn grey small' id='login_button' type='button'>Cancel</button>\n      <button class='btn primary small' id='signup_button'>Sign Up</button>");
      }
      $o.push("    </div>\n  </form>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/social_feed"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='section-title' data-bindable='section-title' data-icon='social-feed' data-title='Social Feed'></div>");
  $o.push("" + $c(JST['views/shared/_promo_image']({
    image: this.promo_image_url
      })));
      $o.push("<div class='headshot-holder' data-bindable='headshot' data-bio='" + ($e($c(escape(this.bioAsHTML())))) + "'></div>\n<div data-bindable='scrollable-content' data-top='222px'>\n  <div class='list social tall' data-bindable='social-feed'></div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["views/vm_social_feed"] = (function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='social-feed' data-bindable='scrollable-content' data-top='60px' style='height: " + ($e($c($(window).height() - 60))) + "px;'>\n  <div data-bindable='social-feed'></div>\n</div>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  });;
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TopFan.Initializer = (function(_super) {

    __extends(Initializer, _super);

    Initializer.include(Spine.Log);

    Initializer.extend(Spine.Events);

    Initializer.setup = function(element, runImmediately) {
      if (runImmediately == null) {
        runImmediately = true;
      }
      this.instance = new this(element);
      TopFan.Loader.getInstance().show();
      if (runImmediately) {
        return setTimeout(this.instance.run, 1000);
      }
    };

    Initializer.getInstance = function() {
      return this.instance;
    };

    function Initializer(el) {
      this.el = el;

      this.adjustViewport = __bind(this.adjustViewport, this);

      this.bindDeviceEvents = __bind(this.bindDeviceEvents, this);

      this.run = __bind(this.run, this);

      this.document = $(document);
      this.body = $(document.body);
    }

    Initializer.prototype.run = function() {


      var _ref;
      if (((_ref = $.os) != null ? _ref.android : void 0) != null) {
        $('body').addClass('android');
      } else {
        $('body').addClass('no-android');
      }
      this.log('Bootstrapping TopFan Application');
      this.invalidateCache();
      this.adjustViewport();
      this.configureDefaults();
      this.createStage();
      this.configureRoutes();
      this.configurePlugins();
      this.bindDeviceEvents();
      this.restoreLocalState();
      this.registerObservers();
      this.restoreRemoteState();
     
      // Launch-ability feature
      var data_id = localStorage.getItem('data_id');
      this.log('city id', data_id);
      if(data_id!='') {
        Spine.Route.navigate(Constants.ENTRY_PATH, data_id);
        setTimeout(function(){
          $(".back.circle-button.showhide.showing").removeClass('showing');
        },400);
      }
      return this.hideSplashScreen();
    };

    Initializer.prototype.invalidateCache = function() {
      if (parseInt(window.buildConfig.buildNumber) !== parseInt(localStorage.getItem('buildNumber'))) {
        var city_id = localStorage.getItem('city_id');
        var list_id = localStorage.getItem('list_id');
        var filter_id = localStorage.getItem('filter_id');
        var data_id = localStorage.getItem('data_id');
        localStorage.clear();
        localStorage.setItem('city_id', city_id);
        localStorage.setItem('list_id', list_id);
        localStorage.setItem('filter_id', filter_id);
        localStorage.setItem('data_id', data_id);

        var favoriteItems = localStorage.getItem("Favorite");
        if(!favoriteItems) {
          window.plugins.NativeStorage.getString("Favorite", function(response){
            if(response){
              localStorage.setItem("Favorite", response);
            }          
          }, function(err){
            console.log(err)
          });
        }
        
        return localStorage.setItem('buildNumber', window.buildConfig.buildNumber);
      }
    };

    Initializer.prototype.bindDeviceEvents = function() {
      var _ref, _ref1, _ref2, _ref3;
      this.log('Binding Device Events');
      if (((_ref = $.os) != null ? _ref.phone : void 0) || ((_ref1 = $.os) != null ? _ref1.tablet : void 0)) {
        TopFan.Delegates.DeviceDelegate.setup(document);
      } else {
        TopFan.Delegates.DeviceDelegate.setup(window);
      }
      if ((((_ref2 = $.os) != null ? _ref2.android : void 0) != null) && (typeof window !== "undefined" && window !== null ? (_ref3 = window.plugins) != null ? _ref3.viewScrubber : void 0 : void 0)) {
        return this.el.on('blur', 'input[type="password"]', function(e) {
          return window.plugins.viewScrubber.scrub();
        });
      }
    };

    Initializer.prototype.adjustViewport = function() {
      var _ref, _ref1;
      this.log('Adjusting viewport');
      if (((_ref = $.os) != null ? _ref.ios : void 0) && parseInt((_ref1 = $.os) != null ? _ref1.version : void 0, 10) >= 7) {
        return this.document.find('head meta[name="viewport"]').attr('content', "width=device-width, height=" + (window.innerHeight - 20) + ", initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
      }
    };

    Initializer.prototype.configureDefaults = function() {
      this.log('Configuring Defaults');
      return TopFan.Request.defaultHost = window.buildConfig.defaultHost;
    };

    Initializer.prototype.createStage = function() {
      this.log('Creating Application Stage');
      this.applicationStage = new TopFan.ApplicationStage({
        el: this.el
      });
      return TopFan.Observers.AppStageManagerObserver.setup();
    };

    Initializer.prototype.configureRoutes = function() {
      this.log('Configuring Routes');
      return Spine.Route.setup();
    };

    Initializer.prototype.configurePlugins = function() {
      this.log('Configuring Plugins');
      return TopFan.FacebookHelper.setup();
    };

    Initializer.prototype.restoreLocalState = function() {
      this.log('Restoring Local State');
      if (localStorage['Client']) {
        TopFan.Services.LocalCachingService.getInstance().loadAll();
        TopFan.Observers.ClientObserver.getInstance().clientDidChange();
        return TopFan.Loader.getInstance().hide();
      } else {
        return TopFan.Models.Client.syncFromLocalFile();
      }
    };

    Initializer.prototype.registerObservers = function() {

      this.log('Registering Observers');
      TopFan.Services.LocalCachingService.getInstance().bindAll();
      TopFan.Observers.ClientTokenObserver.setup();
      TopFan.Observers.UserTokenObserver.setup();
      TopFan.Observers.ClientObserver.setup();
      TopFan.Observers.AccountObserver.setup();
      TopFan.Observers.ChallengeObserver.setup();
      TopFan.Observers.RewardObserver.setup();
      return TopFan.Observers.RouteObserver.setup();
    };

    Initializer.prototype.restoreRemoteState = function() {
      this.log('Restoring Remote State');
      if (!TopFan.AppState.getInstance().isOnline()) {
        return;
      }
      if (TopFan.AppState.getInstance().hasClientToken() && TopFan.Models.Client.count()) {
        TopFan.Models.Client.sync();
        if (TopFan.AppState.getInstance().hasUserToken()) {
          return TopFan.Observers.AccountObserver.getInstance().userDidLogin();
        }
      } else {
        return TopFan.Services.ClientTokenService.getInstance().retrieve();
      }
    };

    Initializer.prototype.hideSplashScreen = function() {
      var _ref;
      return typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.splashscreen) != null ? _ref.hide() : void 0 : void 0;
    };

    Initializer.prototype.alertErrors = function() {
      return window.addEventListener("error", function(e) {
        var file, fileComponents, line, message;
        fileComponents = e.filename.split("/");
        file = fileComponents[fileComponents.length - 1];
        line = e.lineno;
        message = e.message;
        return alert("ERROR\n" + "Line " + line + " in " + file + "\n" + message);
      });
    };

    return Initializer;

  })(Spine.Module);

}).call(this);
