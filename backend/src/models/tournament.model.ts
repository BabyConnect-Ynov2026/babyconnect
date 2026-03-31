import {Model} from "./base.model";
import {ID} from "../types/types";
import prisma from "../lib/prisma";
import {Prisma, TournamentStatus} from "@prisma/client";

class Tournament extends Model {
    static async fromId(id: ID) {
        const data: TournamentData = await prisma.tournament.findUniqueOrThrow({
            where: {id},
            ...TournamentArgs,
        });

        return new this(data);
    }

    //

    public readonly name: string;
    public readonly description: string;
    public readonly maxPlayers: number;
    public readonly status: TournamentStatus;
    public readonly startDate?: Date;
    public readonly endDate?: Date;

    private readonly _winnerId?: ID;

    private constructor(data: TournamentData) {
        super(data.id);

        this.name = data.name
        this.description = data.description
        this.maxPlayers = data.maxPlayers
        this.status = data.status
        this.startDate = data.startDate ?? undefined
        this.endDate = data.endDate ?? undefined
        this._winnerId = data.winnerId ?? undefined
    }
}

const TournamentArgs = {
    omit: {},
} satisfies Prisma.TournamentDefaultArgs;

type TournamentData = Prisma.TournamentGetPayload<typeof TournamentArgs>;
