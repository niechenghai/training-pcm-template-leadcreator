/*global QUnit*/

sap.ui.define([
	"comdemo.pcm./leadcreator/controller/TLeadCreator.controller"
], function (Controller) {
	"use strict";

	QUnit.module("TLeadCreator Controller");

	QUnit.test("I should test the TLeadCreator controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
