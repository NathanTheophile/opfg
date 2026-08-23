import { createContentCatalog } from './catalogFactory';
import { eventCatalog } from './eventCatalog';

export const contentCatalog = createContentCatalog(eventCatalog);
