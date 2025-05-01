import {
  CommandPermissionLevel,
  CustomCommandStatus,
  Player,
  Vector3,
} from "@minecraft/server";
import { CMD, Is, ResultStatus } from "../src/cc";

const command = new CMD()
  .setName("tp")
  .setDescription("tp player to coord")
  .setPermision(CommandPermissionLevel.Any)
  .addPlayerSelector("player", true)
  .addLocation("location", true)
  .setFunction((eventData) => {
    const { source, args } = eventData;

    if (
      !source.sourceEntity ||
      source.sourceEntity?.typeId !== "minecraft:player"
    )
      return ResultStatus.failure();
    if (!Is.player(args["player"]))
      return ResultStatus.failure("arg player need to be a player entity");
    if (!args["location"]) return ResultStatus.failure("need to be location");

    const target = args["player"];
    target.teleport(args["location"]);

    return ResultStatus.success();
  });
