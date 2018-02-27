import * as crypto from 'crypto';
import { Dep } from './api';

export default function hash(deps: Dep[]) {
  return crypto
    .createHash('sha256')
    .update(deps.reduce((acc, { g, a, v }) => acc + `${g}:${a}:${v}`, ''))
    .digest('hex');
}
