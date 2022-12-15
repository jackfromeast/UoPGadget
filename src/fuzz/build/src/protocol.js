"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WorkerMessageType;
(function (WorkerMessageType) {
    WorkerMessageType[WorkerMessageType["RESULT"] = 0] = "RESULT";
    WorkerMessageType[WorkerMessageType["CRASH"] = 1] = "CRASH";
})(WorkerMessageType = exports.WorkerMessageType || (exports.WorkerMessageType = {}));
var ManageMessageType;
(function (ManageMessageType) {
    ManageMessageType[ManageMessageType["WORK"] = 0] = "WORK";
    ManageMessageType[ManageMessageType["STOP"] = 1] = "STOP";
})(ManageMessageType = exports.ManageMessageType || (exports.ManageMessageType = {}));
//# sourceMappingURL=protocol.js.map