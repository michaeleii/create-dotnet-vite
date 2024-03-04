import { $, file, write } from "bun";
import { rm } from "fs/promises";

const envExample = `DATABASE_CONNECTION_STRING="your database connection string"`;

const program = `DotNetEnv.Env.Load();

  var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");

  var builder = WebApplication.CreateBuilder(args);
  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen();

  var app = builder.Build();

  if (app.Environment.IsDevelopment())
  {
      app.UseSwagger();
      app.UseSwaggerUI();
  }

  app.MapGet("/", () => "Hello World!");

  app.UseDefaultFiles();
  app.UseStaticFiles();
  app.MapFallbackToFile("index.html");

  app.Run();
`;

const app = `export default function App() {
  return <div>Hello World!</div>;
}
`;

let viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "{DOTNET_API_URL}",
    },
  },
  build: {
    outDir: "../{PROJECT_NAME}.Server/wwwroot",
    emptyOutDir: true,
  },
});
`;

export async function createNewDotnetWebProject(projectName: string) {
  await $`cd ./${projectName} && dotnet new sln -n ${projectName}`;
  await $`cd ./${projectName} && dotnet new web -o ${projectName}.Server`;
  await $`cd ./${projectName} && dotnet sln add ./${projectName}.Server/${projectName}.Server.csproj`;
  await $`cd ./${projectName}/${projectName}.Server && dotnet new gitignore`;

  // Add DotNetEnv package
  await $`cd ./${projectName}/${projectName}.Server && dotnet add package DotNetEnv`;
  // Copy the .env.example file to the server project
  write(`./${projectName}/${projectName}.Server/.env`, envExample);

  // Add Swagger
  await $`cd ./${projectName}/${projectName}.Server && dotnet add package Swashbuckle.AspNetCore`;
  await $`cd ./${projectName}/${projectName}.Server && dotnet add package Microsoft.AspNetCore.OpenApi`;

  // Add Entity Framework
  await $`cd ./${projectName}/${projectName}.Server && dotnet add package Microsoft.EntityFrameworkCore`;
  await $`cd ./${projectName}/${projectName}.Server && dotnet add package Microsoft.EntityFrameworkCore.Design`;

  // Copy templates/dotnet/Program.txt to the project directory

  await write(`./${projectName}/${projectName}.Server/Program.cs`, program);
}

export async function createNewViteProject(projectName: string) {
  // Create the vite project
  await $`cd ./${projectName} && bun create vite ${projectName.toLowerCase()}-client --template react-ts`;

  // Rename the project directory
  await $`mv ./${projectName}/${projectName.toLowerCase()}-client ./${projectName}/${projectName}.Client`;

  // Install the dependencies
  await $`cd ./${projectName}/${projectName}.Client && bun install`;

  // Remove the default App.css
  await rm(`./${projectName}/${projectName}.Client/src/App.css`, {
    force: true,
  });
  // Remove the default App.tsx
  await rm(`./${projectName}/${projectName}.Client/src/App.tsx`, {
    force: true,
  });

  // Copy templates/vite/App.txt to the project directory
  await write(`./${projectName}/${projectName}.Client/src/App.tsx`, app);

  // Read the launchSettings.json file to get the dotnet api url
  const launchSettings = await file(
    `./${projectName}/${projectName}.Server/Properties/launchSettings.json`
  ).json();

  // Copy templates/vite/vite.config.txt to the project directory

  const dotnetApiUrl = launchSettings.profiles.http.applicationUrl;

  // Replace the dotnetApiUrl in the vite.config.ts file
  viteConfig = viteConfig
    .replace(/{DOTNET_API_URL}/g, dotnetApiUrl)
    .replace(/{PROJECT_NAME}/g, projectName);

  // Replace the projectName in the vite.config.ts file

  await write(
    `./${projectName}/${projectName}.Client/vite.config.ts`,
    viteConfig
  );
}

export async function setupTailwind(projectName: string) {
  await $`cd ./${projectName}/${projectName}.Client && bun install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss`;
  await $`cd ./${projectName}/${projectName}.Client && bun tailwindcss init -p`;

  // Remove the default tailwind.config.js
  await $`rm -f ./${projectName}/${projectName}.Client/tailwind.config.js`;

  // Remove the default index.css
  await $`rm -f ./${projectName}/${projectName}.Client/src/index.css`;

  // Copy templates/tailwind.config.js to the project directory
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
  `;
  await write(
    `./${projectName}/${projectName}.Client/tailwind.config.js`,
    tailwindConfig
  );
  // Copy templates/index.css to the project directory
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

  `;
  await write(`./${projectName}/${projectName}.Client/src/index.css`, indexCss);

  // Copy templates/tailwind/prettier.config.js to the project directory
  const prettierConfig = `/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
};
  `;
  await write(
    `./${projectName}/${projectName}.Client/prettier.config.js`,
    prettierConfig
  );
}
