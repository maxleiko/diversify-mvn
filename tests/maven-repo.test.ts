import mavenRepo from '../src/maven-repo';

describe('maven-repo', () => {
  it('should retrieve exactly the amount of versions asked', () => {
    // this project has been deprecated, so we are not supposed to see any more versions of org.kevoree:org.kevoree.model.js
    // which means that the latest 5 versions should be static now
    // TODO go for a mocked maven repo when you have time
    return mavenRepo(['https://repo1.maven.org/maven2/'], 'org.kevoree', 'org.kevoree.model.js', 5)
      .then((versions) => {
        expect(versions.length).toEqual(5);
        expect(versions).toEqual([
          '5.3.1',
          '5.3.0',
          '5.2.8',
          '5.2.7',
          '5.2.6',
        ]);
      });
  });

  it('should retrieve all versions', () => {
    return mavenRepo(['https://repo1.maven.org/maven2/'], 'org.kevoree', 'org.kevoree.kevscript')
      .then((versions) => {
        expect(versions.length).toBeGreaterThan(0);
      });
  });

  it('should work with github too', () => {
    return mavenRepo(['https://github.com/jitsi/jitsi-maven-repository/raw/master/releases/'], 'org.jitsi', 'jitsi-dnsservice')
      .then((versions) => {
        expect(versions.length).toBeGreaterThan(0);
      });
  });
});