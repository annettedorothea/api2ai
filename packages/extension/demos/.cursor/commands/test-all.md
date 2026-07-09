# Test all api2ai MCP tools

Fuehre den Smoke-Test **aller** MCP-Tools **aller** Server aus `.cursor/mcp.json` aus.

1. Lies und befolge `.cursor/skills/api2ai-test-all-mcp/SKILL.md` vollstaendig (Schritt 0 + Schritt 1 Build aus Terminal).
2. **Keine MCP-Tools in dieser Session** → sofort mit Abbruch-Meldung aus dem Skill enden; **kein** direkter HTTP/curl an MCP-URLs.
3. Beginne die Ausfuehrung mit dem Praefix `api2ai /test:all` in deiner Antwort.
4. Schema-only: Parameter nur aus MCP-Tool-Descriptors, kein Repo-/OpenAPI-Wissen.
5. Ergebnis: Zusammenfassungstabelle (Build pro Server) + Auffaelligkeiten + **kompakter Audit** (eine Zeile pro Tool, ohne Build-Spalte) — **kein** Voll-Audit mit Roh-JSON.
