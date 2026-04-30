import Elysia from "elysia";
import { html, Html } from "@elysiajs/html";
import openapi from "@elysiajs/openapi";

export const htmlPage = new Elysia()
  .use(
    openapi({
      path: "/openapi",
      documentation: {
        info: {
          title: "SMART-Goal API Documentation",
          description: "API documentation for the SMART-Goal API",
          version: "1.0.0",
        },
        tags: [
          {
            name: "Goals",
            description: "Endpoints related to goals management",
          },
          {
            name: "Users",
            description: "Endpoints related to user management",
          },
        ],

        servers: [
          {
            url: `http://localhost:${Bun.env.PORT}`,
            description: "Development server",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
    }),
  )
  .use(html())
  .get("/", () => (
    <html lang="en">
      <head>
        <title>SMART-Goal</title>
        <style>
          {`*{margin:0; padding:0; box-sizing: border-box;}
          body {height: 100vh; background-color: hsl(223,43%,11%); justify-content: center; align-items: center; }
          .card {color: hsl(202,16%,55%); position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: hsl(223,43%,11%); border-radius: 1rem; padding: 2rem; box-shadow: 0 0 10px rgba(0,0,0,.5);}
          a {text-decoration: none;}
          .api-button {background-color: hsl(223,43%,11%) ; color: hsl(202,16%,55%); margin: 0.75rem; border: solid; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease;}
          .api-button:hover {background-color: hsl(202,16%,55%); color: hsl(223,43%,11%);}
          `}
        </style>
      </head>
      <body>
        <div class="card">
          <h1>SMART-Goal API is running!🚀</h1>
          <p>Created with Elysia.js🦊 and Bun runtime🥟</p>
          <a href="/openapi">
            <button class="api-button">📚 View API Documentation</button>
          </a>
        </div>
      </body>
    </html>
  ));
