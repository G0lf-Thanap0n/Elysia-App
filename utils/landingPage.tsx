import Elysia from "elysia";
import { html, Html } from "@elysiajs/html";

export const htmlPage = new Elysia().use(html()).get("/", () => (
  <html lang="en">
    <head>
      <title>SMART-Goal</title>
      <style>
        {`*{margin:0; padding:0; box-sizing: border-box;}
          body {height: 100vh; background-color: hsl(223,43%,11%); justify-content: center; align-items: center; }
          .card {color: hsl(202,16%,55%); position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: hsl(223,43%,11%); border-radius: 1rem; padding: 2rem; box-shadow: 0 0 10px rgba(0,0,0,.5);}`}
      </style>
    </head>
    <body>
      <div class="card">
        <h1>SMART-Goal API is running!🚀</h1>
        <p>Created with Elysia.js🦊 and Bun runtime🥟</p>
      </div>
    </body>
  </html>
));
