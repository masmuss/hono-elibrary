export interface Repository {
    get(filter: Record<string, any>): Promise<any>;
    byId(id: string | number): Promise<any>;
}