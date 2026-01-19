// made by Dzombies45
// github project for this custom command:
// https://github.com/DZombies45/MCBE-CustomCommand

import {
  system,
  CustomCommand,
  CustomCommandParamType,
  CustomCommandParameter,
  CustomCommandResult,
  CommandPermissionLevel,
  CustomCommandOrigin,
  CustomCommandStatus,
  Player,
  Entity,
  Vector3,
  world,
  CustomCommandSource,
} from "@minecraft/server";
import { CONFIG } from "./config";

/**
 * collection of all registered custom command instances.
 *
 * @remarks
 * Array ini menyimpan semua command yang sudah diregistrasi melalui:
 * ```ts
 * new CMD('name').register(); // auto ditambahkan ke ccList
 * ```
 *
 * @see {@link CMD} untuk struktur command individual.
 */
const ccList: CMD[] = [];

type ccenum = {
  name: string;
  value: string[];
};
const ccEnum: ccenum[] = [];

/**
 * custom command argument that given to cmdFunction.
 *
 * @property source - the one running the command.
 * @property args - the arguments.
 * */
export type ccArg<T> = { source: CustomCommandOrigin; args: T };

/**
 * represents a command function that can be executed.
 * @example
 * ```ts
 * const myCommand: cmdFuncOut = (eventData) => {
 *   const {source, args} = eventData
 *   source.sendMessage(`Hello ${name}`);
 *   return { status: "success" };
 * };
 * ```
 * @param eventData - custom command data.
 * @returns Command result
 */
export type cmdFuncOut<A> = (
  eventData: ccArg<A>,
) =>
  | CustomCommandResult
  | undefined
  | Promise<CustomCommandResult>
  | Promise<undefined>;

/*
 * command parameters phase
 */
type Phase = "required" | "optional";

/**
 * custom command parameters.
 */
export type cmdParam = CustomCommandParameter[];

/*
 * return result for custom command
 *
 * @example
 * ```ts
 * // at the end or on return at CMD.setFunction
 *   return ResultStatus.success()
 * }
 * ````
 */
export class ResultStatus {
  /**
   * return a success massage to minecraft command
   *
   * @param [message=""] - the message to give after running the command
   * @returns an {@link CustomCommandResult} status of success
   */
  static success(message: string = ""): CustomCommandResult {
    return { status: CustomCommandStatus.Success, message };
  }
  /**
   * return a failure massage to minecraft command
   *
   * @param [message=""] - the message to give after running the command
   * @returns an {@link CustomCommandResult} status of failure
   */
  static failure(message: string = ""): CustomCommandResult {
    return { status: CustomCommandStatus.Failure, message };
  }
}

/**
 * register custom enum for custom command parameters
 * and the name need tb be the same
 *
 * @example
 * ```ts
 * // cc is CMD
 * RegisterEnum("mc:dimension", [ "overworld", "nether", "the_end" ])
 *
 * // namespace and name need to be the same for it to work
 * cc.addEnumType("mc:dimension",true)
 * // the return of this on function is type string
 * ```
 *
 * @param name the name of this enum, you need to add namespace to this to work
 * @param value the enum you waht to add
 */
export const RegisterEnum = (name: string, value: string[]): void => {
  ccEnum.push({ name, value });
};

/**
 * check is argument match "this"
 *
 * @example
 * ```ts
 * // on CMD.setFunction
 * if(Is.Player(data.args["target"])) data.args["target"].sendMessage("YEY...")
 * // this check that data.args["target"] is type Player
 * ````
 *//**
 * Utility untuk type checking yang kuat dan clean
 */
export class Is {
  /** check is arg a Player */
  static Player(arg: unknown): arg is Player {
    return arg instanceof Player;
  }

  /** check is arg an Entity */
  static Entity(arg: unknown): arg is Entity {
    return arg instanceof Entity;
  }

  /** check is arg a string */
  static String(arg: unknown): arg is string {
    return typeof arg === "string";
  }

  /** check is arg a number (bukan NaN) */
  static Number(arg: unknown): arg is number {
    return typeof arg === "number" && !Number.isNaN(arg);
  }

  /** check is arg a integer */
  static Int(arg: unknown): arg is number {
    return this.Number(arg) && Number.isInteger(arg);
  }

  /** check is arg a float/decimal */
  static Float(arg: unknown): arg is number {
    return this.Number(arg) && !Number.isInteger(arg);
  }

  /** check is arg a boolean */
  static Bool(arg: unknown): arg is boolean {
    return typeof arg === "boolean";
  }

  /** check is arg a Vector3 or Location */
  static Location(arg: unknown): arg is Vector3 {
    return (
      typeof arg === "object" &&
      arg !== null &&
      "x" in arg &&
      "y" in arg &&
      "z" in arg
    );
  }
}

/**
 * custom command creator.
 *
 * @includeExample src/example/tp.ts[4:27]
 * */
export class CMD<P extends Phase = "required", A extends object = {}> {
  /** command object. */
  #commandObj: CustomCommand;
  /** command function. */
  #func: cmdFuncOut<A>;
  #option: { tag?: string[]; type: "all" | "any" } = { type: "any" };
  #alias: string[] = [];
  /**
   * create new instance of custom command creator.
   *
   * @param [init={description:"", name:"", permissionLevel:CommandPermissionLevel.Any}] - custom command that already listed/registered.
   */
  constructor(
    init: CustomCommand = {
      description: "",
      name: "",
      permissionLevel: CommandPermissionLevel.Any,
    },
  ) {
    this.#commandObj = {
      name: init?.name || "",
      description: init?.description || "",
      permissionLevel: init?.permissionLevel || CommandPermissionLevel.Any,
      mandatoryParameters: init?.mandatoryParameters || [],
      optionalParameters: init?.optionalParameters || [],
      cheatsRequired: CONFIG.requireCheatDefault,
    };
  }

  /**
   * create new instance of custom command creator.
   *
   * @param name name of the command
   */
  static create(name: string): CMD {
    return new CMD<"required", {}>({
      name,
      description: "",
      permissionLevel: CommandPermissionLevel.Any,
    });
  }

  /**
   * set tab that required when running this command
   *
   */
  setTagRank(tags: string[], anyOrAll: "any" | "all" = "any"): CMD<P, A> {
    this.#option.tag = tags;
    this.#option.type = anyOrAll;
    return this as any;
  }

  /**
   * is cheat need to be enable to use
   * (default can be change in the config)
   *
   * @param a - required?
   * @returns this
   */
  requireCheat(a: boolean): CMD<P, A> {
    this.#commandObj.cheatsRequired = a;
    return this as any;
  }

  /**
   * get this custom command object so can be use again
   */
  getCmd(): CustomCommand {
    return this.#commandObj;
  }

  /**
   * set this command name.
   *
   * @param a - name.
   * @returns this.
   */
  setName(a: string): CMD<P, A> {
    this.#commandObj.name = a;
    return this as any;
  }
  /**
   * get this command name.
   *
   * @returns the name of this command.
   */
  getName(): string {
    return this.#commandObj.name;
  }

  /**
   * set this command name alias.
   *
   * @param a - name array.
   * @returns this.
   */
  setAlias(a: string[]): CMD<P, A> {
    this.#alias = a;
    return this as any;
  }
  /**
   * add this command a name alias
   *
   * @param a - name
   * @returns this
   */
  addAlias(a: string): CMD<P, A> {
    this.#alias = [...this.#alias, a];
    return this as any;
  }
  /**
   * get this command name alias.
   *
   * @returns the name of this command.
   */
  getAlias(): string[] {
    return this.#alias;
  }

  /**
   * set this command description.
   *
   * @param a - description.
   * @returns this.
   */
  setDescription(a: string): CMD<P, A> {
    this.#commandObj.description = a;
    return this as any;
  }
  /**
   * get this command description.
   *
   * @returns the description of this command.
   */
  getDescription(): string {
    return this.#commandObj.description;
  }

  /**
   * set this command permission level.
   *
   * @param a - permissionLevel.
   * @returns this.
   */
  setPermision(a: CommandPermissionLevel): CMD<P, A> {
    this.#commandObj.permissionLevel = a;
    return this as any;
  }
  /**
   * get this command permission level.
   *
   * @returns permissionLevel.
   */
  getPermision(): string {
    switch (this.#commandObj.permissionLevel) {
      case CommandPermissionLevel.Any:
        return "Any";
      case CommandPermissionLevel.GameDirectors:
        return "GameDirectors";
      case CommandPermissionLevel.Admin:
        return "Admin";
      case CommandPermissionLevel.Host:
        return "Host";
      case CommandPermissionLevel.Owner:
        return "Owner";
      default:
        return "Unknown";
    }
  }

  /**
   * add argument type boolean,
   * like yes/no true/false.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addBoolean<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: boolean } : { [P in N]?: boolean })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Boolean });
    return this as any;
  }

  /**
   * add argument type integer or round number,
   * like 1, 2, 3.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addInteger<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: number } : { [P in N]?: number })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Integer });
    return this as any;
  }
  /**
   * add argument type float or decimal number,
   * like 1.0, 2.4, 7.2.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addFloat<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: number } : { [P in N]?: number })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Float });
    return this as any;
  }
  /**
   * add argument type string or text,
   * just text, a normal text.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addString<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: string } : { [P in N]?: string })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.String });
    return this as any;
  }
  /**
   * add argument type entity,
   * like player, zombie ,or other entity.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addEntitySelector<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: Entity } : { [P in N]?: Entity })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.EntitySelector });
    return this as any;
  }
  /**
   * add argument type player only,
   * only a player will be check unlike {@link addEntitySelector}.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addPlayerSelector<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: Player } : { [P in N]?: Player })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.PlayerSelector });
    return this as any;
  }
  /**
   * add argument type location or position,
   * usualy xyz coordinate.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addLocation<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: Vector3 } : { [P in N]?: Vector3 })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Location });
    return this as any;
  }
  /**
   * add argument type block,
   * like when you use /fill or /place.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addBlockType<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: string } : { [P in N]?: string })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.BlockType });
    return this as any;
  }
  /**
   * add argument type item.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addItemType<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: string } : { [P in N]?: string })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.ItemType });
    return this as any;
  }
  /**
   * add argument type enum from {@link RegisterEnum}
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first
   * @param [value=[]] - the value of enum to add if enum is not registered.
   * @returns this
   * @throws if its a required parameters, but added after optional parameters
   */
  addEnum<N extends string, R extends boolean>(
    this: P extends "required"
      ? CMD<P, A>
      : R extends false
        ? CMD<P, A>
        : never,
    name: N,
    require: R = true as R,
    value: string[] = [],
  ): CMD<
    R extends true ? "required" : "optional",
    A & (R extends true ? { [P in N]: string } : { [P in N]?: string })
  > {
    if (require && this.#commandObj.optionalParameters.length > 0)
      throw new Error(
        "can't add required parameters after optional parameters",
      );
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    const enumName = name.includes(":") ? name : CONFIG.prefix + name;
    if (!ccEnum.find((v) => v.name === enumName)) RegisterEnum(enumName, value);
    arr.push({ name: enumName, type: CustomCommandParamType.Enum });
    return this as any;
  }

  /**
   * set this custom command's required arguments in batch
   *
   * @param obj - an array of {@link cmdParam}
   * @returns this
   */
  setRequireParams(obj: CustomCommandParameter[]): CMD<P, A> {
    this.#commandObj.mandatoryParameters = obj;
    return this as any;
  }
  /**
   * get this custom command required arguments
   *
   * @returns array of required arguments
   */
  getRequireParams(): readonly CustomCommandParameter[] {
    return this.#commandObj.mandatoryParameters || [];
  }

  /**
   * set this custom command's optional arguments in batch
   *
   * @param obj - an array of {@link cmdParam}
   * @returns this
   */
  setOptionalParams(obj: CustomCommandParameter[]): CMD<P, A> {
    this.#commandObj.optionalParameters = obj;
    return this as any;
  }
  /**
   * get this custom command optional arguments
   *
   * @returns array of optional arguments
   */
  getOptionalParams(): readonly CustomCommandParameter[] {
    return this.#commandObj.optionalParameters || [];
  }

  /**
   * get this custom command's all arguments in order
   *
   * @returns array of required and optional arguments
   */
  private getParameters(): cmdParam {
    return [
      ...this.#commandObj.mandatoryParameters,
      ...this.#commandObj.optionalParameters,
    ];
  }

  /**
   * set this command function to run when called/executed.
   *
   * @param func - function.
   * @returns this.
   */
  setFunction(func: cmdFuncOut<A>): CMD<P, A> {
    this.#func = func;
    return this as any;
  }
  /**
   * get this command function.
   *
   * @returns function.
   */
  getFunction(): cmdFuncOut<A> {
    return this.#func;
  }

  /**
   *
   * convert raw data from the api into an object, that is the same to your arguments, for easy read, then pass it to your function to run it
   *
   * @remarks
   * ## ⚠️ don't use this functionn
   */
  run = (source: CustomCommandOrigin, ...args: any[]) => {
    let arg = this.getParameters();
    const namedArgs = arg.reduce(
      (obj, config, index) => {
        obj[config.name] = args[index] || undefined;
        return obj;
      },
      {} as Record<string, any>,
    );

    // check tag on entity
    const entity =
      source.sourceType === CustomCommandSource.Entity
        ? source.sourceEntity
        : source.initiator;
    const tag = entity?.getTags() || [];
    let tagReq = true;

    if (this.#option.tag && this.#option.tag?.length > 0)
      if (this.#option.type === "all")
        tagReq = this.#option.tag.every((item) => tag.includes(item));
      else if (this.#option.tag.length > 0)
        tagReq = this.#option.tag.some((item) => tag.includes(item));

    if (!tagReq)
      return ResultStatus.failure("Tag permission not meet the requirement");

    // Panggil bcd dengan format yang diinginkan
    system.run(async () => {
      const hasil = await this.#func({ source, args: namedArgs as A });
      if (!hasil || !hasil?.message) return;
      const warna = hasil.status === CustomCommandStatus.Success ? "§a" : "§c";
      if (source.sourceEntity instanceof Player)
        source.sourceEntity.sendMessage(`${warna}${hasil.message}`);
      if (source.initiator instanceof Player)
        source.initiator.sendMessage(`${warna}${hasil.message}`);
      if (
        [CustomCommandSource.Server, CustomCommandSource.Block].includes(
          source.sourceType,
        )
      )
        world
          .getPlayers()
          .filter(
            (p) => p.commandPermissionLevel >= this.#commandObj.permissionLevel,
          )
          .forEach((p) => p.sendMessage(`${warna}${hasil.message}`));
    });
    return ResultStatus.success();
  };

  /**
   * do this at the end.
   * verify the command and register it.
   *
   * @throws if the syntax is wrong
   */
  register(): void {
    if (!this.#func) throw new Error("command need function to run");
    if (this.#commandObj.name === "") throw new Error("command need a name");
    this.#commandObj.name = `${CONFIG.prefix}:${this.#commandObj.name}`;
    if (CONFIG.logRegister)
      console.log(`[CMD]§a registered command ${this.#commandObj.name}`);
    ccList.push(this as any);
  }
}

// register command
system.beforeEvents.startup.subscribe((data) => {
  // create help cmd if auto is true
  if (CONFIG.helpAuto) helpCmd();

  // register enum
  for (const cEnum of ccEnum) {
    data.customCommandRegistry.registerEnum(cEnum.name, cEnum.value);
  }
  // register command
  for (const cmdObj of ccList) {
    data.customCommandRegistry.registerCommand(cmdObj.getCmd(), cmdObj.run);
  }
  // register command alias
  for (const cmdObj of ccList) {
    const temp = cmdObj.getCmd();
    for (const alias of cmdObj.getAlias()) {
      temp.name = `${CONFIG.prefix}:${alias}`;
      data.customCommandRegistry.registerCommand(temp, cmdObj.run);
    }
  }
});

export function helpCmd() {
  new CMD()
    .setName(`${CONFIG.helpCommand || "helpcmd"}`)
    .setDescription(`${CONFIG.helpDescription || "show all command from this"}`)
    .addString("page_or_cmd", false)
    .setPermision(CommandPermissionLevel.Any)
    .setFunction((event) => {
      if (
        event.source.sourceType !== CustomCommandSource.Entity ||
        !Is.Player(event.source.sourceEntity)
      )
        return ResultStatus.failure("only player can use this");

      const player = event.source.sourceEntity;
      const argument = event.args["page_or_cmd"];
      let page = 1;

      function getNameOnly(_name: string): string {
        return _name.split(":")[1];
      }

      if (argument && Is.String(argument)) {
        if (/^\d+$/.test(argument.trim())) page = parseInt(argument.trim());
        else {
          const foundIt = ccList.find(
            (cmdObj) =>
              cmdObj.getName() === argument ||
              getNameOnly(cmdObj.getName()) === argument ||
              cmdObj.getAlias().includes(argument),
          );
          if (!foundIt)
            return ResultStatus.failure(`command ${argument} not found`);

          const alias = foundIt.getAlias();

          const cmd = foundIt.getCmd();
          player.sendMessage(
            `§e${cmd.name} (or ${getNameOnly(cmd.name)}${alias.length > 0 ? "|" + alias.join("|") : ""} ):`,
          );
          player.sendMessage(`§e${cmd.description},`);
          player.sendMessage("Usege:");
          player.sendMessage(`- ${cmdFormatnya(foundIt)}`);
          return ResultStatus.success();
        }
      }

      player.sendMessage(
        `---- ${CONFIG.prefix} ${CONFIG.helpCommand || "helpCmd"} page ${page} of ${Math.ceil(ccList.length / 10)} ----`,
      );
      for (const cmdObj of paginateArray(ccList, 10, page)) {
        player.sendMessage(cmdFormatnya(cmdObj));
      }

      return ResultStatus.success();
    });
}
function paginateArray<T>(
  array: T[],
  pageSize: number,
  pageNumber: number,
): T[] {
  const startIndex = (pageNumber - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
}

function cmdFormatnya(cmd: CMD): string {
  let cmdArr = [];
  const _cmd = cmd.getCmd();
  cmdArr.push(`${_cmd.name}`);
  if (_cmd.mandatoryParameters.length > 0)
    cmdArr.push(...getParam(_cmd.mandatoryParameters));
  if (_cmd.optionalParameters.length > 0)
    cmdArr.push(...getParam(_cmd.optionalParameters));
  return cmdArr.join(" ");
}

function getParam(param: CustomCommandParameter[]): string[] {
  let cmdArr = [];
  for (const req of param) {
    let type = ccEnum.find((v) => v.name === req.name)?.value?.join("; ");
    if (!type || req.type !== CustomCommandParamType.Enum)
      type = req.type.replace(/(?!^)([A-Z])/g, " $1") || "unknown";
    cmdArr.push(`<${req.name}: ${type}>`);
  }
  return cmdArr;
}
