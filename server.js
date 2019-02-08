var express = require('express')
var logger = require('morgan')
var mongoose = require('mongoose')
var axios = require('axios')
var cheerio = require('cheerio')
var path = require('path')

var db = require('./models')

var PORT = 3000

var app = express()

app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);
// mongoose.connect('mongodb://localhost/mongoHeadlines', { useNewUrlParser: true })

app.get('/', function (req, res) {
  res.send('Home')
})

app.get('/saved', function (req, res) {
  db.Article.find({}, function (err, found) {
    if (err) {
      console.log(err)
    }else {
      res.sendFile(path.join(__dirname + '/public/savedarticles.html'))
    }
  })
})

app.get('/articles', function (req, res) {
  db.Article.find({}, function (err, found) {
    if (err) {
      console.log(err)
    }else {
      res.send(found)
    }
  })
})
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.arlnow.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    var results = []
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      results.push(result)

      // Create a new Article using the `result` object built from scraping
      // db.Article.create(result)
      //   .then(function(dbArticle) {
      //     // View the added result in the console
      //     console.log(dbArticle);
      //   })
      //   .catch(function(err) {
      //     // If an error occurred, log it
      //     console.log(err);
      //   });
    });

    // Send a message to the client
    res.send(results);
  });
});

app.get("/saved", function(req, res) {
  // First, we grab the body of the html with axios

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          res.send(dbArticle)
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
        
        // Send a message to the client
      });




app.get('/articles/:id', function (req, res) {
  db.Article.findOne({_id: req.params.id})
    .populate('note')
    .then(function (dbArticle) {
      res.json(dbArticle)
    })
    .catch(function (err) {
      res.json(err)
    })
})

app.listen(PORT, function () {
  console.log('App running on port ' + PORT + '!')
})
