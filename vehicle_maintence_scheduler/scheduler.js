function normalizeNumber(val) {
    const n = Number(val);
    return Number.isFinite(n) ? Math.floor(n) : 0;
}

function maxImpact(hours, vehicles) {

    hours = normalizeNumber(hours);

    const n = vehicles.length;

    const dp = Array.from(
        { length: n + 1 },
        () => Array(hours + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {

        const vehicle = vehicles[i - 1];

        const duration = normalizeNumber(
            vehicle.Duration
        );

        const impact = normalizeNumber(
            vehicle.Impact
        );

        for (let w = 0; w <= hours; w++) {

            if (duration <= w) {

                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - duration] + impact
                );

            } else {

                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let selected = [];
    let w = hours;

    for (let i = n; i > 0; i--) {

        if (dp[i][w] !== dp[i - 1][w]) {

            selected.push(
                vehicles[i - 1].TaskID
            );

            w -= normalizeNumber(
                vehicles[i - 1].Duration
            );
        }
    }

    return {
        maxImpact: dp[n][hours],
        selectedIDs: selected.reverse()
    };
}

module.exports = {
    maxImpact
};