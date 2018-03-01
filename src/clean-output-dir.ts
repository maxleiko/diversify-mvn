import { emptyDir } from 'fs-extra';
import { resolve } from 'path';

export default function cleanOutputDir(dir: string) {
  return emptyDir(resolve(process.cwd(), dir));
}