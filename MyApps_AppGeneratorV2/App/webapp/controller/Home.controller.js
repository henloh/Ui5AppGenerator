sap.ui.define([
	"myApps/{{ProjectName}}/controller/BaseController"
], function (Controller) {
    "use strict";
    var i18n;
    var that;
    //##05placeholderDialogVar
    //##00placeholderDialogTypes

	return Controller.extend("myApps.{{ProjectName}}.controller.Home", {

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