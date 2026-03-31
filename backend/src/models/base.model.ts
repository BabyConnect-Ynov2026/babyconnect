import {ID} from "../types/types";


export abstract class Model {
    static async fromId(id: ID): Promise<Model> {
        throw new Error('Not implemented');
    }

    equals(other: unknown): boolean {
        if (this === other) return true;

        if (!(other instanceof Model)) return false;

        return this.constructor === other.constructor && this.id === other.id;
    }

    // ------------------------------------------------------

    public readonly id: ID;

    protected constructor(id: ID) {
        this.id = id;
    }
}
