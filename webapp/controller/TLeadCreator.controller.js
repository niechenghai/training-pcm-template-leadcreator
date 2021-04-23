sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/m/BusyDialog",
    "jquery.sap.global",
    "sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, BusyDialog, jQuery, MessageToast) {
		"use strict";

		return Controller.extend("com.demo.pcm.leadcreator.controller.TLeadCreator", {
			busyDialog: null,

            _viewData: {
                "Name": null,
                "Company": null,
                "ContactFirstName": null,
                "ContactLastName": null,
                "HouseNumber": null,
                "Street": null,
                "City": null,
                "PostalCode": null,
                "Country": null,
                "UserStatusCode": null,
                "Category": null
            },

            valueHelpersMetaData: {
                "combobox": {
                    "Country": {
                        "CollectionPath": "LeadCountry",
                        "searchSupported": false,
                        "viewParams": {
                            "Code": [
                                "Country"
                            ],
                            "Description": null
                        },
                        "filterable": [],
                        "comboBox": true,
                        "BusinessObject": "LeadCollection",
                        "id": "Country_457"
                    },
                    "UserStatusCode": {
                        "CollectionPath": "LeadUserStatusCode",
                        "searchSupported": false,
                        "viewParams": {
                            "Code": [
                                "UserStatusCode"
                            ],
                            "Description": null
                        },
                        "filterable": [],
                        "comboBox": true,
                        "BusinessObject": "LeadCollection",
                        "id": "UserStatusCode_458"
                    },
                    "Category": {
                        "CollectionPath": "LeadCategory",
                        "searchSupported": false,
                        "viewParams": {
                            "Code": [
                                "Category"
                            ],
                            "Description": null
                        },
                        "filterable": [],
                        "comboBox": true,
                        "BusinessObject": "LeadCollection",
                        "id": "Category_459"
                    }
                }
            },

			onInit: function () {
                var viewData = Object.assign({}, this._viewData);

                var index;
                var oViewModel = new sap.ui.model.json.JSONModel();
                oViewModel.setSizeLimit(260);
                var oForm = this.getFormView();

                this.busyDialog = new BusyDialog();
                oForm.setModel(oViewModel);
			    oViewModel.setData(viewData);
            
            },
            
            getFormView: function getFormView() {
                return this.getView().byId("LeadCollection_Form");
            },

            onValueHelpChanged: function onValueHelpChanged(obj) {
                var formModel = this.getFormView().getModel(),
                    updateData = {}, i, j;
                    
                if (this.inputFromValueHelp && this.inputFromValueHelp.getValueState() === "Error") {
                    this.inputFromValueHelp.setValueState("None");
                }
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        for (j = 0; j < obj[i].localsIds.length; j++) {
                            updateData[obj[i].localsIds[j]] = obj[i].value;
                        }
                    }
                }

                formModel.setData(updateData, true);
            },
            isValidFormInFragment: function(fragment) {
                var input,
                    inputId,
                    isValid = true,
                    that = this,
                    bundle,
                    labels = fragment.$().find(".sapMLabelRequired:visible");

                $.each(labels, function() {
                    input = $(this).closest(".sapMVBox").find("input");
                    inputId = input.attr("id");
                    inputId = inputId.indexOf("-inner") >= 0 ? inputId.substr(0, inputId.indexOf("-inner")) : inputId;
                    input = sap.ui.getCore().byId(inputId);
                    if (input) {
                        if (!input.getValue()) {
                            isValid = false;
                            input.setValueState("Error");
                            bundle = that.getView().getModel("i18n_Static").getResourceBundle();
                            sap.m.MessageToast.show(bundle.getText("starterCreateTemplate.create.error.save.notification"));
                        } else {
                            input.setValueState("None");
                        }
                    }
                });

                if (isValid) {
                    input = fragment.$().find(".sapMInputBaseErrorInner");
                    if (input.length) {
                        isValid = false;
                        bundle = that.getView().getModel("i18n_Static").getResourceBundle();
                        sap.m.MessageToast.show(bundle.getText("starterCreateTemplate.create.additional.error.save.notification"));
                    }

                }
                return isValid;

            },
            isValidForm: function() {
                var fragment = this.getFormView();
                var isValid = this.isValidFormInFragment(fragment);
                return isValid;
            },

            resetForm: function() {
                var form = this.getFormView(),
                    data = form.getModel().getData(),
                    i;

                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        if (!$.isArray(data[i])) {
                            data[i] = null;
                        }
                    }
                }

                var comboboxes = form.$().find(".sapMComboBox"),
                    core = sap.ui.getCore();

                for (var j = 0, l = comboboxes.length; j < l; j++) {
                    core.byId(comboboxes[j].id).setSelectedKey("");
                }

                this.getFormView().getModel().setData(data, true);
                var fragment = this.getFormView();
                var input = fragment.$().find(".sapMInputBaseErrorInner");
                var inputId;
                input.each(function(t, val) {
                    inputId = val.id;
                    inputId = inputId.indexOf("-inner") >= 0 ? inputId.substr(0, inputId.indexOf("-inner")) : inputId;
                    input = sap.ui.getCore().byId(inputId);
                    if (input.getType() === "Number") {
                        input.setValue("0");
                        input.setValue("");
                    }
                    input.setValueState("None");
                });
            },

            handleComboChange: function handleComboChange(oEvent) {

                this.viewDataCombo = this.viewDataCombo || {};
                var src = oEvent.getSource(),
                    name = src.getName();
                this.viewDataCombo[name] = src.getSelectedKey();
            },
            handleRequiredInputChange: function handleComboChange(oEvent) {
                var src = oEvent.getSource();
                var type = src.getType();
                if (type === "Number") {
                    if (src.getValue() === "") {
                        src.setValueState("Error");
                        return;
                    }
                }
                src.setValueState("None");
            },

            saveForm: function() {
                if (!this.isValidForm()) {
                    return;
                }
                var form = this.getFormView();
                var oViewModel = form.getModel();
                var viewData = oViewModel.getData();
                var postData = {};

                var oBD = this.busyDialog;
                oBD.open();

                $.each(viewData, function(eKey, eValue) {
                    var value = eValue,
                        key = eKey;

                    function getMonth(val) {
                        var month = val.getMonth() + 1;
                        return month < 10 ? "0" + month : month;
                    }

                    function getTime(val) {
                        return val.toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0];
                    }

                    function getDateTime(val, timestamp) {
                        var date = val.getFullYear() + "-" + getMonth(val) + "-" + value.getDate();
                        var time = timestamp ? getTime(val) : "00:00:00";
                        return date + "T" + time + ".000";
                    }

                    if (value) {
                        if (value instanceof Date) {
                            //Remove "Z" from the end of the date format
                            //value = value.toJSON().replace(/Z$/, "");
                            value = getDateTime(value, false);
                        } else {
                            var control = sap.ui.getCore().byId(form.$().find("div[id*=" + key + "]").attr("id"));
                            if (control && control.getType() === "DateTime") {
                                value = new Date(value);
                                value = getDateTime(value, true);
                            }
                        }

                        if ($.isArray(value)) {
                            this.viewDataCombo = this.viewDataCombo || {};
                            key = key.replace(window.generalNameSpace.businessObject.semanticObject, "");
                            value = this.viewDataCombo[key];
                        }

                        if (value) {
                            postData[key] = value;
                        }
                    }
                }.bind(this));

                var that = this;

                console.log(postData);

                var oLeadModel = this.getOwnerComponent().getModel("lead");
                oLeadModel.create("/LeadCollection", postData, {
                    success: function(data, oRes) {
                        console.log(data);
                        oBD.close();
                        MessageToast.show("Create success!");
                        
                    }.bind(this),
                    error: function(oError) {
                        oBD.close();
                        console.log(oError);
                        MessageToast.show("Create failed!");
                    }.bind(this)
                });

            },

            
            formatTranslation: function(str) {
                var args = str.split(","),
                    params = args.slice(1),
                    view = this.getView(),
                    staticBundle = view.getModel("i18n_Static").getResourceBundle(),
                    bundle = view.getModel("i18n").getResourceBundle(),
                    i;

                for (i = 0; i < params.length; i++) {
                    params[i] = bundle.getText(params[i]);
                }

                return staticBundle.getText(args[0], params);
            }

            ///////////
		});
	});
