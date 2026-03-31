import {Model} from "./base.model";
import {ID} from "../types/types";
import prisma from "../lib/prisma";
import {Prisma} from "@prisma/client";

class Player extends Model {
    static async fromId(id: ID) {
        const data: PlayerData = await prisma.player.findUniqueOrThrow({
            where: {id},
            ...PlayerArgs,
        });

        return new this(data);
    }

    //

    public readonly username: string;
    public readonly fullname: string;
    public readonly email: string;
    public readonly avatarUrl?: string;
    public readonly elo: number;
    public readonly goals: number;

    private readonly _createdAt: Date;
    private readonly _updatedAt: Date;

    private constructor(data: PlayerData) {
        super(data.id);

        this.username = data.username
        this.fullname = data.fullName
        this.email = data.email
        this.avatarUrl = data.avatarUrl ?? undefined
        this.elo = data.eloRating
        this.goals = data.goals

        this._createdAt = data.createdAt
        this._updatedAt = data.updatedAt
    }
}

const PlayerArgs = {
    omit: {
        password: true,
    }
} satisfies Prisma.PlayerDefaultArgs;

type PlayerData = Prisma.PlayerGetPayload<typeof PlayerArgs>;
