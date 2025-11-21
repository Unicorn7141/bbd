export type ComponentStatus = 'usable' | 'faulty' | 'in-process' | 'returned' | 'closed' | string;

export interface HistoryChange {
    old?: string | number | null;
    new?: string | number | null;
    initial?: string;
    [key: string]: any;
}

export interface HistoryEntry {
    version: number;
    timestamp: string;
    updatedBy: string;
    changes: Record<string, HistoryChange | string>;
    fullState: Component;
}

export interface Component {
    id: string;
    serialNumber: string;
    type: string;
    dateReceived: string;
    arrivedFrom: string;
    primaryFault: string;
    secondaryFault: string;
    updateDate: string;
    status: ComponentStatus;
    history?: HistoryEntry[];
}

export interface TypeAggregate {
    type: string;
    usable: number;
    faulty: number;
    inProcess: number;
    closed: number;
}

export interface StatusOverviewItem {
    name: string;
    rawStatus: string;
    value: number;
    color: string;
    [key: string]: any; // <-- FIX: Added index signature for Recharts compatibility
}

export interface KPIs {
    totalComponents: number;
    totalActive: number;
    totalUsable: number;
    totalFaulty: number;
    totalInProcess: number;
    totalClosed: number;
    statusOverview: StatusOverviewItem[];
    typeAggregates: TypeAggregate[];
}