const fs = require("fs")
const exec = require("child_process").exec
const beautify = require("js-beautify").js
//const xmlformat = require("xml-formatter")
const oCmdCommands = {
    Init: "Init",
    AddRemote: "AddRemote",
    AddAll: "AddAll",
    Commit: "Commit",
    InitPush: "InitPush",
    Push: "Push",
    Pull: "Pull",
    Status: "Status"
}
// Login Daten - siehe Index JS
const gwlogin = require("./../gwlogin")
const workDir = gwlogin.workdir()


exports.init = (app) => {

    app.post("/initGit", (req, res, next) => {
        async function fInitGit() {
            try {
                var sProjname = req.body.Name
                var sProjInfo = "./" + sProjname + "/zProjInfo.json"
                var oPorjInfo = JSON.parse(fs.readFileSync(sProjInfo).toString())
                oPorjInfo.gitUrl = req.body.Url
                oPorjInfo.gitInitialized = true
                oPorjInfo = beautify(JSON.stringify(oPorjInfo), { indent_size: 4, space_in_empty_paren: false })
                fs.writeFileSync(sProjInfo, oPorjInfo)
                const oInitCommands = [
                    "Init",
                    "AddRemote",
                    "AddAll",
                    "Commit",
                    "InitPush"
                ]
                var bodyurl
                var initcommit
                var status
                for (var m = 0; m < oInitCommands.length; m++) {
                    bodyurl = undefined
                    initcommit = undefined
                    if (oInitCommands[m] === "AddRemote") {
                        bodyurl = req.body.Url
                    }
                    if (oInitCommands[m] === "") {
                        initcommit = "init"
                    }
                    status = await gitHelpers(oInitCommands[m], sProjname, bodyurl, initcommit)
                    if (status === "ErrorOnGit") {
                        throw Error("Git failed - pls check status in folder.")
                    }
                }
                sProjname = status;
                console.log("Git initialisation finished successfull.")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("ErrorOnGit")
            }
        }
        fInitGit()
    });


    app.post("/commitAndPush", (req, res, next) => {
        async function fInitGit() {
            try {
                var sProjname = req.body.Name
                var status = await gitHelpers(oCmdCommands.Status, sProjname)
                if (status.includes("On branch") && 
                    status.includes("Your branch is up to date with") &&
                    status.includes("nothing to commit, working tree clean")) {
                    res.send({Text: "NothingToCommit", Value: status})
                    return
                } else if (status.includes("On branch") &&
                    status.includes("Your branch is ahead of") &&
                    status.includes("nothing to commit, working tree clean")) {
                    await gitHelpers(oCmdCommands.Push, sProjname)
                    res.send({Text: "YouAreAhead", Value: status})
                    return
                }
                await gitHelpers(oCmdCommands.AddAll, sProjname)
                await gitHelpers(oCmdCommands.Commit, sProjname, null, req.body.Msg)
                
                status = await gitHelpers(oCmdCommands.Pull, sProjname)
                if (status.Text === "PullFinished") {
                    console.log("Git pull executed, current status: ")
                    status = await gitHelpers(oCmdCommands.Status, sProjname)
                    console.log(status)
                    res.send({Text: "GitStatus", Value: status});
                    return
                }

                status = await gitHelpers(oCmdCommands.Push, sProjname)
                if (status === "ErrorOnGit") {
                    throw Error("Git failed - pls check status in folder.")
                }
                console.log("Git push successfull.")
                res.send({Text:sProjname, Value: ""})
            } catch (e) {
                console.log(e)
                res.send("ErrorOnGit")
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


gitHelpers = (sType, sProjname, sUrl, sMsg) => {
    var sCommand
    switch (sType) {
        case oCmdCommands.Init:
            sCommand = "git init";
            break;
        case oCmdCommands.AddRemote:
            sCommand = "git remote add origin " + sUrl;
            break;
        case oCmdCommands.AddAll:
            sCommand = "git add -A";
            break;
        case oCmdCommands.Commit:
            sCommand = "git commit --message=\"" + sMsg + "\"";
            break;
        case oCmdCommands.InitPush:
            sCommand = "git push --set-upstream origin master";
            break;
        case oCmdCommands.Push:
            sCommand = "git push";
            break;
        case oCmdCommands.Pull:
            sCommand = "git pull";
            break;
        case oCmdCommands.Status:
            sCommand = "git status";
            break;
        default:
            return false;
    }
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
                    if (sType === oCmdCommands.Status) { 
                        resolve(stdout)
                        return
                    }
                    if (sType === oCmdCommands.Pull &&
                        !stdout.includes("Already up to date.")) {
                        resolve({Text: "PullFinished", Value: stdout})
                        return
                    }
                    resolve(sProjname)
                });
        } catch (e) {
            console.log(e)
            reject("ErrorOnGit")
        }
    })
}
