export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-night" role="status" aria-label="Loading SOL and MAR">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-sea border-t-sun" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-foam">SOL &amp; MAR is rising…</p>
      </div>
    </div>
  );
}
