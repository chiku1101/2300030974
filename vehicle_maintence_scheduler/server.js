const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { maxImpact } = require('./scheduler');
const { sendLog } = require('../logging_middleware/index');

const DEPOT_API = process.env.DEPOT_API_URL || 'http://4.224.186.213/evaluation-service/depots';
const TASK_API = process.env.TASK_API_URL || 'http://4.224.186.213/evaluation-service/tasks';

const app = express();
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({status: 'ok'}));

async function fetchDepots(){
    const token = process.env.ACCESS_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const r = await fetch(DEPOT_API, { headers });
    if (!r.ok) throw new Error(`Depot API error ${r.status}`);
    return r.json();
}

async function fetchTasks(){
    const token = process.env.ACCESS_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const r = await fetch(TASK_API, { headers });
    if (!r.ok) throw new Error(`Task API error ${r.status}`);
    return r.json();
}

// POST /schedule
// body: { depotId?: number, hours?: number, tasks?: [ { TaskID, Duration, Impact } ] }
app.post('/schedule', async (req, res) => {
    try{
        await sendLog('info', 'vehicle-scheduler', 'schedule request received');
        const { depotId, hours, tasks } = req.body || {};

        let budget = hours;
        if (!budget && depotId){
            const depRes = await fetchDepots();
            const found = (depRes.depots || []).find(d => d.ID === depotId || d.id === depotId);
            budget = found ? (found.MechanicHours || found.mechanicHours || 0) : budget;
        }

        let items = tasks;
        if (!items){
            const tasksRes = await fetchTasks();
            // try to extract list from common shapes
            items = tasksRes.tasks || tasksRes || [];
        }

        if (!Array.isArray(items)) items = [];
        if (!budget) return res.status(400).json({error: 'mechanic-hours budget required (hours or depotId)'});

        const result = maxImpact(Number(budget), items);
        await sendLog('info', 'vehicle-scheduler', `computed schedule for budget=${budget}`);
        return res.json({ budget: Number(budget), totalImpact: result.maxImpact, selected: result.selectedIDs });
    }catch(err){
        await sendLog('error', 'vehicle-scheduler', err.message || String(err));
        return res.status(500).json({ error: err.message || 'internal error' });
    }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`Vehicle scheduler listening on ${PORT}`));
