import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

const root = process.cwd();

const pathResolve = (dir: string): string => resolve(root, dir);

const basePath = pathResolve("src/views");

const entryName = process.env.entry || "home";

const allEntries: Record<string, string> = {
	[entryName]: pathResolve(`${basePath}/${entryName}/main.ts`),
};

export default defineConfig({
	root: `${basePath}`,
	plugins: [
		vueDevTools(),
		vue(),
		unocss(),
		AutoImport({
			imports: ["vue", { from: "element-plus", imports: ["FormInstance", "FormRules"], type: true }],
			resolvers: [ElementPlusResolver()],
			dts: pathResolve("types/auto-imports.d.ts"),
		}),
		Components({
			resolvers: [ElementPlusResolver()],
			dts: pathResolve("types/components.d.ts"),
		}),
	],
	resolve: {
		alias: { "@": pathResolve("src") },
	},
	build: {
		chunkSizeWarningLimit: 4096,
		rolldownOptions: {
			input: entryName ? { [entryName]: allEntries[entryName] } : undefined,
			output: {
				dir: `${root}/dist`,
				format: "iife",
				entryFileNames: `[name].js`,
				minify: {
					compress: {
						dropConsole: true,
						dropDebugger: true,
					},
				},
			},
		},
	},
	server: {
		open: `${entryName}/`,
	},
});
