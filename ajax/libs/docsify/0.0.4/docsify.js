(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('marked'), require('prismjs')) :
  typeof define === 'function' && define.amd ? define(['marked', 'prismjs'], factory) :
  (global.Docsify = factory(global.marked,global.Prism));
}(this, (function (marked,Prism) { 'use strict';

marked = 'default' in marked ? marked['default'] : marked;
Prism = 'default' in Prism ? Prism['default'] : Prism;

var ajax = function (url, options) {
  if ( options === void 0 ) options = {};

  var xhr = new XMLHttpRequest();

  xhr.open(options.method || 'get', url);
  xhr.send();

  return {
    then: function (cb) { return xhr.addEventListener('load', cb); }
  }
};

/**
 * @link from https://github.com/killercup/grock/blob/5280ae63e16c5739e9233d9009bc235ed7d79a50/styles/solarized/assets/js/behavior.coffee#L54-L81
 */
var tocToTree = function (toc) {
  var headlines = [];
  var last = {};

  toc.forEach(function (headline) {
    var level = headline.level || 1;
    var len = level - 1;

    if (last[len]) {
      last[len].children = last[len].children || [];
      last[len].children.push(headline);
    } else {
      headlines.push(headline);
      last[level] = headline;
    }
  });

  return headlines
};

var buildHeadlinesTree = function (tree, tpl) {
  if ( tpl === void 0 ) tpl = '';

  if (!tree || !tree.length) { return '' }

  tree.forEach(function (node) {
    tpl += "<li><a class=\"section-link\" href=\"#" + (node.slug) + "\">" + (node.title) + "</a></li>";
    if (node.children) {
      tpl += "<li><ul class=\"children\">" + (buildHeadlinesTree(node.children)) + "</li>";
    }
  });

  return tpl + '</ul>'
};

var genToc = function (toc) {
  return buildHeadlinesTree(tocToTree(toc), '<ul>')
};

var toc = [];
var renderer = new marked.Renderer();

/**
 * render anchor tag
 * @link https://github.com/chjj/marked#overriding-renderer-methods
 */
renderer.heading = function (text, level) {
  var slug = text.toLowerCase().replace(/[\s\n\t]+/g, '-');

  toc.push({ level: level, slug: slug, title: text });

  return ("<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\" class=\"anchor\"></a>" + text + "</h" + level + ">")
};
marked.setOptions({
  renderer: renderer,
  highlight: function highlight (code, lang) {
    return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
  }
});

var render = function (content) {
  var section = "<section class=\"content\">\n    <article class=\"markdown-section\">" + (marked(content)) + "</article>\n  </section>";
  var sidebar = "<aside class=\"sidebar\">" + (genToc(toc)) + "</aside>";

  return ("<main>" + sidebar + section + "</main>")
};

function scrollActiveSidebar () {
  if (/mobile/i.test(navigator.userAgent)) { return }

  var anchors = document.querySelectorAll('.anchor');
  var nav = {};
  var lis = document.querySelectorAll('.sidebar li');
  var active = null;

  for (var i = 0, len = lis.length; i < len; i += 1) {
    var li = lis[i];
    var a = li.querySelector('a');

    nav[a.getAttribute('href').slice(1)] = li;
  }

  function highlight () {
    for (var i = 0, len = anchors.length; i < len; i += 1) {
      var node = anchors[i].parentNode;
      var bcr = node.getBoundingClientRect();

      if (bcr.top < 150 && bcr.bottom > 150) {
        var li = nav[ node.id ];
        if (li === active) { return }
        if (active) { active.classList.remove('active'); }

        li.classList.add('active');
        active = li;

        return
      }
    }
  }

  document.querySelector('main .content').addEventListener('scroll', highlight);
  highlight();

  function scrollIntoView () {
    var id = window.location.hash.slice(1);
    if (!id) { return }
    var section = document.querySelector('#' + id);

    if (section) { section.scrollIntoView(); }
  }

  window.addEventListener('hashchange', scrollIntoView);
  scrollIntoView();
}

var bindEvent = function () {
  scrollActiveSidebar();
};

var DEFAULT_OPTS = {
  el: '#app',
  title: document.title,
  sep: ' - '
};

var Docsify = function Docsify (opts) {
  Docsify.installed = true;

  this.replace = true;
  this.opts = Object.assign({}, opts, DEFAULT_OPTS);
  this.dom = document.querySelector(this.opts.el);
  if (!this.dom) {
    this.dom = document.body;
    this.replace = false;
  }
  this.loc = document.location.pathname;
  if (/\/$/.test(this.loc)) { this.loc += 'README'; }
  this.load();
};

Docsify.prototype.load = function load () {
    var this$1 = this;

  ajax(((this.loc) + ".md")).then(function (res) {
    var target = res.target;
    if (target.status >= 400) {
      this$1.render('not found');
    } else {
      this$1.render(res.target.response);
      bindEvent();
    }
  });
};

Docsify.prototype.render = function render$1 (content) {
  document.title = this.loc.slice(1) + this.opts.sep + this.opts.title;
  this.dom[this.replace ? 'outerHTML' : 'innerHTML'] = render(content);
};

Docsify.use = function () {
  var plugin = arguments[0];
  if (typeof plugin === 'function') {
    plugin.call(Docsify);
  } else {
    throw TypeError('[docsify] Invalid plugin ' + plugin.name)
  }
};

window.addEventListener('load', function () {
  if (Docsify.installed) { return }
  new Docsify();
});

return Docsify;

})));
