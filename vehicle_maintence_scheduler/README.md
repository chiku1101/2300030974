Vehicle Maintenance Scheduler

Quick start

1. Install dependencies

```bash
cd "vehicle_maintence_scheduler"
npm install
```

2. Run the server

```bash
npm start
```

3. Example request

```bash
curl -X POST http://localhost:3030/schedule -H 'Content-Type: application/json' -d '{"hours":8, "tasks":[{"TaskID":1,"Duration":2,"Impact":10},{"TaskID":2,"Duration":6,"Impact":40}] }'
```

Environment variables

- `ACCESS_TOKEN` — optional token used when calling the provided evaluation APIs
- `DEPOT_API_URL` — URL for depots API (defaults to the one provided in the task)
- `TASK_API_URL` — URL for tasks API (defaults to the one provided in the task)
