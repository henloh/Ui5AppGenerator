// copy this file, insert your gateway information and rename it to gwLogin.js
exports.init = () => { return "User:Password" }


exports.target = () => { return "gateway.my-company.org" }


exports.hostname = () => { return "my-company.org" }

// Path to the Folder where all apps are
const workDir = require("os").homedir() + "\\Documents\\Git\\"
exports.workdir = () => {
    return workDir
}