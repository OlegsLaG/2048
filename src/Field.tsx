import Grid from './Grid.tsx';
import type { EventBus } from './engine/EventBus.ts';

function Field({ size, bus }: { size: number, bus: EventBus<Record<string, unknown>> }) {

  return (
    <div className="field">
      <Grid size={size} bus={bus} />
    </div>
  )
}

export default Field;
