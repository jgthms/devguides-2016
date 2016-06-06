var hljs = require('highlight.js')

/*
 * Ran before jstransformer.
 */

exports.addMdOptions = function () {
  return function (files, ms, done) {
    for (var fn in files) {
      if (/\.md$/.test(fn)) {
        files[fn].plugins = [
          require('markdown-it-decorate')
        ]
      }
    }
    done()
  }
}

/*
 * Ran after jstransformer.
 */

exports.transformHtml = function () {
  return function (files, ms, done) {
    for (var fn in files) {
      if (/\.html/.test(fn)) {
        files[fn].contents = transformHtml(files[fn].contents)
      }
    }
    done()
  }
}

/*
 * Transforms HTML.
 */

function transformHtml (html) {
  html = html.replace(/<hr>/g, '</div></div><div class="page-section"><div class="container">')
  html = html.replace(/<blockquote>\n<p>Next: /g, '<blockquote class="up-next">\n<p>')
  html = html.replace(/<pre><code class="language-([^"]*)">([\s\S.]*?)<\/code><\/pre>/mg, function (_, lang, code) {
    code = code.replace(/&lt;/g, '<')
    code = code.replace(/&gt;/g, '>')
    code = code.replace(/&amp;/g, '&')
    code = code.replace(/&quot;/g, "'")
    code = hljs.highlight(lang, code).value

    // ellipsis /*...*/
    code = code.replace(
      /<span class="hljs-comment">\/\*\.\.\.\*\/<\/span>/g,
      (_, str) => `<span class="hljs-ellipsis"></span>`)

    // placeholders /*[ like this ]*/
    code = code.replace(
      /<span class="hljs-comment">\/\*\[ (.*?) \]\*\/<\/span>/g,
      (_, str) => `<span class="hljs-placeholder">${str}</span>`)

    // highlighted lines //+
    // muted lines //-
    code = code.replace(
      /(?:^|\n)(.*?)<span class="hljs-comment">\/\/\-<\/span>/g,
      (_, str) => `<span class="hljs-line -mute">${str}</span>`)
    code = code.replace(
      /(?:^|\n)(.*?)<span class="hljs-comment">\/\/\+<\/span>/g,
      (_, str) => `<span class="hljs-line -highlight">${str}</span>`)

    // /*{*/highlight/*}*/
    code = code.replace(
      /<span class="hljs-comment">\/\*{\*\/<\/span>(.*?)<span class="hljs-comment">\/\*}\*\/<\/span>/g,
      (_, str) => `<span class="hljs-highlight">${str}</span>`)
    return '<pre><code class="language-' + lang + '">' + code + '</code></pre>'
  })
  return html
}