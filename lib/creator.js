const fs = require("fs")
const exec = require("child_process").exec
const workDir = require("./../gwlogin").workdir()

const aFiles = [
    "./AppGen/App/neo-app.json",
    "./AppGen/App/package.json",
    "./AppGen/App/zProjInfo.json",
    "./AppGen/App/.project.json",
    "./AppGen/App/.gitignore",
    "./AppGen/App/.user.project.json",
    // "./AppGen/App/Gruntfile.js",
    "./AppGen/App/ui5.yaml",
    "./AppGen/App/webapp/Component.js",
    "./AppGen/App/webapp/index.html",
    "./AppGen/App/webapp/manifest.json",
    "./AppGen/App/webapp/controller/App.controller.js",
    "./AppGen/App/webapp/controller/BaseController.js",
    "./AppGen/App/webapp/controller/Home.controller.js",
    "./AppGen/App/webapp/controller/NotFound.controller.js",
    "./AppGen/App/webapp/controller/Template.controller.js",
    "./AppGen/App/webapp/i18n/i18n.properties",
    "./AppGen/App/webapp/model/models.js",
    "./AppGen/App/webapp/view/App.view.xml",
    "./AppGen/App/webapp/view/Home.view.xml",
    "./AppGen/App/webapp/view/NotFound.view.xml",
    "./AppGen/App/webapp/view/Template.view.xml",
    "./AppGen/App/webapp/css/style.css",
    "./AppGen/App/webapp/extra/fiori.css",
    "./AppGen/App/webapp/extra/fiori.js",
    "./AppGen/App/.che/project.json"
]

exports.init = (app) => {

    app.post("/CreateApp", (req, res, next) => {
        console.log("Creating...")
        async function fCreate() {
            try {
                var sProjname = req.body.Name
                sProjname = await createApp(sProjname)
                if (sProjname === "ErrorOnCreate") {
                    throw Error("Creating files failed")
                }
                console.log("Installation complete.")
                console.log(" ")
                console.log("App creation finished.")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("ErrorOnCreate")
            }
        }
        fCreate()
    });

}

// #################################################################################
// #################################################################################
// ############################   HELPERS   ########################################
// #################################################################################
// #################################################################################

createApp = (sProjname) => {
    // archive.directory("App/", false)
    return new Promise((resolve, reject) => {
        try {
            var sDir = "./" + sProjname
            if (!fs.existsSync(sDir)) {
                fs.mkdirSync(sDir);
                fs.mkdirSync(sDir + "/webapp");
                fs.mkdirSync(sDir + "/\.che");
                fs.mkdirSync(sDir + "/webapp/controller");
                fs.mkdirSync(sDir + "/webapp/i18n");
                fs.mkdirSync(sDir + "/webapp/css");
                fs.mkdirSync(sDir + "/webapp/extra");
                fs.mkdirSync(sDir + "/webapp/view");
                fs.mkdirSync(sDir + "/webapp/model");
            } else {
                throw Error(sProjname + ": Folder already exists. Pls use unique names")
            }
            aFiles.forEach(sFilePath => {
                var sFile = fs.readFileSync(sFilePath).toString()
                sFile = sFile.replace(/\{\{ProjectName\}\}/g, sProjname)
                var newPath = sFilePath.replace(/\.\/AppGen\/App/g, "")
                fs.writeFileSync("./" + sProjname + newPath, sFile)
            })
            console.log("Files created.")
            console.log("NPM Install...")
            exec("npm i", {
                    cwd: workDir + sProjname,
                    windowsHide: false
                },
                (error, stdout, stderr) => {
                    if (error) {
                        console.log("npm install failed. Please retry manually!")
                        throw error;
                    }
                    console.log(stdout);
                    resolve(sProjname)
                }
            );
                
        } catch (e) {
            console.log(e)
            reject("ErrorOnCreate")
        }
    })
}