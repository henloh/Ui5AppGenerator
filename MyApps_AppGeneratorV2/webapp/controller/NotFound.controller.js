sap.ui.define([
	"myApps/AppGenerator/controller/BaseController"
], function (Controller) {
	"use strict";

	return Controller.extend("myApps.AppGenerator.controller.NotFound", {

		onInit: function () {
			var oRouter = this.getRouter();
			var oTarget = oRouter.getTarget("notFound");
			oTarget.attachDisplay(function (oEvent) {
				this._oData = oEvent.getParameter("data"); //store the data
			}, this);
		},
		// override the parent's onNavBack (inherited from BaseController)
		onNavBack: function (oEvent) {
			// in some cases we could display a certain target when the back button is pressed
			if (this._oData && this._oData.fromTarget) {
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData.fromTarget;
				return;
			}
			// call the parent's onNavBack
			Controller.prototype.onNavBack.apply(this, arguments);

		}

	});

});