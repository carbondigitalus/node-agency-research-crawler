// core modules
const fs = require('fs');
const url = require('url');

// third party modules
const _ = require('lodash');
const async = require('async');
const cheerio = require('cheerio');
const request = require('request');

const base = 'carbondigital.us';
const firstLink = `https://${base}`;

// variables
const json = {};

// arrays
json.links = [];
json.crawled = [];
json.inboundLinks = [];

const makeRequest = function(crawlUrl, callback) {
  const startTime = new Date().getTime();
  request(crawlUrl, function(error, response, body) {
    const endTime = new Date().getTime();
    const requestTime = endTime - startTime;
    json.requestTime = requestTime;

    const $ = cheerio.load(body);
    json.title = $('title').text();
    json.url = crawlUrl;
    $('a').each(function(i, elem) {
      json.links.push({
        linkText: $(elem).text(),
        linkUrl: $(elem).attr('href')
      });
    });
    callback(error, json);
  });
};

const myLoop = function(link) {
  makeRequest(link, function(error) {
    // console.log(json);
    json.crawled.push(json.url);
    async.eachSeries(
      json.links,
      function(item, cb) {
        const parsedUrl = item.linkUrl;
        // test if the url actually points to the same domain
        if (parsedUrl.hostname === base) {
          /*
         insert some further link error checking here
        */
          json.inboundLinks.push(item.linkUrl);
        }
        cb(
          // To write to the system we will use the built in 'fs' library.
          // In this example we will pass 3 parameters to the writeFile function
          // Parameter 1 :  output.json - this is what the created filename will be called
          // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
          // Parameter 3 :  callback function - a callback function to let us know the status of our function
          fs.writeFile('output.json', JSON.stringify(json, null, 4), function(
            err
          ) {
            console.log(
              'File successfully written! - Check your project directory for the output.json file'
            );
          })
        );
      },
      function() {
        const nextLink = _.difference(_.uniq(json.inboundLinks), json.crawled);
        if (nextLink.length > 0) {
          myLoop(nextLink[0]);
        } else {
          console.log('done crawling URL');
        }
      }
    );
  });
};

myLoop(firstLink);
