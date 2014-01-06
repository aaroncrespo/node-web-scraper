var cheerio = require('cheerio');

var parse = function(body){
  var $ = cheerio.load(body.body);

  var object = {params: body.params};
  var name   = $('.name').text;
  object.name = name; 
  return object;
}

module.exports.parse = parse;
