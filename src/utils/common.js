//const moment = require('moment');
const moment = require('moment-timezone');

function currentDateTime() {
    //current_dt = moment().format("YYYY-MM-DD HH:mm:ss");
    let current_dt = moment().tz('Asia/Kolkata').format("YYYY-MM-DD HH:mm:ss");
    return current_dt
}

module.exports = { currentDateTime }