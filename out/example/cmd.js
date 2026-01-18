import { CommandPermissionLevel, GameMode, Player } from "@minecraft/server";
import { CMD, ResultStatus } from "../cc";
CMD.create("gmc")
    .setDescription("Set Gamemode Creative")
    .setPermision(CommandPermissionLevel.GameDirectors)
    .setFunction(({ source, args }) => {
    if (source.sourceEntity instanceof Player)
        source.sourceEntity.setGameMode(GameMode.Creative);
    return ResultStatus.success();
});
CMD.create("gms")
    .setDescription("Set Gamemode Survival")
    .setPermision(CommandPermissionLevel.Host)
    .setFunction(({ source, args }) => {
    if (source.sourceEntity instanceof Player)
        source.sourceEntity.setGameMode(GameMode.Survival);
    return ResultStatus.success();
});
CMD.create("gmsp")
    .setDescription("Set Gamemode Spectator")
    .setPermision(CommandPermissionLevel.Admin)
    .setFunction(({ source, args }) => {
    if (source.sourceEntity instanceof Player)
        source.sourceEntity.setGameMode(GameMode.Spectator);
    return ResultStatus.success();
});
CMD.create("gma")
    .setDescription("Set Gamemode Adventure")
    .setPermision(CommandPermissionLevel.Owner)
    .setFunction(({ source, args }) => {
    if (source.sourceEntity instanceof Player)
        source.sourceEntity.setGameMode(GameMode.Adventure);
    return ResultStatus.success();
});
