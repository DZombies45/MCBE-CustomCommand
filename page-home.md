# Minecraft Custom Command System

```text
(this api using minecraft 1.21.80 stable of 2.0.0-beta api)
```

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Minecraft](https://img.shields.io/badge/Minecraft-Bedrock_1.21%2B-green)](https://www.minecraft.net/)
[![GH Repo](https://img.shields.io/badge/GitHub-Repo-yelow)](https://github.com/DZombies45/MCBE-CustomCommand/)
[![My Pages](https://img.shields.io/badge/My-Pages-yelow)](https://dzombies45.github.io/)

A modular custom command system for Minecraft Bedrock Script API with full TypeScript support.
it use minecraft's own api, the [CustomCommandRegistry Class](https://learn.microsoft.com/id-id/minecraft/creator/scriptapi/minecraft/server/customcommandregistry?view=minecraft-bedrock-experimental&viewFallbackFrom=minecraft-bedrock-stable) to register the command

## Key Features

✅ **Type-safe command builder**  
✅ **Parameter validation**  
✅ **Multiple permission levels**  
✅ **IDE auto-completion**  
✅ **Extensible architecture**

## Complete Examples

See full implementations in:  
📁 [examples/tp.ts](https://github.com/DZombies45/MCBE-CustomCommand/blob/main/example/tp.ts)

## Configuration

Modify `config.ts/config.js`:

```typescript
export const CONFIG = {
  prefix: "mynamespase",
  files: ["myfile1", "myfile2"],
};
```

## Development Setup

- `js` is on [`out` folder](https://github.com/DZombies45/MCBE-CustomCommand/tree/main/out)
- `ts` is on [`src` folter](https://github.com/DZombies45/MCBE-CustomCommand/tree/main/src)

### Git Clone

1. Clone repository:

```bash
git clone https://github.com/DZombies45/MCBE-CustomCommand.git
```

2. Install dependencies:

```bash
npm install
```

### Zip

```text
-  just download its zip from code(top right, the green one),
-  download zip,
-  then move config and cc to your project
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

[MIT](https://github.com/DZombies45/MCBE-CustomCommand/blob/main/LICENSE) © 2023 Dzombies45

---

# Minecraft Command System

TypeScript library for creating custom commands in Minecraft Bedrock.

📚 [Full Documentation](https://dzombies45.github.io/MCBE-CustomCommand/modules.html)
🛠 [Code Examples](https://github.com/DZombies45/MCBE-CustomCommand/tree/main/src/example)
