### A Web Scraper built with streams

I found myself using this as a jumping off point to write a couple scrappers for some projects, it's simple and easy to customize. 

Put your extraction rules (EX: [cheerio](https://github.com/MatthewMueller/cheerio), or [xpath](https://github.com/goto100/xpath))
in a rules.js file (see sample)

```$ scraper.js -f input.csv -o output.json -g true```

To Geocode results your scrapping rules should return objects with an address field, and pass true to the -g option

`input.csv` should have a url column; any additional columns will be used as url parameters.

```csv
"url","q"
"www.google.com/search","kittens"
```
produces: `https://www.google.com/search?q=kittens`

outputs a file of JSON objects.

### TODO:
* Improve geocoding (choose API, send keys etc)
* Invert scraper and rules relationship (the cli portion should be extracted from scraper.js and pass in options and a callback which contains the parsing rules)

