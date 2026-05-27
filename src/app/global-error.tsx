"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          <h2>エラーが発生しました</h2>
          <p>{error.message}</p>
          <button type="button" onClick={() => reset()}>
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
