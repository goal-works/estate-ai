import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/">Estate<span>AI</span></Link>
      <nav className="nav" aria-label="Primary">
        <Link href="/">Discover</Link>
        <Link href="/saved">Saved</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/methodology">Methodology</Link>
      </nav>
      <span className="demo-label">Synthetic demo data</span>
    </header>
  );
}
