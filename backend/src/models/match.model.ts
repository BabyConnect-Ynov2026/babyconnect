import {Model} from "./base.model";
import {ID} from "../types/types";
import prisma from "../lib/prisma";
import {MatchStatus, Prisma} from "@prisma/client";

class Match extends Model {
    static async fromId(id: ID) {
        const data: MatchData = await prisma.match.findUniqueOrThrow({
            where: {id},
            ...MatchArgs,
        });

        return new this(data);
    }

    //


    public readonly status: MatchStatus;
    public readonly duration: number;
    public readonly startedAt?: Date;
    public readonly finishedAt?: Date;

    private readonly _tableId: ID;
    private readonly _teams: { red: Team; blue: Team; };
    private readonly _tournamentId?: ID;
    private readonly _createdAt: Date;

    private constructor(data: MatchData) {
        super(data.id);

        this.status = data.status;
        this.duration = data.durationSeconds;
        this.startedAt = data.startedAt ?? undefined;
        this.finishedAt = data.finishedAt ?? undefined;
        this._tableId = data.tableId;
        this._teams = {
            red: {
                player1: data.redTeamId1,
                player2: data.redTeamId2 ?? undefined,
                score: data.redScore
            },
            blue: {
                player1: data.blueTeamId1,
                player2: data.blueTeamId2 ?? undefined,
                score: data.blueScore
            }
        }
        this._tournamentId = data.tournamentId ?? undefined;
        this._createdAt = data.createdAt;
    }
}

const MatchArgs = {
    omit: {},
} satisfies Prisma.MatchDefaultArgs;

type MatchData = Prisma.MatchGetPayload<typeof MatchArgs>;

type Team = { player1: ID; player2?: ID; score: number };