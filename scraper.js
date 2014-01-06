#!/usr/bin/env node

var argv = require('optimist').options({
              'f': {
                alias:    'file',
                demand:   true,
                describe: 'CSV file'}, 
              'o': {
                alias:    'output',
                demand:   true,
                describe: 'Output JSON file' }, 
              'g': {
                alias:    'geocode',
                default:  false,
                describe: 'Geocode address values'}
            }).argv;

var request   = require('request'),
    geoCoder  = require('geocoder'),
    es        = require('event-stream'),
    fs        = require('fs'),
    csv       = require('csv-streamify'),
    rules     = require('./rules.js');

var fetcher = es.through(function write(req) {
  var self = this;
  self.pause();

  var url = req.url; 
  delete req['url'];

  request.get({
    uri: url,
    qs: req
  }, function(e,res){
    if(e) { console.log("ERROR:",e, "Data:", req, "RES:", res); }

    console.log('Fetched     url:', url, 'with', req);
    self.resume();
    self.emit("data", {'body': res.body, 'params': req})
  });
}, function end(){
  if(!this.paused){
    this.emit('end');
  }
});

var parser = es.through(function write(body){
  var self = this;
  self.pause();
  var result = rules.parse(body);
  self.resume();
  self.emit("data", result);
 
}, function end(){
  if(!this.paused){
    this.emit('end');
  }
});

var geoCodeResult = es.through(function write(result){
  var self = this;
  
  self.pause();
  if(result.address && argv.g) {
    geoCoder.geocode(result.address, function(err, data){
      var location = data.results[0].geometry.location;
      result.lat = location.lat;
      result.log = location.lng;

      console.log("Geocoded    :", result.i, result);
      self.resume(); 
      self.emit("data", result);
    });
  } else {
      self.resume(); 
      self.emit("data", result);
  }
 }, function end(){
  if(!this.paused){
    this.emit('end');
  }
});
 
var csvParse = csv({objectMode: true, columns: true});

fs.createReadStream(argv.f)
  .pipe(csvParse)
  .pipe(fetcher)
  .pipe(parser)
  .pipe(geoCodeResult)
  .pipe(es.stringify())
  .pipe(fs.createWriteStream(argv.o));
