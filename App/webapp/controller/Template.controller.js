sap.ui.define([
	"myApps/{{ProjectName}}/controller/BaseController"
], function (Controller) {
	"use strict";
    var i18n;
    var that;
    //##00placeholderDialogTypes
    //##05placeholderDialogVar

	return Controller.extend("myApps.{{ProjectName}}.controller.{{Template}}", {

		onInit: function () {
            i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            that = this;
        },
        //##03placeholderOpenDialog
        //_______________________________________________________________
        //____________________Helpers____________________________________
        //_______________________________________________________________
        
        //##01placeholderDialogInit
	});

});