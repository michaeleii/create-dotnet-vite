import * as fs from "node:fs/promises";
import { $ } from "bun";

export async function existsDirectory(path: string): Promise<boolean> {
  try {
    await fs.access(path);

    const stats = await fs.lstat(path);

    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function createNewDotnetWebProject(projectName: string) {
  await $`cd ../${projectName} && dotnet new sln -n ${projectName}`;
  await $`cd ../${projectName} && dotnet new web -o ${projectName}.Server`;
  await $`cd ../${projectName} && dotnet sln add ./${projectName}.Server/${projectName}.Server.csproj`;
  await $`cd ../${projectName}/${projectName}.Server && dotnet new gitignore`;
}

export async function createNewViteProject(projectName: string) {
  await $`cd ../${projectName} && bun create vite ./${projectName}.Client --template react-ts`;
  // Remove the default App.css
  await $`rm -f ../${projectName}/${projectName}.Client/src/App.css`;
  // Remove the default App.tsx
  await $`rm -f ../${projectName}/${projectName}.Client/src/App.tsx`;

  // Copy templates/vite/App.txt to the project directory
  await $`cp templates/vite/App.txt ../${projectName}/${projectName}.Client/src/App.tsx`;

  // Copy templates/vite/vite.config.txt to the project directory
  await $`cp templates/vite/vite.config.txt ../${projectName}/${projectName}.Client/vite.config.ts`;
}

export async function setupTailwind(projectName: string) {
  await $`cd ../${projectName}/${projectName}.Client && bun install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss`;
  await $`cd ../${projectName}/${projectName}.Client && bun tailwindcss init -p`;

  // Remove the default tailwind.config.js
  await $`rm -f ../${projectName}/${projectName}.Client/tailwind.config.js`;

  // Remove the default index.css
  await $`rm -f ../${projectName}/${projectName}.Client/src/index.css`;

  // Copy templates/tailwind.config.js to the project directory
  await $`cp templates/tailwind/tailwind.config.js ../${projectName}/${projectName}.Client/tailwind.config.js`;
  await $`cp templates/tailwind/index.css ../${projectName}/${projectName}.Client/src/index.css`;

  // Copy templates/tailwind/prettier.config.js to the project directory
  await $`cp templates/tailwind/prettier.config.js ../${projectName}/${projectName}.Client/prettier.config.js`;

  // Copy templates/tailwind/App.tsx to the project directory
  await $`cp templates/tailwind/App.txt ../${projectName}/${projectName}.Client/src/App.tsx`;
}
