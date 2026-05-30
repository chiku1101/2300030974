const sendLog = async (level, packageName, message) => {
    const token = process.env.ACCESS_TOKEN;
    const data = {
        stack : "backend",
        level : level,
        package : packageName,
        message : message
    };
    await fetch("http://4.224.186.213/evaluation-service/logs", {
        method: "POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

module.exports = {
    sendLog
};



