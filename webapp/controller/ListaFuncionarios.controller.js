sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.overview.controller.ListaFuncionarios", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App5cac949efdab09167c989397";

			var oParams = {};
			var oView = this.getView();
			var bSelectFirstListItem = true;
			if (oEvent.mParameters.data.context || oEvent.mParameters.data.masterContext) {
				this.sContext = oEvent.mParameters.data.context;

				this.sMasterContext = oEvent.mParameters.data.masterContext;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sMasterContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sMasterContext) {
				oPath = {
					path: "/" + this.sMasterContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			} else if (this.sContext) {
				var sCurrentContextPath = "/" + this.sContext;

				bSelectFirstListItem = false;
			}

			if (bSelectFirstListItem) {
				oView.addEventDelegate({
					onBeforeShow: function() {
						var oContent = this.getView().getContent();
						if (oContent) {
							if (!sap.ui.Device.system.phone) {
								var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
								if (oList) {
									var sContentName = oList.getMetadata().getName();
									if (sContentName.indexOf("List") > -1) {
										oList.attachEventOnce("updateFinished", function() {
											var oFirstListItem = this.getItems()[0];
											if (oFirstListItem) {
												oList.setSelectedItem(oFirstListItem);
												oList.fireItemPress({
													listItem: oFirstListItem
												});
											}
										}.bind(oList));
									}
								}
							}
						}
					}.bind(this)
				});
			}

		},
		_attachSelectListItemWithContextPath: function(sContextPath) {
			var oView = this.getView();
			var oContent = this.getView().getContent();
			if (oContent) {
				if (!sap.ui.Device.system.phone) {
					var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
					if (oList && sContextPath) {
						var sContentName = oList.getMetadata().getName();
						var oItemToSelect, oItem, oContext, aItems, i;
						if (sContentName.indexOf("List") > -1) {
							if (oList.getItems().length) {
								oItemToSelect = null;
								aItems = oList.getItems();
								for (i = 0; i < aItems.length; i++) {
									oItem = aItems[i];
									oContext = oItem.getBindingContext();
									if (oContext && oContext.getPath() === sContextPath) {
										oItemToSelect = oItem;
									}
								}
								if (oItemToSelect) {
									oList.setSelectedItem(oItemToSelect);
								}
							} else {
								oView.addEventDelegate({
									onBeforeShow: function() {
										oList.attachEventOnce("updateFinished", function() {
											oItemToSelect = null;
											aItems = oList.getItems();
											for (i = 0; i < aItems.length; i++) {
												oItem = aItems[i];
												oContext = oItem.getBindingContext();
												if (oContext && oContext.getPath() === sContextPath) {
													oItemToSelect = oItem;
												}
											}
											if (oItemToSelect) {
												oList.setSelectedItem(oItemToSelect);
											}
										});
									}
								});
							}
						}

					}
				}
			}

		},

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget(	"ListaFuncionarios").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oData;

			$.ajax({
				type : "GET",
				contentType : "application/json",
				url : "employees/api/v2/employees",
				dataType : "json",
				async: false, 
				success : function (data) {
					oData = data
				}
			})

			var oModel = new JSONModel(oData);
			var oList = this.byId("tabela1");
			oList.setModel(oModel);

		}
	});
}, /* bExport= */ true);
