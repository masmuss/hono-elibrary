import { Repository } from "../interfaces/repository.interface";

export class BaseHandler {
    protected repository: Repository;

    constructor(repository: Repository) {
        this.repository = repository;
    }

    /**
     * Builds the API response structure based on the query result.
     * - If `data` is an array, the response directly contains the array.
     * - If `data` is a single object, the response directly contains the object.
     * @param data - The query result data from the repository.
     * @param message - The success message.
     * @param error - The error message, if any (optional).
     * @returns The structured response according to the data type.
     */
    responseBuilder(
        data: any,
        message: string,
        error?: Error | null
    ) {
        // If the data contains a 'data' property
        if (data && data.data) {
            return {
                data: Array.isArray(data.data) ? data.data : data.data,
                total: data.total ?? undefined,
                totalPages: data.totalPages ?? undefined,
                page: data.page ?? undefined,
                message,
                error: error ? error.message : null,
            };
        }

        // If data is empty or does not have a 'data' property, return null
        return {
            data: null,
            message,
            error: error ? error.message : null,
        };
    }
}
