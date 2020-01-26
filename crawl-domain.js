// core modules
// const fs = require('fs');
const url = require('url');

// third party modules
const _ = require('lodash');
const async = require('async');
const cheerio = require('cheerio');
const request = require('request');

const base = 'carbondigital.us';
const firstLink = `https://${base}`;

const crawled = [];
const inboundLinks = [];

const makeRequest = function(crawlUrl, callback) {
  const startTime = new Date().getTime();
  request(crawlUrl, function(error, response, body) {
    const pageObject = {};
    pageObject.links = [];

    const endTime = new Date().getTime();
    const requestTime = endTime - startTime;
    pageObject.requestTime = requestTime;

    const $ = cheerio.load(body);
    pageObject.title = $('title').text();
    pageObject.url = crawlUrl;
    $('a').each(function(i, elem) {
      /*
       insert some further checks if a link is:
       * valid
       * relative or absolute
       * check out the url module of node: https://nodejs.org/dist/latest-v5.x/docs/api/url.html
      */
      pageObject.links.push({
        linkText: $(elem).text(),
        linkUrl: elem.attribs.href
      });
    });
    callback(error, pageObject);
  });
};

const myLoop = function(link) {
  makeRequest(link, function(error, pageObject) {
    console.log(pageObject);
    crawled.push(pageObject.url);
    async.eachSeries(
      pageObject.links,
      function(item, cb) {
        const parsedUrl = url.URL(item.linkUrl);
        // test if the url actually points to the same domain
        if (parsedUrl.hostname === base) {
          /*
         insert some further link error checking here
        */
          inboundLinks.push(item.linkUrl);
        }
        cb();
      },
      function() {
        const nextLink = _.difference(_.uniq(inboundLinks), crawled);
        if (nextLink.length > 0) {
          myLoop(nextLink[0]);
        } else {
          console.log('done!');
        }
      }
    );
  });
};

myLoop(firstLink);
