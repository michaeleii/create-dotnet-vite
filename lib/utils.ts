import { $, file, write } from "bun";
import { rm } from "fs/promises";

export async function createNewDotnetWebProject(projectName: string) {
  await $`cd ../${projectName} && dotnet new sln -n ${projectName}`;
  await $`cd ../${projectName} && dotnet new web -o ${projectName}.Server`;
  await $`cd ../${projectName} && dotnet sln add ./${projectName}.Server/${projectName}.Server.csproj`;
  await $`cd ../${projectName}/${projectName}.Server && dotnet new gitignore`;

  // Add DotNetEnv package
  await $`cd ../${projectName}/${projectName}.Server && dotnet add package DotNetEnv`;
  // Copy the .env.example file to the server project
  const envExample = file(`templates/dotnet/.env.example`);
  write(`../${projectName}/${projectName}.Server/.env`, envExample);

  // Add Swagger
  await $`cd ../${projectName}/${projectName}.Server && dotnet add package Swashbuckle.AspNetCore`;
  await $`cd ../${projectName}/${projectName}.Server && dotnet add package Microsoft.AspNetCore.OpenApi`;

  // Add Entity Framework
  await $`cd ../${projectName}/${projectName}.Server && dotnet add package Microsoft.EntityFrameworkCore`;
  await $`cd ../${projectName}/${projectName}.Server && dotnet add package Microsoft.EntityFrameworkCore.Design`;

  // Copy templates/dotnet/Program.txt to the project directory
  const program = file(`templates/dotnet/Program.txt`);
  await write(`../${projectName}/${projectName}.Server/Program.cs`, program);
}

export async function createNewViteProject(projectName: string) {
  // Create the vite project
  await $`cd ../${projectName} && bun create vite ${projectName.toLowerCase()}-client --template react-ts`;

  // Rename the project directory
  await $`mv ../${projectName}/${projectName.toLowerCase()}-client ../${projectName}/${projectName}.Client`;

  // Install the dependencies
  await $`cd ../${projectName}/${projectName}.Client && bun install`;

  // Remove the default App.css
  await rm(`../${projectName}/${projectName}.Client/src/App.css`, {
    force: true,
  });
  // Remove the default App.tsx
  await rm(`../${projectName}/${projectName}.Client/src/App.tsx`, {
    force: true,
  });

  // Copy templates/vite/App.txt to the project directory
  const app = file(`templates/vite/App.txt`);
  await write(`../${projectName}/${projectName}.Client/src/App.tsx`, app);

  // Read the launchSettings.json file to get the dotnet api url
  const launchSettings = await file(
    `../${projectName}/${projectName}.Server/Properties/launchSettings.json`
  ).json();

  // Copy templates/vite/vite.config.txt to the project directory
  let viteConfig = await file(`templates/vite/vite.config.txt`).text();

  const dotnetApiUrl = launchSettings.profiles.http.applicationUrl;

  // Replace the dotnetApiUrl in the vite.config.ts file
  viteConfig = viteConfig
    .replace(/{DOTNET_API_URL}/g, dotnetApiUrl)
    .replace(/{PROJECT_NAME}/g, projectName);

  // Replace the projectName in the vite.config.ts file

  await write(
    `../${projectName}/${projectName}.Client/vite.config.ts`,
    viteConfig
  );
}

export async function setupTailwind(projectName: string) {
  await $`cd ../${projectName}/${projectName}.Client && bun install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss`;
  await $`cd ../${projectName}/${projectName}.Client && bun tailwindcss init -p`;

  // Remove the default tailwind.config.js
  await $`rm -f ../${projectName}/${projectName}.Client/tailwind.config.js`;

  // Remove the default index.css
  await $`rm -f ../${projectName}/${projectName}.Client/src/index.css`;

  // Copy templates/tailwind.config.js to the project directory
  const tailwindConfig = file(`templates/tailwind/tailwind.config.js`);
  await write(
    `../${projectName}/${projectName}.Client/tailwind.config.js`,
    tailwindConfig
  );
  // Copy templates/index.css to the project directory
  const indexCss = file(`templates/tailwind/index.css`);
  await write(
    `../${projectName}/${projectName}.Client/src/index.css`,
    indexCss
  );

  // Copy templates/tailwind/prettier.config.js to the project directory
  const prettierConfig = file(`templates/tailwind/prettier.config.js`);
  await write(
    `../${projectName}/${projectName}.Client/prettier.config.js`,
    prettierConfig
  );
}
