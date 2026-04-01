import Grid from './Grid.tsx';
import FieldHeader from './FieldHeader.tsx';
import type { EventBus } from './engine/EventBus.ts';

function Field({ size, bus }: { size: number, bus: EventBus<Record<string, unknown>> }) {

  return (
    <div className="field">
      <FieldHeader size={size} />
      <Grid size={size} bus={bus} />
    </div>
  )
}

export default Field;
