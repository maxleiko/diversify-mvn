import * as xml2js from 'xml2js';

export function parseString<T = Object>(xml: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    xml2js.parseString(xml, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
