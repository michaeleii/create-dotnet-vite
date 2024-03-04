#!/usr/bin/env bun
import * as p from "@clack/prompts";
import color from "picocolors";
import { mkdir, rm, exists } from "node:fs/promises";
import {
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

const directoryAlreadyExists = await exists(`../${projectName}`);

if (directoryAlreadyExists) {
  const confirmDeleteProject = await p.confirm({
    message: color.red(
      `${projectName} already exists. Do you want to delete it?`
    ),
  });

  if (!confirmDeleteProject) {
    p.outro(`You must delete ${projectName} before continuing.`);
    process.exit(0);
  }

  if (p.isCancel(confirmDeleteProject)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  await rm(`../${projectName}`, { recursive: true, force: true });
}

const useTailwind = await p.confirm({
  message: `Do you want to use TailwindCSS?`,
});

if (p.isCancel(useTailwind)) {
  p.cancel("Operation cancelled.");
  process.exit(0);
}

await mkdir(`../${projectName}`);
await createNewDotnetWebProject(projectName);
await createNewViteProject(projectName);

if (useTailwind) {
  await setupTailwind(projectName);
}

p.note(`
${projectName}.Server is the backend aspnet core project
${color.green("dotnet watch")} to start the backend

${projectName}.Client is the frontend vite project
${color.green("bun dev")} to start the frontend`);

p.outro(`
cd ../${projectName} to start coding
Let's start coding! 🚀
`);
