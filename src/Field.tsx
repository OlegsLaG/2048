import Grid from './Grid.tsx';

function Field({ size }: { size: number }) {

  return (
    <div className="field">
      <Grid size={size} />
    </div>
  )
}

export default Field;
