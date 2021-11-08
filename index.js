const express = require('express')
const fetch = require('node-fetch')
const app = express();

const cache = new Map();

function getPath(req) {
  return '/' + req.params.continent + '/' + req.params.tz;
}

/**
 * @type {import('express').RequestHandler}
 */
function cacheMiddleWare(req, res, next) {
  const key = getPath(req);
  if (cache.get(key)) { 
    // do nothing if cache hit
    res.json(cache.get(key));
  } else {
    /**
     *  provide setCache method to move another logic to somewhare
     *  this middleware only for manage cache
     * */
    req.setCache = function setCache(data,expired = 120) {
      cache.set(key, data)
      setTimeout(() => {
        cache.delete(key)
      }, expired * 1000)
    }
    next();
  }
}

app.get('/api/timezone/:continent/:tz', cacheMiddleWare,async function(req, res) {
  const key = getPath(req);
  const response = await fetch('http://worldtimeapi.org/api/timezone' + key)
  const data = await response.json();
  req.setCache(data)
  res.json(data)

});

app.listen(3000);
