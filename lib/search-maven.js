const request = require('request-promise');

function searchMaven(g, a, nbVersions) {
  return request({
    uri: encodeURI(`http://search.maven.org/solrsearch/select?q=g:"${g}"+AND+a:"${a}"&rows=${nbVersions}&core=gav`),
    json: true,
    simple: true,
  }).then(
    ({ response }) => response.docs.map((doc) => doc.v).sort(),
    (err) => {
      console.log(err.stack);
      throw new Error('Unable to search Maven Central');
    }
  );
}

module.exports = searchMaven;
