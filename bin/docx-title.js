#!/usr/bin/env node
/*! pandoc-docx-title | (C) 2014 Mike Henderson <mvhenderson@tds.net> | License: MIT */
'use strict';

var _ = require('lodash');
var filter = require('pandoc-filter');
var fs = require('fs');

var template = [
  '<% if (data.title) { %>',
    '<w:p>',
      '<w:pPr><w:pStyle w:val="Title"/></w:pPr>',
      '<w:r><w:t><%= data.title %></w:t></w:r>',
    '</w:p>',
  '<% } %>',
].join('');


var json = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
  json += data;
});
process.stdin.on('end', function () {
  var format = (process.argv.length > 2 ? process.argv[2] : '');
  if (format === 'docx' || format === 'openxml') {
    var pandoc = JSON.parse(json);
    var meta = pandoc.meta || pandoc[0].unMeta;

    // Move title, author, date to too level
    var data = {};
    _.forOwn(meta, function (val,key) {
      if (key === 'data') {
        _.forOwn(val.c, function (v,k) {
          data[k] = filter.stringify(v);
        });
      }
      else {
        data[key] = filter.stringify(val);
      }
    });

    // Load title template if given
    if (meta['docx-title']) {
      var path = meta['docx-title'].c;
      template = fs.readFileSync(path,{encoding: 'utf8'});
    }

    // Build the title page as a raw-block
    var raw = {
      t: 'RawBlock',
      c: [
        'openxml',
        _.template(template, {variable: 'data'})(data)
      ]
    };

    // Insert title page and export
    var content = pandoc.blocks || pandoc[1]
    content.unshift(raw);
    json = JSON.stringify(pandoc);
  }
  process.stdout.write(json);
});
