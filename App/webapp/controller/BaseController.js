sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";
    return Controller.extend("myApps.{{ProjectName}}.controller.BaseController", {

        navTo: function (sTarget) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo(sTarget);
        },

        onNavBack: function (oEvent) {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("TargetApp", {}, true /*no history*/);
            }
        },
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
        //_______________________________________________________________
        //____________________Helpers____________________________________
        //_______________________________________________________________

        showODataError: function (oError) {
            var showMsg;
            try {
                var errObj = JSON.parse(oError.responseText);
                if (errObj.error.message.value) {
                    showMsg = errObj.error.message.value;
                }
            } catch (e) {
                showMsg = "Error! (No Error-Text available)";
            }
            sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                MessageToast.show(showMsg, {
                    duration: 4000
                });
            });
        }
    });
});