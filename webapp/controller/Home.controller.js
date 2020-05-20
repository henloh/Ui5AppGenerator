sap.ui.define([
    "myApps/AppGenerator/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function(Controller, JSONModel, Fragment, MessageToast) {
    "use strict";
    var i18n;
    var that;
    var oAppsModel;
    var oCreation = undefined;
    var oGit = undefined;
    var oDeploy = undefined;
    var oGitInit = undefined;
    var oDialog = undefined;
    var oSimpelTime = undefined;
    //##05placeholderDialogVar 
    var oTypes = {
        Service: "Service",
        View: "View",
        Git: "Git",
        GitInit: "GitInit",
        Deploy: "Deploy",
        Dialog: "Dialog",
        SimpelTime: "SimpelTime",
        //##04placeholderNewDialogType 
    };

    return Controller.extend("myApps.AppGenerator.controller.Home", {

        onInit: function() {
            i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            that = this;
            oAppsModel = new JSONModel();
            that._getApps();
        },
        onBuildApp: function(sName) {
            var oInfos = {
                Name: sName
            };
            that.getView().setBusy(true);
            $.ajax({
                type: "POST",
                url: "/BuildApp",
                data: oInfos,
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data.text === "ErrorOnBuild") {
                    sText = "Error on Build";
                } else {
                    sText = "Build successfull.";
                }
                that.getView().setBusy(false);
                MessageToast.show(sText, {
                    duration: 4000
                });
            });
        },
        onCloseCreate: function(oEvent) {
            oCreation.close();
        },
        onCloseGit: function(oEvent) {
            oGit.close();
        },
        onCloseGitInit: function(oEvent) {
            oGitInit.close();
        },
        onCloseSimpelTime: function(oEvent) {
            oSimpelTime.close();
        },
        onCloseDeploy: function(oEvent) {
            oDeploy.close();
        },
        onDeploy: function(oEvent) {
            that.getView().setBusy(true);
            oDeploy.close();
            $.ajax({
                type: "POST",
                url: "/deployApp",
                data: oDeploy.binding.getModel("deploy").getData(),
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data.text === "ErrorOnDeploy") {
                    sText = "Error on Deploy.";
                } else {
                    sText = "Deploy successfull.";
                }
                that.getView().setBusy(false);
                that._getApps();
                MessageToast.show(sText, {
                    duration: 4000
                });
            });
        },
        onEstimate: function(oEvent) {
            
            var convertTime = function(sTime) {
                var aTime = sTime.split(":")
                return {
                    hours: parseInt(aTime[0],10),
                    minutes: parseInt(aTime[1],10)
                }
            }
            var data = oSimpelTime.binding.getModel("Time").getData();
            
            var iBreak = data.Break;
            var StartTime = data.StartTime;
            var EndTime = data.EndTime;

            StartTime = convertTime(StartTime);
            EndTime = convertTime(EndTime);
            var calcDate = new Date();
            calcDate.setHours(EndTime.hours - StartTime.hours);
            calcDate.setMinutes(EndTime.minutes - StartTime.minutes - iBreak);
            var workTime = calcDate.getHours() + ((calcDate.getMinutes() / 0.6)/100);
            
            MessageToast.show(workTime.toString(), {
                duration: 4000
            });
        },
        onGenerate: function() {
            var name = this.getView().byId("iAppName").getValue();
            name = name.trim();
            if (/^[a-zA-Z0-9]{2,200}$/.test(name)) {
                console.log("valid name");
            } else {
                console.log("invalid name");
                MessageToast.show("App name not valid (a-Z, 0-9, length 2-200)", {
                    duration: 4000
                });
                return;
            }
            that.getView().setBusy(true);
            $.ajax({
                type: "POST",
                url: "/CreateApp",
                data: {
                    Name: name
                },
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data.text === "ErrorOnCreate") {
                    sText = "Eror in creating a file.";
                } else {
                    sText = "App \"" + name + "\" cration successfull.";
                }
                that.getView().setBusy(false);
                that._getApps();
                MessageToast.show(sText, {
                    duration: 4000
                });
            });
        },
        onGitInit: function(oEvent) {
            var oInfos = oGitInit.binding.getModel("git").getData();
            oGitInit.close();
            that.getView().setBusy(true);
            $.ajax({
                type: "POST",
                url: "/initGit",
                data: oInfos,
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data === "Error") {
                    sText = "Error on initialisation";
                } else {
                    sText = "Git init successfull.";
                }
                that.getView().setBusy(false);
                MessageToast.show(sText, {
                    duration: 4000
                });
            });
        },
        onGitCnP: function(oEvent) {
            // Post Commit MSG
            var oInfos = oGit.binding.getModel("git").getData();
            that.getView().setBusy(true);
            $.ajax({
                type: "POST",
                url: "/commitAndPush",
                data: oInfos,
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                var sStatusText = false;
                data = JSON.parse(data);
                if (data === "ErrorOnGit") {
                    sText = "Major error. Please look after it."
                } else if (data.Text === "GitStatus") {
                    // something has been pulled and need checking
                    // like a merge or so
                    sText = "UI no longer unsefull for git. Check git status";
                    sStatusText = data.Value;
                } else if (data.Text === "NothingToCommit") {
                    sText = "Nothing to commit.";
                    sStatusText = data.Value;
                } else if (data.Text === "YouAreAhead") {
                    sText = "Your last commit has been pushed."
                    sStatusText = "\nLast status: \n" + data.Value;
                } else {
                    sText = "Commit and push successfull.";
                }
                that.getView().setBusy(false);
                if (!sStatusText) {
                    oGit.close();
                    MessageToast.show(sText, {
                        duration: 5000
                    });
                } else {
                    oGit.binding.getModel("git").setProperty("/showStatus", true);
                    oGit.binding.getModel("git").setProperty("/statustitle", sText);
                    oGit.binding.getModel("git").setProperty("/statustext", sStatusText);
                }
            });
        },
        onExportApp: function(oEvent) {
            var contentItem = oEvent.getSource();
            var name = contentItem.getCustomData()[0].getValue();
            that.getView().setBusy(true);
            $.ajax({
                type: "POST",
                url: "/exportApp",
                data: {
                    Name: name
                },
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data.text === "Error") {
                    sText = "Fehler on creating a file.";
                } else {
                    sText = "App \"" + name + "\" export successfull.";
                }
                that.getView().setBusy(false);
                MessageToast.show(sText, {
                    duration: 4000
                });
            });
        },
        onNavMockdata: function(sName) {
            var Router = this.getRouter();
            Router.navTo("Mockdata", {
                Name: sName
            });
        },
        onNavSAPScript: function() {
            this.navTo("SapSReader");
        },
        onOpenDlg: function(sName, sType) {
            var cDlg;
            var refreshModel = undefined;
            var refreshModelName = undefined;
            switch (sType) {
                case oTypes.Service:
                    cDlg = oCreation;
                    break;
                case oTypes.View:
                    cDlg = oCreation;
                    break;
                case oTypes.Git:
                    cDlg = oGit;
                    refreshModel = that._getGitModel;
                    refreshModelName = "git";
                    break;
                case oTypes.GitInit:
                    cDlg = oGitInit;
                    break;
                case oTypes.Deploy:
                    cDlg = oDeploy;
                    refreshModel = that._getDeployModel;
                    refreshModelName = "deploy";
                    break;
                case oTypes.Dialog:
                    cDlg = oDialog;
                    refreshModel = that._getDialogModel;
                    refreshModelName = "Dialog";
                    break;
                case oTypes.SimpelTime:
                    cDlg = oSimpelTime;
                    refreshModel = that._getTimeModel;
                    refreshModelName = "Time";
                    break;
                default:
                    return;
            }
            if (!cDlg) {
                Promise.all([that._initDialog(sName, sType)]).then(function(responses) {
                    cDlg = responses[0];
                    cDlg.open();
                });
                return;
            } else {
                if (refreshModelName) {
                    Promise.all([refreshModel(sName)]).then(function(responses) {
                        cDlg.bind(responses[0], refreshModelName);
                        cDlg.open();
                    })
                    return;
                }
                cDlg.open();
            }
        },
        onSubmitSimpelTime: function(oEvent) {
            var data = oSimpelTime.binding.getModel("Time").getData();
            that.getView().setBusy(true);
            $.ajax({
                type: "POST",
                url: "/calcTime",
                data: data,
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                that.getView().setBusy(false);
                data = JSON.parse(data);
                console.log(data);
                if (data.text === "CalcError") {
                    sText = "Error on calculating Time.";
                } else {
                    sText = `Your current amount of flexible hours is ${data.time}`;
                }
                oSimpelTime.close();
                MessageToast.show(sText, {
                    duration: 7000
                });
            })
        },
        submitCreate: function(oEvent) {
            var oInfos = oCreation.binding.getModel("creation").getData();
            that.getView().setBusy(true);
            if (oInfos.Type === "View") {
                $.ajax({
                    type: "POST",
                    url: "/addView",
                    data: oInfos,
                    dataType: "text"
                }).done(function(data, status, jqxhr) {
                    var sText;
                    if (data.text === "Error") {
                        sText = "Error on creating the view.";
                    } else {
                        sText = "View \"" + oInfos.iValue1 + "\" created successfull.";
                    }
                    that.getView().setBusy(false);
                    MessageToast.show(sText, {
                        duration: 4000
                    });
                });
            } else if (oInfos.Type === "Service") {
                $.ajax({
                    type: "POST",
                    url: "/addService",
                    data: oInfos,
                    dataType: "text"
                }).done(function(data, status, jqxhr) {
                    var sText;
                    if (data.text === "Error") {
                        sText = "Error on adding Service";
                    } else {
                        sText = "Service \"" + oInfos.iValue1 + "\" added.";
                    }
                    that.getView().setBusy(false);
                    MessageToast.show(sText, {
                        duration: 4000
                    });
                });
            }
            oCreation.close();
        },
        onCreateDialog: function(oEvent) {
            var oInfos = oDialog.binding.getModel("Dialog").getData();
            $.ajax({
                type: "POST",
                url: "/addDialog",
                data: oInfos,
                dataType: "text"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data.text === "Error") {
                    sText = "Error on placing dialog.";
                } else {
                    sText = "Dialog \"" + oInfos.Dialog + "\" added to view \"" + oInfos.View + "\".";
                }
                that.getView().setBusy(false);
                MessageToast.show(sText, {
                    duration: 4000
                });
            });
            oDialog.close();
        },
        onCloseDialog: function(oEvent) {
            oDialog.close();
        },

        // #################################################################################
        // #################################################################################
        // ############################   HELPERS   ########################################
        // #################################################################################
        // #################################################################################

        _getApps: function() {
            $.ajax({
                url: "/getLocalApps"
            }).done(function(data, status, jqxhr) {
                var sText;
                if (data === "Error") {
                    sText = "Error on loading local apps";
                } else {
                    var aApps = JSON.parse(data);
                    oAppsModel.setData(aApps);
                    that.getView().byId("lLocalApps").setModel(oAppsModel);
                    that.getView().byId("lLocalApps").bindElement({
                        path: "/"
                    });
                }
            });
        },
        _getAddModel: function(sProjectName, sType) {
            var ogModel = new JSONModel();
            if (sType === "View") {
                ogModel.setData({
                    Type: sType,
                    Projekt: sProjectName,
                    at1: true,
                    lText1: "View",
                    iValue1: "",
                    at2: false,
                    lText2: "",
                    iValue2: "",
                });
            } else if (sType === "Service") {
                ogModel.setData({
                    Type: sType,
                    Projekt: sProjectName,
                    at1: true,
                    lText1: "Service",
                    iValue1: "",
                    at2: true,
                    lText2: "Model",
                    iValue2: "",
                });
            }
            return ogModel;
        },
        _getDeployModel: function(sProjectName) {
            return new Promise(function(resolve, reject) {
                var oDeployJSON = new JSONModel();
                oDeployJSON.setData({
                    package: "",
                    bsp: "",
                    bsptext: "",
                    transport: "",
                    Name: sProjectName
                });

                $.ajax({
                    type: "POST",
                    url: "/getLastDeploy",
                    data: {
                        Name: sProjectName
                    },
                    dataType: "text"
                }).done(function(data, status, jqxhr) {
                    if (data === "Not found") {
                        resolve(oDeployJSON);
                    } else {
                        data = JSON.parse(data);
                        oDeployJSON.setData({
                            package: data.package,
                            bsp: data.bsp,
                            bsptext: data.bsptext,
                            transport: data.transport,
                            Name: sProjectName
                        });
                        resolve(oDeployJSON);
                    }
                });
            });
        },
        _getGitModel: function(sProjectName) {
            var oGit = new JSONModel();
            oGit.setData({
                Msg: "",
                Name: sProjectName,
                Url: "",
                showStatus: false,
                statustitle: "",
                statustext: ""
            });
            return oGit;
        },
        _getTimeModel: function() {
            var oTime = new JSONModel();
            oTime.setData({
                Break: 0,
                StartTime: "",
                EndTime: ""
            });
            return oTime;
        },
        _getDialogModel: function(sProjectName) {
            return new Promise(function(resolve, reject) {
                var oDialog = new JSONModel();
                oDialog.setData({
                    Projekt: sProjectName,
                    View: "",
                    Dialog: ""
                });

                $.ajax({
                    type: "POST",
                    url: "/getAppViews",
                    data: {
                        Name: sProjectName
                    },
                    dataType: "text"
                }).done(function(data, status, jqxhr) {
                    if (status !== "success") {
                        reject(oDialog);
                    } else {
                        data = JSON.parse(data);
                        oDialog.setData({
                            Projekt: sProjectName,
                            View: "",
                            Dialog: "",
                            Views: data
                        });
                        resolve(oDialog);
                    }
                });
            });
        },
        _initDialog: function(sName, sType) {
            return new Promise(function(resolve, reject) {
                var baseDlg = {
                    binding: null,
                    window: null,
                    //sType: sType,
                    open: function() {
                        this.window.open();
                    },
                    close: function() {
                        this.window.close();
                    },
                    init: function(cDlg, sFragment) {
                        return new Promise(function(resolve, reject) {
                            Fragment.load({
                                name: "myApps.AppGenerator.view." + sFragment,
                                controller: that
                            }).then(function(oDialog) {
                                cDlg.binding = that.getView().addDependent(oDialog);
                                cDlg.window = oDialog;
                                resolve(cDlg);
                            });
                        });
                    },
                    bind: function(oModel, sModelName) {
                        this.binding.setModel(oModel, sModelName);
                        this.binding.bindElement({
                            path: "/",
                            model: sModelName
                        });
                        this.window.open();
                    }
                };
                switch (sType) {
                    case oTypes.Service:
                        oCreation = baseDlg;
                        // oCreation.init(oCreation, "Add");
                        Promise.all([oCreation.init(oCreation, "Add")]).then(function() {
                            oCreation.bind(that._getAddModel(sName, sType), "creation");
                        });
                        resolve(oCreation);
                        return;
                    case oTypes.View:
                        oCreation = baseDlg;
                        Promise.all([oCreation.init(oCreation, "Add")]).then(function() {
                            oCreation.bind(that._getAddModel(sName, sType), "creation");
                        });
                        resolve(oCreation);
                        return;
                    case oTypes.Git:
                        oGit = baseDlg;
                        Promise.all([oGit.init(oGit, "Git")]).then(function() {
                            oGit.bind(that._getGitModel(sName), "git");
                        });
                        resolve(oGit);
                        return;
                    case oTypes.Dialog:
                        oDialog = baseDlg;
                        Promise.all([oDialog.init(oDialog, "Dialog"), that._getDialogModel(sName)]).then(function(responses) {
                            oDialog.bind(responses[1], "Dialog");
                        });
                        resolve(oDialog);
                        return;
                    case oTypes.GitInit:
                        oGitInit = baseDlg;
                        Promise.all([oGitInit.init(oGitInit, "GitInit")]).then(function() {
                            oGitInit.bind(that._getGitModel(sName), "git");
                        });
                        resolve(oGitInit);
                        return;
                    case oTypes.Deploy:
                        oDeploy = baseDlg;
                        Promise.all([oDeploy.init(oDeploy, "Deploy"), that._getDeployModel(sName)]).then(function(responses) {
                            oDeploy.bind(responses[1], "deploy");
                        });
                        resolve(oDeploy);
                        return;
                    case oTypes.SimpelTime:
                        oSimpelTime = baseDlg;
                        Promise.all([oSimpelTime.init(oSimpelTime, "SimpelTime")]).then(function() {
                            oSimpelTime.bind(that._getTimeModel(), "Time");
                        });
                        resolve(oSimpelTime);
                        return oSimpelTime;
                        //##06placeholderDialogSwitch 
                    default:
                        reject(false);
                }
            });
        },
    });

});