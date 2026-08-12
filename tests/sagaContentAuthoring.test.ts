import { describe, expect, it } from 'vitest';
import {
  checkSaga,
  listSagaSources,
  validateSagaAuthoring,
} from '../scripts/saga-content/lib';

const rootDirectory = process.cwd();
const sources = listSagaSources(rootDirectory);

describe('Saga authoring pipeline', () => {
  it('has structurally valid authoring sources', () => {
    const errors = sources.flatMap((source) =>
      validateSagaAuthoring(source).errors.map((error) => `${source.sagaId}: ${error}`)
    );
    expect(errors).toEqual([]);
  });

  it('keeps compiled runtime/localization synchronized with authoring sources', () => {
    const errors = sources.flatMap((source) =>
      checkSaga(rootDirectory, source).errors.map((error) => `${source.sagaId}: ${error}`)
    );
    expect(errors).toEqual([]);
  });
});
