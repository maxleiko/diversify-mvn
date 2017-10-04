const request = require('request-promise');
const semverSort = require('semver-sort');

function searchMaven(g, a) {
  return request({
    uri: encodeURI(`http://search.maven.org/solrsearch/select?q=g:"${g}"+AND+a:"${a}"&rows=10&core=gav`),
    json: true,
    simple: true, // status code other than 2xx will reject the promise
  }).then(({ response }) => {
    return semverSort.asc(response.docs
      .reduce((versions, { v }) => {
        versions.push(v);
        return versions;
      }, []));
  });
}

module.exports = searchMaven;
