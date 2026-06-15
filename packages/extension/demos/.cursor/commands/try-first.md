# Try first MCP servers (open-meteo-geocoding + open-meteo)

Read **`README.md`** in this workspace (section **Quick start**) and help the user complete it.

If setup is not done yet, run in the demo workspace root:

```bash
npm run start
```

Then enable MCP servers in Cursor (HTTP hosts are already running) and reload MCP.

Finally, answer this using MCP tools only (schema-only tool calls, no guessing):

```text
api2ai How will the weather be tomorrow in Berlin?
```

Expect geocoding first, then a weather forecast. Report which MCP servers and tools you used.
