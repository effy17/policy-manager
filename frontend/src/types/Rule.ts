export interface Source { name: string; email: string; }
export interface Destination { name: string; address: string; }
export interface Rule { id: number; tenantId: number; ruleIndex: number; name: string; action:"Allow"|"Block"; sources:Source[]; destinations:Destination[]; }