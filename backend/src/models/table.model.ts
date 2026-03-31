import {Model} from "./base.model";
import {ID} from "../types/types";
import prisma from "../lib/prisma";
import {Prisma} from "@prisma/client";

class Table extends Model {
    static async fromId(id: ID) {
        const data: TableData = await prisma.table.findUniqueOrThrow({
            where: {id},
            ...TableArgs,
        });

        return new this(data);
    }

    //

    public readonly name: string;
    public readonly location?: string;
    public readonly available: boolean;

    private constructor(data: TableData) {
        super(data.id);

        this.name = data.name
        this.location = data.location ?? undefined
        this.available = data.available
    }
}

const TableArgs = {
    omit: {},
} satisfies Prisma.TableDefaultArgs;

type TableData = Prisma.TableGetPayload<typeof TableArgs>;
