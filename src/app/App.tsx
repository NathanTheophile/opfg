import { contentCatalog } from '../game/content/definitions';
import { assertValidContent } from '../game/validation/validateContent';
import { EventPreview } from '../features/event-ui/EventPreview';

assertValidContent(contentCatalog);

export function App() {
  return <EventPreview catalog={contentCatalog} storage={window.localStorage} />;
}
