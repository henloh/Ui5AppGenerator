const fs = require("fs")
const beautify = require("js-beautify").js

exports.init = (app) => {

    app.get("/getLocalApps", (req, res, next) => {
        try {
            getDirectories = source =>
                fs.readdirSync(source, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name)
            var aDirs = getDirectories("./")
            var aApps = []
            for (var i = 0; i < aDirs.length; i++) {
                if (!["\.git", "\.vscode", "node_modules"].includes(aDirs[i])) {
                    var oItem = {
                        Name: aDirs[i],
                        GitType: "GitInit"
                    }
                    var oInfo = JSON.parse(fs.readFileSync("./" + aDirs[i] + "/zProjInfo.json").toString())
                    if (oInfo.gitInitialized) {
                        oItem.GitType = "Git"
                        // der GitType bestimmt welcher Dialog im Frontend geöffnet wird 
                        // entweder zum Angeben einer Remote URL
                        // oder zum Eingeben der Commit Nachricht
                    }
                    aApps.push(oItem)
                }
            }
            res.send(JSON.stringify(aApps))
        } catch (e) {
            res.send("Error")
        }
    });

    app.post("/addService", (req, res, next) => {
        try {
            var sProjname = req.body.Projekt
            var sService = req.body.iValue1
            var sModel = req.body.iValue2

            var sDir = "./" + sProjname + "/webapp/manifest.json"
            var fManifest = JSON.parse(fs.readFileSync(sDir).toString())

            const oDataSource = {
                uri: "/sap/opu/odata/sap/" + sService + "/",
                type: "OData",
                settings: {
                    localUri: "localService/metadata.xml"
                }
            }
            const oModel = {
                type: "sap.ui.model.odata.v2.ODataModel",
                settings: {
                    defaultOperationMode: "Server",
                    defaultBindingMode: "TwoWay",
                    defaultCountMode: "Request"
                },
                dataSource: sService
            }

            fManifest["sap.app"].dataSources[sService] = oDataSource
            fManifest["sap.ui5"].models[sModel] = oModel
            fManifest = JSON.stringify(fManifest)
            fManifest = beautify(fManifest, { indent_size: 4, space_in_empty_paren: false })

            fs.writeFileSync(sDir, fManifest)
            res.send(sService + "/" + sModel)
        } catch (e) {
            console.log(e)
            res.send("Error")
        }
    });

    app.post("/getAppViews", (req, res, next) => {
        try {
            var sProjname = req.body.Name
            var sDir = "./" + sProjname + "/webapp/controller/"
            var aWrong = ["App.controller.js", "BaseController.js", "NotFound.controller.js", "Template.controller.js"]

            getDirectories = source =>
                fs.readdirSync(source, { withFileTypes: true })
                    .map(dirent => dirent.name)

            var aDirs = getDirectories(sDir)
            var aResult = []
            for (var a = 0; a < aDirs.length; a++) {
                if (!aWrong.includes(aDirs[a])) {
                    aResult.push({ "Name": aDirs[a] })
                }
            }
            res.send(JSON.stringify(aResult))
        } catch (e) {
            console.log(e)
            res.send("Error")
        }
    });

    app.post("/addView", (req, res, next) => {
        try {
            var sProjname = req.body.Projekt
            var sView = req.body.iValue1

            var fView = fs.readFileSync("./" + sProjname + "/webapp/view/Template.view.xml").toString()
            var fController = fs.readFileSync("./" + sProjname + "/webapp/controller/Template.controller.js").toString()
            var fManifest = JSON.parse(fs.readFileSync("./" + sProjname + "/webapp/manifest.json").toString())

            fView = fView.replace(/\{\{ProjectName\}\}/g, sProjname)
            fController = fController.replace(/\{\{ProjectName\}\}/g, sProjname)
            fView = fView.replace(/\{\{Template\}\}/g, sView)
            fController = fController.replace(/\{\{Template\}\}/g, sView)

            const oTarget = {
                "viewType": "XML",
                "transition": "slide",
                "viewPath": "myApps." + sProjname + ".view",
                "viewName": sView,
                "viewId": sView,
                "viewLevel": 2
            }
            const oRoute = {
                "name": sView,
                "pattern": sView,
                "titleTarget": "",
                "greedy": false,
                "target": [sView]
            }
            fManifest["sap.ui5"].routing.routes.push(oRoute)
            fManifest["sap.ui5"].routing.targets[sView] = oTarget
            fManifest = JSON.stringify(fManifest)
            fManifest = beautify(fManifest, { indent_size: 4, space_in_empty_paren: false })

            fs.writeFileSync("./" + sProjname + "/webapp/view/" + sView + ".view.xml", fView)
            fs.writeFileSync("./" + sProjname + "/webapp/controller/" + sView + ".controller.js", fController)
            fs.writeFileSync("./" + sProjname + "/webapp/manifest.json", fManifest)

            res.send(sView)
        } catch (e) {
            console.log(e)
            res.send("Error")
        }
    });

    app.post("/addDialog", (req, res, next) => {
        // because we work with string includes we need to make sure the breakpoints
        // are separable with these. for other inserts I recommend using another file
        // at some point those vars will geht changed to something more speaking
        try {
            var sProjname = req.body.Projekt
            var sViewname = req.body.View
            var sDialogname = req.body.Dialog
            const prePlacements = [{
                    breakpoint: "##00breakDialogTypes",
                    placeholder: "//##00placeholderDialogTypes"
                }, {
                    breakpoint: "##01breakDialogInit",
                    placeholder: "//##01placeholderDialogInit"
                }, {
                    breakpoint: "##03breakDialogOpen",
                    placeholder: "//##03placeholderOpenDialog"
                }
            ]
            const multiPlacements = [{
                    breakpoint: "##02breakEventReaderDlgs",
                    placeholder: "//##02placeholderEventReaderDlgs"
                }, {
                    breakpoint: "##04breakNewDialogType",
                    placeholder: "//##04placeholderNewDialogType"
                }, {
                    breakpoint: "##05breakDialogVar",
                    placeholder: "//##05placeholderDialogVar"
                }, {
                    breakpoint: "##06breakDialogSwitch",
                    placeholder: "//##06placeholderDialogSwitch"
                }, {
                    breakpoint: "##07breakSwitchDialogOpen",
                    placeholder: "//##07placeholderSwitchOpenDialog"
                }
            ]
            var sController = "./" + sProjname + "/webapp/controller/" + sViewname
            // Replacements laden
            var txtReplacements = fs.readFileSync("./AppGen/lib/PlaceholderData.txt").toString()
            // Fragment anlegen
            var sFragment = fs.readFileSync("./AppGen/App/webapp/view/Fragment.xml").toString()
            sFragment = sFragment.replace(/\{\{DialogName\}\}/g, sDialogname)
            fs.writeFileSync("./" + sProjname + "/webapp/view/" + sDialogname + ".fragment.xml", sFragment)
            // JS Types anlegen
            var jsController = fs.readFileSync(sController).toString()
            var sInsert
            var aTemp
            for (var m = 0; m < prePlacements.length; m++) {
                aTemp = []
                // check pre-requirements first
                if (jsController.includes(prePlacements[m].placeholder)) {
                    sInsert = txtReplacements.split(prePlacements[m].breakpoint)[1]
                    aTemp = jsController.split(prePlacements[m].placeholder)
                    jsController = aTemp[0] + sInsert + aTemp[1]
                } else {
                    break
                }
            }            
            for (var m = 0; m < multiPlacements.length; m++) {
                aTemp = []
                sInsert = txtReplacements.split(multiPlacements[m].breakpoint)[1]
                aTemp = jsController.split(multiPlacements[m].placeholder)
                jsController = aTemp[0] + sInsert + aTemp[1]
            }

            jsController = jsController.replace(/\{\{DialogName\}\}/g, sDialogname)
            jsController = jsController.replace(/\{\{ProjectName\}\}/g, sProjname)
            jsController = beautify(jsController, { indent_size: 4, space_in_empty_paren: false })
            fs.writeFileSync(sController, jsController)
            res.send(sProjname)
        } catch (e) {
            console.log(e)
            res.send("Error")
        }
    });
}

// #################################################################################
// #################################################################################
// ############################   HELPERS   ########################################
// #################################################################################
// #################################################################################