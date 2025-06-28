/**
 * Config for custom command
 *
 * @example
 * ```ts
 * {
 *   prefix: "dz",
 *   files: [
 *   "example/tp",
 *   "example/text"
 *   ]
 * }
 * ````
 *
 * @property prefix - your namespace that will be use before the command
 * @property files - your scrint files that you want to load from script/
 */
export const CONFIG: {
  prefix: string;
  requireCheatDefault: boolean;
  files: string[];
  logRegister: boolean;
  helpAuto: boolean;
  helpCommand: string;
  helpDescription: string;
} = {
  prefix: "mynamespace",
  requireCheatDefault: false,
  files: [],
  logRegister: true,
  helpAuto: false,
  helpCommand: "helpcmd",
  helpDescription: "show all command from this",
} as const;
