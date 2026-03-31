import {Model} from "./base.model";
import {ID} from "../types/types";
import prisma from "../lib/prisma";
import {Prisma, ReservationStatus} from "@prisma/client";

class Reservation extends Model {
    static async fromId(id: ID) {
        const data: ReservationData = await prisma.reservation.findUniqueOrThrow({
            where: {id},
            ...ReservationArgs,
        });

        return new this(data);
    }

    //

    public readonly startTime: Date;
    public readonly status: ReservationStatus;
    public readonly notes: string;

    private readonly _playerId: ID;
    private readonly _tableId: ID;

    private constructor(data: ReservationData) {
        super(data.id);

        this.startTime = data.startTime;
        this.status = data.status;
        this.notes = data.notes;
        this._playerId = data.playerId;
        this._tableId = data.tableId;
    }
}

const ReservationArgs = {
    omit: {},
} satisfies Prisma.ReservationDefaultArgs;

type ReservationData = Prisma.ReservationGetPayload<typeof ReservationArgs>;
