import { spawn } from "child_process";
import { readFileSync } from "fs";

const envPath = new URL("../.env.local", import.meta.url);
let port = "3010";
try {
  const content = readFileSync(envPath, "utf8");
  const match = content.match(/^PORT=(\d+)/m);
  if (match) port = match[1];
} catch {
  // .env.local missing, use default
}

const proc = spawn("next", ["dev", "-p", port], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PORT: port },
});

proc.on("exit", (code) => process.exit(code ?? 0));
