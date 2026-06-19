import { resolve } from "path"
import { defineConfig } from "vite"
import glsl from "vite-plugin-glsl"
import restart from "vite-plugin-restart"


// https://vitejs.dev/config/
export default defineConfig({
    root: "src/",
    publicDir: "../public/",
    base: "./",
    server:
    {
        // Allow access to local network
        host: true,
    },
    build:
    {
        outDir: "../dist", // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true, // Add sourcemap
        // This does splitting into application and vendor code does not work yet.
        // I think what is happening is that the index-*.js file is being served
        // correctly by the deno server from:
        //     https://wikisim-server.wikisim.deno.net/1272v4/assets/index-DfbjeLe0.js
        // which returns with a redirect to a supabase URL like:
        //     https://sfkgqscbwofiphfxhnxg.supabase.co/storage/v1/object/public/interactables_files/3c378f9f294eb84b22d64bd17e09ce0dee56d37d3fdab6e7b7d64210d9c13a6c
        // but then because it references ./vendor-*.js this file is requested
        // from the new index-*.js file path, i.e.
        //     https://sfkgqscbwofiphfxhnxg.supabase.co/vendor-Cm_jY_mP.js
        // and that is not being found, instead of:
        //     https://wikisim-server.wikisim.deno.net/1272v4/assets/vendor-Cm_jY_mP.js
        rollupOptions:
        {
            output:
            {
                manualChunks(id) {
                    if (id.includes("node_modules")) return "vendor"
                },
            },
        },
    },
    plugins:
    [
        restart({ restart: [ "../public/**", ] }), // Restart server on file changes to public/
        glsl(), // Handle shader files
    ],
    resolve: {
        alias: {
            "core": resolve(__dirname, "./lib/core/src"),
        }
    },
})
