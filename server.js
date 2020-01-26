// Node Modules
const fs = require('fs');
let url = require('url');

// NPM Modules
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

// Active Express App
const app = express();

// Delare variables
let userName;
let profileURL;
let datePosted;
let postContent;
const json = {
  userName: '',
  profileURL: '',
  datePosted: '',
  postContent: ''
};

app.get('/scrape', function(req, res) {
  url = 'https://www.facebook.com/search/top/?q=web%20design';

  request(url, function(error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      $('.browse_result_area ._401d ._19_p ._401d').filter(function() {
        const data = $(this);
        userName = data.find('._7gyi').text();
        json.userName = userName;
        profileURL = data.find('._7gyi').attr('href');
        json.profileURL = profileURL;
        datePosted = data.find('._6-cp ._6-cm a').val();
        json.datePosted = datePosted;
        postContent = data.find('._6-cp').val();
        json.postContent = postContent;
        return json;
      });
    }

    // To write to the system we will use the built in 'fs' library.
    // In this example we will pass 3 parameters to the writeFile function
    // Parameter 1 :  output.json - this is what the created filename will be called
    // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
    // Parameter 3 :  callback function - a callback function to let us know the status of our function

    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err) {
      console.log(
        'File successfully written! - Check your project directory for the output.json file'
      );
    });

    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    res.send('Check your console!');
  });
});

app.listen('8081');
console.log('Magic happens on port 8081');
module.exports.app = app;
