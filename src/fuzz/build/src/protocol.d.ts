export declare enum WorkerMessageType {
    RESULT = 0,
    CRASH = 1
}
export interface WorkerMessage {
    type: WorkerMessageType;
    coverage: number;
    error: number;
}
export declare enum ManageMessageType {
    WORK = 0,
    STOP = 1
}
export interface ManagerMessage {
    type: ManageMessageType;
    buf: string;
}
