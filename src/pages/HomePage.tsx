import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Ownership Graph App</h1>
      </header>

      <section className="card">
        <p>Welcome! Choose what you want to do:</p>

        <Link to="/new">
          <button className="btn">➕ New Calculation</button>
        </Link>
      </section>
    </main>
  );
}