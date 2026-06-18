---
trigger: always_on
description: server management rules
---
[server] Other node instances could be running so don't blindly kill all node PIDs when restarting or rebuilding backend servers etc - find the exact node instance for this app/port and restart only that one. use netstat -ano | findstr :[port] to find the PID and then use taskkill /PID [PID] /F to kill it, then restart the dev server.
