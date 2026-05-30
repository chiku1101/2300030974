require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const { maxImpact } = require("./scheduler");
const { sendLog } = require("../logging_middleware");

const app = express();

app.use(bodyParser.json());

const DEPOT_API_URL =
    process.env.DEPOT_API_URL ||
    "http://4.224.186.213/evaluation-service/depots";

const VEHICLE_API_URL =
    process.env.VEHICLE_API_URL ||
    "http://4.224.186.213/evaluation-service/vehicles";

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

async function fetchDepots() {

    const token = process.env.ACCESS_TOKEN;

    console.log("\n========== DEPOT API ==========");
    console.log("DEPOT_API_URL =", DEPOT_API_URL);
    console.log("TOKEN =", token);
    console.log("===============================\n");

    const response = await fetch(
        DEPOT_API_URL,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    console.log("DEPOT STATUS =", response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.log("DEPOT ERROR =", errorText);

        throw new Error(
            `Depot API Error ${response.status}`
        );
    }

    return response.json();
}

async function fetchVehicles() {

    const token = process.env.ACCESS_TOKEN;

    console.log("\n========= VEHICLE API =========");
    console.log("VEHICLE_API_URL =", VEHICLE_API_URL);
    console.log("TOKEN =", token);
    console.log("===============================\n");

    const response = await fetch(
        VEHICLE_API_URL,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    console.log("VEHICLE STATUS =", response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.log("VEHICLE ERROR =", errorText);

        throw new Error(
            `Vehicle API Error ${response.status}`
        );
    }

    return response.json();
}

app.post("/schedule", async (req, res) => {

    try {

        await sendLog(
            "info",
            "handler",
            "Schedule request received"
        );

        const {
            depotId,
            hours
        } = req.body || {};

        const depotsData =
            await fetchDepots();

        const vehiclesData =
            await fetchVehicles();

        const depots =
            depotsData.depots || [];

        const vehicles =
            vehiclesData.vehicles || [];

        let availableHours =
            Number(hours);

        if (
            depotId &&
            !availableHours
        ) {

            const depot =
                depots.find(
                    d => d.ID == depotId
                );

            if (!depot) {

                return res
                    .status(404)
                    .json({
                        error:
                            "Depot not found"
                    });
            }

            availableHours =
                depot.MechanicHours;
        }

        if (!availableHours) {

            return res
                .status(400)
                .json({
                    error:
                        "Provide hours or depotId"
                });
        }

        const result =
            maxImpact(
                availableHours,
                vehicles
            );

        await sendLog(
            "info",
            "service",
            `Max impact computed = ${result.maxImpact}`
        );

        return res.json({
            depotId:
                depotId || null,
            mechanicHours:
                availableHours,
            totalImpact:
                result.maxImpact,
            selectedTasks:
                result.selectedIDs
        });

    } catch (err) {

        console.error("ERROR =", err.message);

        await sendLog(
            "error",
            "handler",
            err.message
        );

        return res
            .status(500)
            .json({
                error:
                    err.message
            });
    }
});

const PORT =
    process.env.PORT || 3030;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

    console.log(
        "ACCESS_TOKEN Loaded:",
        !!process.env.ACCESS_TOKEN
    );
});