import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Ownership Graph App</h1>
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