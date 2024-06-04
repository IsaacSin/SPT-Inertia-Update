import * as fs from "node:fs";
import * as path from "node:path";

import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";

class Mod implements IPostDBLoadMod {
    private database: IDatabaseTables;
    private jsonUtil: JsonUtil;
    private config: {ChangeInertia: boolean, ChangeOverweight: boolean, ChangeStamina:boolean};
	
    public postDBLoad(container: DependencyContainer): void {
        this.database = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        this.jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const configPath = path.resolve(__dirname, "../config/config.json");
        this.config = this.jsonUtil.deserialize(fs.readFileSync(configPath, "utf-8"), "config.json");

        this.backportMovementChanges();
    }

    // 0.14.6.0.29862 (2024-05-12) changes (These will be implemented in 3.9.0)
    public backportMovementChanges(): void {
        const inertia = this.database.globals.config.Inertia;
        const stamina = this.database.globals.config.Stamina;
        
        if (this.config.ChangeInertia) {
            inertia.InertiaLimits.y = 73;
            inertia.MoveTimeRange.x = 0.07;
            inertia.MoveTimeRange.y = 0.25;
            inertia.WalkInertia.x = 0.005;
            inertia.WalkInertia.y = 0.335;
        }

        if (this.config.ChangeOverweight) {
            stamina.BaseOverweightLimits.y = 77;
            stamina.SprintOverweightLimits.y = 72;
            stamina.WalkOverweightLimits.y = 86;
            stamina.WalkSpeedOverweightLimits.y = 80;
        }

        if (this.config.ChangeStamina) {
            stamina.Capacity = 115;
            stamina.HandsCapacity = 80;
        }
    }
}


module.exports = { mod: new Mod() }
