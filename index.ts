import * as p from "@clack/prompts";
import color from "picocolors";
import * as fs from "node:fs/promises";
import { $ } from "bun";

p.intro(color.magenta(`Welcome to the create-dotnet-vite-app CLI!`));

const projectName = await p.text({
  message: `What is the name of your project?`,
  validate(value) {
    const regex = new RegExp("^[a-zA-Z-]+$");
    if (!value) {
      return "Directory name is required.";
    } else if (!regex.test(value)) {
      return "Directory name may only contain letters and dashes!";
    }
  },
});

if (p.isCancel(projectName)) {
  p.cancel("Operation cancelled.");
  process.exit(0);
}

const dirExists = await existsDirectory(projectName);

if (dirExists) {
  p.outro(`Directory ${projectName} already exists 😬`);
  process.exit(1);
}

await $`mkdir ../${projectName}`;
await $`cd ../${projectName} && dotnet new sln -n ${projectName}`;
await $`cd ../${projectName} && dotnet new web -o ${projectName}.Server`;
await $`cd ../${projectName} && dotnet sln add ./${projectName}.Server/${projectName}.Server.csproj`;

await $`cd ../${projectName} && bun create vite ./${projectName}.Client --template react-ts`;

p.note(`
${projectName}.Server is the backend aspnet core project
${color.green("dotnet run")} to start the backend

${projectName}.Client is the frontend vite project
${color.green("bun install")} to install the frontend dependencies
${color.green("bun dev")} to start the frontend`);

p.outro(`
cd ${projectName}
Let's start coding! 🚀
`);

// ----------------------------------------------------------------------

async function existsDirectory(path: string): Promise<boolean> {
  try {
    await fs.access(path);

    const stats = await fs.lstat(path);

    return stats.isDirectory();
  } catch {
    return false;
  }
}
