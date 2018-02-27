import * as path from 'path';

import randomDeps from './random-deps';
import hash from './hash';
import { alreadyTested } from './already-tested';
import { Mutant, Groups } from './api';
import DefaultConfig from './default-config';

export default function createMutant(config: DefaultConfig, groups: Groups): Mutant {
  let dependencies = randomDeps(groups);
  let hash_ = hash(dependencies);
  while (alreadyTested(hash_)) {
    dependencies = randomDeps(groups);
    hash_ = hash(dependencies);
  }

  return {
    name: `mutant-${hash_.substr(0, 7)}`,
    dir: path.join(config.outputDir, hash_),
    hash: hash_,
    dependencies,
    valid: false,
  };
}
