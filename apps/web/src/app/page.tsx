"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";

export default function Home() {
  const [health, setHealth] = useState<string>("loading...");

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data.status))
      .catch(() => setHealth("error"));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>EduHousing</h1>
      <p>Platform for student-to-student housing handover</p>
      <p>
        API status: <strong>{health}</strong>
      </p>
    </main>
  );
}
