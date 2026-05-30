function normalizeNumber(val){
    const n = Number(val);
    return Number.isFinite(n) && !Number.isNaN(n) ? Math.floor(n) : 0;
}

function maxImpact(hours, vehicles){
    hours = Math.max(0, Math.floor(Number(hours) || 0));
    const n = vehicles.length || 0;
    const dp = Array.from({length: n+1}, () => Array(hours+1).fill(0));

    for(let i = 1; i <= n; i++){
        const v = vehicles[i-1] || {};
        const dur = normalizeNumber(v.Duration || v.duration || v.MechanicHours || v.hours);
        const impact = normalizeNumber(v.Impact || v.impact || v.OperationalImpact || v.score);
        for(let w = 0; w <= hours; w++){
            if (dur <= w)
                dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-dur] + impact);
            else
                dp[i][w] = dp[i-1][w];
        }
    }

    let res = dp[n][hours];
    let w = hours;
    const sel = [];
    for(let i = n; i > 0 && res > 0; i--){
        if (res !== dp[i-1][w]){
            const v = vehicles[i-1] || {};
            sel.push(v.TaskID || v.TaskId || v.id || v.ID || null);
            const dur = normalizeNumber(v.Duration || v.duration || v.MechanicHours || v.hours);
            const impact = normalizeNumber(v.Impact || v.impact || v.OperationalImpact || v.score);
            res -= impact;
            w -= dur;
        }
    }

    return {
        maxImpact: dp[n][hours],
        selectedIDs: sel.reverse()
    };
}

module.exports = {
    maxImpact
};

