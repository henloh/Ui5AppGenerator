const fs = require("fs")
const exec = require("child_process").exec
const beautify = require("js-beautify").js

// Login Daten - siehe Index JS
const gwlogin = require("./../gwlogin")
const workDir = gwlogin.workdir()

exports.init = (app) => {

    app.post("/BuildApp", (req, res, next) => {
        console.log("Building...")
        async function fBuild() {
            try {
                var sProjname = req.body.Name
                sProjname = await buildApp(sProjname)
                if (sProjname === "ErrorOnBuild") {
                    throw Error("'ui5 build' failed")
                }
                console.log("Build finished")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("ErrorOnBuild")
            }
        }
        fBuild()
    });

    app.post("/getLastDeploy", (req, res, next) => {
        async function fInitGit() {
            try {
                var sProjname = req.body.Name
                var sProjInfo = "./" + sProjname + "/zProjInfo.json"
                var oPorjInfo = JSON.parse(fs.readFileSync(sProjInfo).toString())
                if (oPorjInfo.lastCommit) {
                    var data = {
                        package: oPorjInfo.lastCommit.package,
                        bsp: oPorjInfo.lastCommit.bsp,
                        bsptext: oPorjInfo.lastCommit.bsptext,
                        transport: oPorjInfo.lastCommit.transport
                    }
                    res.send(JSON.stringify(data))
                    return;
                }
                res.send("Not found")
            } catch (error) {
                res.send(error)
            }
        }
        fInitGit()
    });

    app.post("/deployApp", (req, res, next) => {
        async function fInitGit() {
            try {
                var sProjname = req.body.Name
                var sProjInfo = "./" + sProjname + "/zProjInfo.json"
                var oPorjInfo = JSON.parse(fs.readFileSync(sProjInfo).toString())
                console.log("Deploying App ....")
                oPorjInfo.lastCommit = {
                    package: req.body.package.trim(),
                    bsp: req.body.bsp.trim(),
                    bsptext: req.body.bsptext.trim(),
                    transport: req.body.transport.trim()
                }
                oPorjInfo = beautify(JSON.stringify(oPorjInfo), { indent_size: 4, space_in_empty_paren: false })
                fs.writeFileSync(sProjInfo, oPorjInfo)
                sProjname = await deployApp(sProjname, req.body.package, req.body.bsp, req.body.bsptext, req.body.transport)
                if (sProjname === "ErrorOnDeploy") {
                    throw Error("npx Deploy failed")
                }
                console.log("App deploy successfull.")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("ErrorOnDeploy")
            }
        }
        fInitGit()
    });
}

// #################################################################################
// #################################################################################
// ############################   HELPERS   ########################################
// #################################################################################
// #################################################################################

buildApp = (sProjname) => {
    changeParameter = (sFilePath, bDeploy) => {
        var fnChangeCorePath
        if (bDeploy) {
            fnChangeCorePath = (sFile) => {
                return sFile.replace(/https:\/\/sapui5\.hana\.ondemand\.com\/resources\/sap-ui-core\.js/g, "../../resources/sap-ui-core.js")
            }
        }
        var sIndexFile = fs.readFileSync(sFilePath).toString()
        sIndexFile = fnChangeCorePath(sIndexFile)
        fs.writeFileSync(sFilePath, sIndexFile)
    }

    return new Promise((resolve, reject) => {
        try {
            exec("ui5 build", {
                cwd: workDir + sProjname,
                windowsHide: false
            }, (error, stdout, stderr) => {
                if (error) {
                    throw Error(error);
                }
                console.log(stdout)
                changeParameter("./" + sProjname + "/dist/index.html", true)
                resolve(sProjname)
            });
        } catch (e) {
            console.log(e)
            reject("ErrorOnBuild")
        }
    })
}

deployApp = (sProjname, Package, Bsp, Bsp_text, Transport) => {
    var aUserLogin = gwlogin.init()
    aUserLogin = aUserLogin.split(":")
    var sCommand = "npx nwabap upload "
    //Dist
    sCommand += " --base ./dist "
    // Server
    sCommand += " --conn_server \"http://" + gwlogin.target() + ":8000\" "
    // User
    sCommand += " --conn_user \"" + aUserLogin[0] + "\" "
    // Password
    sCommand += " --conn_password \"" + aUserLogin[1] + "\" "
    // Package
    sCommand += " --abap_package \"" + Package + "\" "
    // Bsp
    sCommand += " --abap_bsp \"" + Bsp + "\" "
    // Bsp_text
    sCommand += " --abap_bsp_text \"" + Bsp_text + "\" "
    // Transport
    sCommand += " --abap_transport \"" + Transport + "\" "
    // Language
    sCommand += " --abap_language \"DE\" "

    // Remove spaces
    sCommand = sCommand.replace(/  +/g, ' ')
    // Template
    /* npx nwabap upload 
        --base ./dist 
        --conn_server \"ABAP_DEVELOPMENT_SERVER_HOST\" 
        --conn_user \"ABAP_DEVELOPMENT_USER\" 
        --conn_password \"ABAP_DEVELOPMENT_PASSWORD\" 
        --abap_package \"ABAP_PACKAGE\" 
        --abap_bsp \"ABAP_APPLICATION_NAME\" 
        --abap_bsp_text \"ABAP_APPLICATION_DESC\" 
        --abap_transport \"TRANSPORTNR\"
        --abap_language \"SPRACHE\"
    */
    return new Promise((resolve, reject) => {
        try {
            exec(sCommand, {
                cwd: workDir + sProjname,
                windowsHide: false
            },
                (error, stdout, stderr) => {
                    if (error) {
                        throw Error(error);
                    }
                    console.log(stdout)
                    resolve(sProjname)
                });
        } catch (e) {
            console.log(e)
            reject("ErrorOnDeploy")
        }
    })
}

