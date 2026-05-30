

const fetch = require("node-fetch");

const sendLog = async (
    level,
    packageName,
    message
) => {

    try {

        const token =
            process.env.ACCESS_TOKEN;

        await fetch(
            "http://4.224.186.213/evaluation-service/logs",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`
                },
                body: JSON.stringify({
                    stack: "backend",
                    level,
                    package: packageName,
                    message
                })
            }
        );

    } catch (err) {

        console.error(
            "Logging failed:",
            err.message
        );
    }
};

module.exports = {
    sendLog
};