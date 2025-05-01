import {
  system,
  CustomCommandParamType,
  CommandPermissionLevel,
  CustomCommandStatus,
  Player,
  Entity,
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
const ccList = [];
/*
 * return result for custom command
 *
 * @example
 * ```ts
 * // at the end or on return at CMD.setFunction
 * return ResultStatus.success()
 * ````
 */
export const ResultStatus = {
  /**
   * return a success massage to minecraft command
   *
   * @param [message=""] - the message to give after running the command
   * @returns an {@link CustomCommandResult} status of success
   */
  success: (message = "") => {
    return { status: CustomCommandStatus.Success, message };
  },
  /**
   * return a failure massage to minecraft command
   *
   * @param [message=""] - the message to give after running the command
   * @returns an {@link CustomCommandResult} status of failure
   */
  failure: (message = "") => {
    return { status: CustomCommandStatus.Failure, message };
  },
};
/**
 * check is argument match "this"
 */
export const Is = {
  /**
   * check is arg a player
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  player: (arg) => {
    return arg instanceof Player;
  },
  /**
   * check is arg an entity
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  entity: (arg) => {
    return arg instanceof Entity;
  },
  /**
   * check is arg a text
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  text: (arg) => {
    return typeof arg === "string";
  },
  /**
   * check is arg a Vector3/location
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  location: (arg) => {
    return typeof arg === "object" && "x" in arg && "y" in arg && "z" in arg;
  },
};
/**
 * custom command creator.
 *
 * @includeExample example/tp.ts
 * */
export class CMD {
  /** command object. */
  #commandObj;
  /** command function. */
  #func;
  /**
   * create new instance of custom command creator.
   *
   * @param [init={description:"", name:"", permissionLevel:CommandPermissionLevel.Any}] - custom command that already listed/registered.
   */
  constructor(
    init = {
      description: "",
      name: "",
      permissionLevel: CommandPermissionLevel.Any,
    },
  ) {
    this.#commandObj = {
      name: init.name || "",
      description: init.description || "",
      permissionLevel: init.permissionLevel || CommandPermissionLevel.Any,
      mandatoryParameters: init.mandatoryParameters || [],
      optionalParameters: init.optionalParameters || [],
    };
  }
  /**
   * get this custom command object so can be use again
   */
  getCmd() {
    return this.#commandObj;
  }
  /**
   * set this command name.
   *
   * @param a - name.
   * @returns this.
   */
  setName(a) {
    this.#commandObj.name = `${CONFIG.prefix}:${a}`;
    return this;
  }
  /**
   * get this command name.
   *
   * @returns the name of this command.
   */
  getName() {
    return this.#commandObj.name.replace(`${CONFIG.prefix}:`, "");
  }
  /**
   * set this command description.
   *
   * @param a - description.
   * @returns this.
   */
  setDescription(a) {
    this.#commandObj.description = a;
    return this;
  }
  /**
   * get this command description.
   *
   * @returns the description of this command.
   */
  getDescription() {
    return this.#commandObj.description;
  }
  /**
   * set this command permission level.
   *
   * @param a - permissionLevel.
   * @returns this.
   */
  setPermision(a) {
    this.#commandObj.permissionLevel = a;
    return this;
  }
  /**
   * get this command permission level.
   *
   * @returns permissionLevel.
   */
  getPermision() {
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
        return "Any";
        break;
    }
  }
  /**
   * add argument type boolean,
   * like yes/no true/false.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addBoolean(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Boolean });
    return this;
  }
  /**
   * add argument type integer or round number,
   * like 1, 2, 3.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addInteger(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Integer });
    return this;
  }
  /**
   * add argument type float or decimal number,
   * like 1.0, 2.4, 7.2.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addFloat(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Float });
    return this;
  }
  /**
   * add argument type string or text,
   * just text, a normal text.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addString(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.String });
    return this;
  }
  /**
   * add argument type entity,
   * like player, zombie ,or other entity.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addEntitySelector(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.EntitySelector });
    return this;
  }
  /**
   * add argument type player only,
   * only a player will be check unlike {@link addEntitySelector}.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addPlayerSelector(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.PlayerSelector });
    return this;
  }
  /**
   * add argument type location or position,
   * usualy xyz coordinate.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addLocation(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Location });
    return this;
  }
  /**
   * add argument type block,
   * like when you use /fill or /place.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addBlockType(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.BlockType });
    return this;
  }
  /**
   * add argument type item.
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addItemType(name, require = true) {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.ItemType });
    return this;
  }
  /**
   * set this custom command's required arguments in batch
   *
   * @param obj - an array of {@link cmdParam}
   * @returns this
   */
  setRequireParams(obj) {
    this.#commandObj.mandatoryParameters = obj;
    return this;
  }
  /**
   * get this custom command required arguments
   *
   * @returns array of required arguments
   */
  getRequireParams() {
    return this.#commandObj.mandatoryParameters || [];
  }
  /**
   * set this custom command's optional arguments in batch
   *
   * @param obj - an array of {@link cmdParam}
   * @returns this
   */
  setOptionalParams(obj) {
    this.#commandObj.optionalParameters = obj;
    return this;
  }
  /**
   * get this custom command optional arguments
   *
   * @returns array of optional arguments
   */
  getOptionalParams() {
    return this.#commandObj.optionalParameters || [];
  }
  /**
   * get this custom command's all arguments in order
   *
   * @returns array of required and optional arguments
   */
  getParamenters() {
    return [
      ...this.#commandObj.optionalParameters,
      ...this.#commandObj.mandatoryParameters,
    ];
  }
  /**
   * set this command function to run when called/executed.
   *
   * @param func - function.
   * @returns this.
   */
  setFunction(func) {
    this.#func = func;
    return this;
  }
  /**
   * get this commane function.
   *
   * @returns function.
   */
  getFunction() {
    return this.#func;
  }
  /**
   * convert raw data from the api into an object, that is the same to your arguments, for easy read, then pass it to your function to run it
   * don't use this function
   */
  run(source, ...args) {
    let arg = this.getParamenters();
    const namedArgs = arg.reduce((obj, config, index) => {
      obj[config.name] = args[index] || undefined;
      return obj;
    }, {});
    // Panggil bcd dengan format yang diinginkan
    return this.#func({ source, args: namedArgs });
  }
  /**
   * do this at the end to register it.
   */
  register() {
    ccList.push(this);
  }
}
system.beforeEvents.startup.subscribe((data) => {
  for (const cmdObj of ccList) {
    data.customCommandRegistry.registerCommand(cmdObj.getCmd(), cmdObj.run);
  }
});
