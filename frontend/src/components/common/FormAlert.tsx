export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
