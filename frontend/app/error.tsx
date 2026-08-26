"use client";

export default function ErrorPage({ reset }: Readonly<{ reset: () => void }>) {
  return <main className="main"><p className="eyebrow">API unavailable</p><h1>Property analysis could not be loaded.</h1><p className="lede">Start the EstateAI API on port 8002, then try again.</p><button className="button primary" onClick={reset} type="button">Try again</button></main>;
}
