const request = require('request-promise');

function searchMaven(g, a) {
  return request({
    uri: encodeURI(`http://search.maven.org/solrsearch/select?q=g:"${g}"+AND+a:"${a}"&rows=10&core=gav`),
    json: true,
    simple: true, // status code other than 2xx will reject the promise
  }).then(({ response }) => response.docs.map((doc) => doc.v).sort());
}

module.exports = searchMaven;
