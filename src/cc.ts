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
export type ccArg = { source: CustomCommandOrigin; args: Record<string, any> };

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
export type cmdFuncOut = (eventData: ccArg) => CustomCommandResult;

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
export const ResultStatus = {
  /**
   * return a success massage to minecraft command
   *
   * @param [message=""] - the message to give after running the command
   * @returns an {@link CustomCommandResult} status of success
   */
  success: (message: string = ""): CustomCommandResult => {
    return { status: CustomCommandStatus.Success, message };
  },
  /**
   * return a failure massage to minecraft command
   *
   * @param [message=""] - the message to give after running the command
   * @returns an {@link CustomCommandResult} status of failure
   */
  failure: (message: string = ""): CustomCommandResult => {
    return { status: CustomCommandStatus.Failure, message };
  },
};
/**
 * register custom enum for custom command paramenters
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
 * if(Is.player(data.args["target"])) data.args["target"].sendMessage("YEY...")
 * // this check that data.args["target"] is type Player
 * ````
 */
export const Is = {
  /**
   * check is arg a player
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Player: (arg: unknown): arg is Player => {
    return arg instanceof Player;
  },
  /**
   * check is arg an entity
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Entity: (arg: unknown): arg is Entity => {
    return arg instanceof Entity;
  },
  /**
   * check is arg a string
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  String: (arg: unknown): arg is string => {
    return typeof arg === "string";
  },
  /**
   * check is arg a Vector3/location
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Location: (arg: unknown): arg is Vector3 => {
    return typeof arg === "object" && "x" in arg && "y" in arg && "z" in arg;
  },
  /**
   * check is arg a number
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Number: (arg: unknown): arg is number => {
    return typeof arg === "number" && !isNaN(arg);
  },
  /**
   * check is arg a float/decimal number
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Float: (arg: unknown): arg is number => {
    return typeof arg === "number" && !Number.isInteger(arg) && !isNaN(arg);
  },
  /**
   * check is arg a integer/round number
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Int: (arg: unknown): arg is number => {
    return typeof arg === "number" && Number.isInteger(arg);
  },
  /**
   * check is arg a boolean
   *
   * @param arg - the argument you want to check
   * @return is it the thing or not
   */
  Bool: (arg: unknown): arg is boolean => {
    return typeof arg === "boolean";
  },
};

/**
 * custom command creator.
 *
 * @includeExample src/example/tp.ts:4-27
 * */
export class CMD {
  /** command object. */
  #commandObj: CustomCommand;
  /** command function. */
  #func: cmdFuncOut;
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
  getCmd(): CustomCommand {
    return this.#commandObj;
  }

  /**
   * set this command name.
   *
   * @param a - name.
   * @returns this.
   */
  setName(a: string): CMD {
    this.#commandObj.name = `${CONFIG.prefix}:${a}`;
    return this;
  }
  /**
   * get this command name.
   *
   * @returns the name of this command.
   */
  getName(): string {
    return this.#commandObj.name.replace(`${CONFIG.prefix}:`, "");
  }

  /**
   * set this command description.
   *
   * @param a - description.
   * @returns this.
   */
  setDescription(a: string): CMD {
    this.#commandObj.description = a;
    return this;
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
  setPermision(a: CommandPermissionLevel): CMD {
    this.#commandObj.permissionLevel = a;
    return this;
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
  addBoolean(name: string, require: boolean = true): CMD {
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
  addInteger(name: string, require: boolean = true): CMD {
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
  addFloat(name: string, require: boolean = true): CMD {
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
  addString(name: string, require: boolean = true): CMD {
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
  addEntitySelector(name: string, require: boolean = true): CMD {
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
  addPlayerSelector(name: string, require: boolean = true): CMD {
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
  addLocation(name: string, require: boolean = true): CMD {
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
  addBlockType(name: string, require: boolean = true): CMD {
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
  addItemType(name: string, require: boolean = true): CMD {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.ItemType });
    return this;
  }
  /**
   * add argument type enum from {@link RegisterEnum}
   *
   * @param name - the name of this argument.
   * @param [require=true] - is it required or not, required arguments listed first.
   * @returns this
   */
  addEnum(name: string, require: boolean = true): CMD {
    const arr = require
      ? this.#commandObj.mandatoryParameters
      : this.#commandObj.optionalParameters;
    arr.push({ name, type: CustomCommandParamType.Enum });
    return this;
  }

  /**
   * set this custom command's required arguments in batch
   *
   * @param obj - an array of {@link cmdParam}
   * @returns this
   */
  setRequireParams(obj: cmdParam): CMD {
    this.#commandObj.mandatoryParameters = obj;
    return this;
  }
  /**
   * get this custom command required arguments
   *
   * @returns array of required arguments
   */
  getRequireParams(): cmdParam {
    return this.#commandObj.mandatoryParameters || [];
  }

  /**
   * set this custom command's optional arguments in batch
   *
   * @param obj - an array of {@link cmdParam}
   * @returns this
   */
  setOptionalParams(obj: cmdParam): CMD {
    this.#commandObj.optionalParameters = obj;
    return this;
  }
  /**
   * get this custom command optional arguments
   *
   * @returns array of optional arguments
   */
  getOptionalParams(): cmdParam {
    return this.#commandObj.optionalParameters || [];
  }

  /**
   * get this custom command's all arguments in order
   *
   * @returns array of required and optional arguments
   */
  getParamenters(): cmdParam {
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
  setFunction(func: cmdFuncOut): CMD {
    this.#func = func;
    return this;
  }
  /**
   * get this commane function.
   *
   * @returns function.
   */
  getFunction(): cmdFuncOut {
    return this.#func;
  }

  /**
   * convert raw data from the api into an object, that is the same to your arguments, for easy read, then pass it to your function to run it
   * don't use this function
   */
  run = (source: CustomCommandOrigin, ...args: any[]) => {
    let arg = this.getParamenters();
    const namedArgs = arg.reduce(
      (obj, config, index) => {
        obj[config.name] = args[index] || undefined;
        return obj;
      },
      {} as Record<string, any>,
    );

    // Panggil bcd dengan format yang diinginkan
    return this.#func({ source, args: namedArgs });
  };

  /**
   * do this at the end to register it.
   */
  register(): void {
    ccList.push(this);
  }
}

for (const file of CONFIG.files) {
  import(`script/${file}`);
}
system.beforeEvents.startup.subscribe((data) => {
  for (const cEnum of ccEnum) {
    data.customCommandRegistry.registerEnum(cEnum.name, cEnum.value);
  }
  for (const cmdObj of ccList) {
    data.customCommandRegistry.registerCommand(cmdObj.getCmd(), cmdObj.run);
  }
});
