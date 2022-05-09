


export interface History {
    id: string;
    name: string;
}

export interface HistoryWithTool {
    sign: string;
    type: string;
    subtype: string;
    brand: string;
    serial: string;
    name: string;
    start: string;
    end?: string;
}
