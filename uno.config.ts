import { defineConfig, presetWind4, presetIcons, transformerDirectives, transformerVariantGroup } from "unocss";

export default defineConfig({
	content: {
		pipeline: {
			exclude: ["node_modules", "dist"],
		},
	},
	presets: [
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
		presetIcons({
			warn: true,
			scale: 1,
			extraProperties: {},
		}),
	],
	rules: [
		[
			"full-screen",
			[
				["width", "100dvw"],
				["height", "100dvh"],
			],
		],
	],
	shortcuts: [
		{
			"flex-center": "flex justify-center items-center",
			"flex-center-x": "flex items-center",
			"flex-center-y": "flex justify-center",
			"flex-y": "flex flex-col",
		},
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
