


export interface History {
    id: string;
    name: string;
    uuid?: string;
    start?: string;
    end?: string;
}

export interface HistoryWithTool {
    sign: string;
    type: string;
    subtype: string;
    brand: string;
    serial: string;
    uuid: string;
    name: string;
    start: string;
    end?: string;
}
