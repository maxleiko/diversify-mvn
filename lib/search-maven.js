const request = require('request');

function searchMaven(g, a, nbVersions) {
  const opts = {
    uri: encodeURI(`http://search.maven.org/solrsearch/select?q=g:"${g}"+AND+a:"${a}"&rows=${nbVersions}&core=gav&wt=json`),
    json: true,
    simple: true,
  };

  return new Promise((resolve, reject) => {
    request(opts, (error, response, body) => {
      if (error) {
        reject(new Error('Unable to search Maven Central'));
      } else {
        if (response.statusCode === 200) {
          resolve(body.response.docs.map((doc) => doc.v));
        } else {
          reject(new Error(`Unable to search Maven Central (${response.statusCode} - ${response.statusMessage})`));
        }
      }
    });
  });
}

module.exports = searchMaven;
