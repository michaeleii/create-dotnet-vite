import * as p from "@clack/prompts";
import color from "picocolors";
import { $ } from "bun";
import {
  existsDirectory,
  createNewDotnetWebProject,
  createNewViteProject,
  setupTailwind,
} from "./lib/utils";

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

const dirExists = await existsDirectory(`../${projectName}`);

if (dirExists) {
  p.outro(`You must delete ${projectName} before continuing.`);
  process.exit(0);
}

const useTailwind = await p.confirm({
  message: `Do you want to use TailwindCSS?`,
});

if (p.isCancel(useTailwind)) {
  p.cancel("Operation cancelled.");
  process.exit(0);
}

await $`mkdir ../${projectName}`;
await createNewDotnetWebProject(projectName);
await createNewViteProject(projectName);

if (useTailwind) {
  await setupTailwind(projectName);
}

p.note(`
${projectName}.Server is the backend aspnet core project
${color.green("dotnet run")} to start the backend

${projectName}.Client is the frontend vite project
${color.green("bun dev")} to start the frontend`);

p.outro(`
cd ../${projectName} to start coding
Let's start coding! 🚀
`);
