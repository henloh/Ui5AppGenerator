sap.ui.define([
	"myApps/AppGenerator/controller/BaseController"
], function (Controller) {
	"use strict";
    var i18n;
    var that;

	return Controller.extend("myApps.AppGenerator.controller.Template", {

		onInit: function () {
            i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            that = this;
        }

        //_______________________________________________________________
        //____________________Helpers____________________________________
        //_______________________________________________________________
        
	});

});