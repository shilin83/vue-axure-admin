<script setup lang="ts">
import { faker } from "@faker-js/faker/locale/zh_CN";
import dayjs from "dayjs";
import { LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import VChart from "vue-echarts";

type ChartData = {
	dates: string[];
	forecastData: number[];
	actualData: number[];
};

defineOptions({
	name: "SaleLine",
});

use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, LineChart, CanvasRenderer]);

const currentMonthDate = ref(dayjs().subtract(1, "month").format("YYYY-MM"));

const disabledDate = (time: Date): boolean => {
	return dayjs(time).startOf("month").isAfter(dayjs().startOf("month").subtract(1, "month"));
};

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value));
};

const countCrossings = (forecastData: number[], actualData: number[]): number => {
	let crossings = 0;

	for (let i = 1; i < forecastData.length; i++) {
		const prevForecast = forecastData[i - 1];
		const prevActual = actualData[i - 1];
		const currForecast = forecastData[i];
		const currActual = actualData[i];

		if (prevForecast == null || prevActual == null || currForecast == null || currActual == null) {
			continue;
		}

		const prev = prevForecast - prevActual;
		const curr = currForecast - currActual;

		if (prev === 0 || curr === 0) {
			continue;
		}

		if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) {
			crossings += 1;
		}
	}

	return crossings;
};

const generateChartData = (monthStr: string): ChartData => {
	let forecast = faker.number.int({ min: 40, max: 60 });
	let error = faker.number.int({ min: -8, max: 8 });

	const pickBias = (): number => {
		if (faker.number.float({ min: 0, max: 1 }) < 0.72) {
			return faker.number.int({ min: 8, max: 26 });
		}

		return faker.number.int({ min: -20, max: -6 });
	};

	let bias = pickBias();
	let biasDaysLeft = faker.number.int({ min: 4, max: 9 });

	const targetDate = dayjs(monthStr);
	const daysInMonth = targetDate.daysInMonth();
	const dates = Array.from({ length: daysInMonth }, (_, i) => targetDate.date(i + 1).format("MM/DD"));
	const forecastData: number[] = [];
	const actualData: number[] = [];

	for (let i = 0; i < daysInMonth; i++) {
		const change = faker.number.int({ min: -15, max: 15 });

		forecast = clamp(forecast + change, 10, 100);
		forecastData.push(forecast);

		biasDaysLeft -= 1;
		if (biasDaysLeft <= 0) {
			bias = pickBias();
			biasDaysLeft = faker.number.int({ min: 5, max: 11 });
		}

		const shouldFlip = faker.number.float({ min: 0, max: 1 }) < 0.16;
		const dailyNoise = faker.number.int({ min: -4, max: 4 });

		error = shouldFlip
			? -error + faker.number.int({ min: -10, max: 10 })
			: error + faker.number.int({ min: -6, max: 6 });
		error = clamp(error, -16, 16);

		actualData.push(clamp(forecast + bias + error + dailyNoise, 10, 100));
	}

	if (daysInMonth >= 7) {
		const injectCrossingAt = (idx: number, delta: number): void => {
			const safeIdx = clamp(idx, 0, daysInMonth - 2);
			const f0 = forecastData[safeIdx];
			const f1 = forecastData[safeIdx + 1];

			if (f0 == null || f1 == null) {
				return;
			}

			actualData[safeIdx] = clamp(f0 + delta, 10, 100);
			actualData[safeIdx + 1] = clamp(f1 - delta, 10, 100);
		};

		const ensureBothSides = (): void => {
			let above = 0;
			let below = 0;

			for (let i = 0; i < daysInMonth; i++) {
				const f = forecastData[i];
				const a = actualData[i];
				if (f == null || a == null) {
					continue;
				}

				if (a > f) {
					above += 1;
				} else if (a < f) {
					below += 1;
				}
			}

			const minAbove = Math.max(5, Math.floor(daysInMonth * 0.45));
			const minBelow = Math.max(3, Math.floor(daysInMonth * 0.18));
			const deltaAbove = faker.number.int({ min: 12, max: 22 });
			const deltaBelow = faker.number.int({ min: 8, max: 18 });

			if (above < minAbove) {
				const needed = minAbove - above;
				for (let k = 0; k < needed; k++) {
					const idx = clamp(1 + k * 2, 0, daysInMonth - 1);
					const f = forecastData[idx];
					if (f == null) {
						continue;
					}

					actualData[idx] = clamp(f + deltaAbove, 10, 100);
				}
			}

			if (below < minBelow) {
				const needed = minBelow - below;
				for (let k = 0; k < needed; k++) {
					const idx = clamp(2 + k * 4, 0, daysInMonth - 1);
					const f = forecastData[idx];

					if (f == null) {
						continue;
					}

					actualData[idx] = clamp(f - deltaBelow, 10, 100);
				}
			}
		};

		ensureBothSides();

		const targetCrossings = faker.number.int({ min: 1, max: 3 });

		let crossings = countCrossings(forecastData, actualData);
		if (crossings < targetCrossings) {
			const candidates: number[] = [];

			for (let i = 2; i < daysInMonth - 2; i++) {
				const current = forecastData[i];
				const next = forecastData[i + 1];

				if (current == null || next == null) {
					continue;
				}

				const ok = current > 25 && current < 85 && next > 25 && next < 85;
				if (ok) {
					candidates.push(i);
				}
			}

			const attempts = Math.min(4, candidates.length > 0 ? candidates.length : 1);

			for (let t = 0; t < attempts && crossings < targetCrossings; t++) {
				const idx =
					candidates.length > 0
						? (candidates[faker.number.int({ min: 0, max: candidates.length - 1 })] ?? Math.floor(daysInMonth / 2))
						: Math.floor((daysInMonth * (t + 1)) / (attempts + 1));

				injectCrossingAt(idx, faker.number.int({ min: 14, max: 22 }));
				crossings = countCrossings(forecastData, actualData);
			}
		}
	}

	if (daysInMonth >= 7 && countCrossings(forecastData, actualData) === 0) {
		const candidates: number[] = [];

		for (let i = 2; i < daysInMonth - 2; i++) {
			const current = forecastData[i];
			const next = forecastData[i + 1];

			if (current == null || next == null) {
				continue;
			}

			const ok = current > 25 && current < 85 && next > 25 && next < 85;
			if (ok) {
				candidates.push(i);
			}
		}

		let idx = Math.floor(daysInMonth / 2);

		if (candidates.length > 0) {
			const pick = faker.number.int({ min: 0, max: candidates.length - 1 });

			idx = candidates[pick] ?? idx;
		}

		idx = clamp(idx, 0, daysInMonth - 2);

		const f0 = forecastData[idx];
		const f1 = forecastData[idx + 1];
		if (f0 != null && f1 != null) {
			actualData[idx] = clamp(f0 + 10, 10, 100);
			actualData[idx + 1] = clamp(f1 - 10, 10, 100);
		}
	}

	return {
		dates,
		forecastData,
		actualData,
	};
};

const chartData = ref(generateChartData(currentMonthDate.value));

const chartOption = computed(() => ({
	tooltip: {
		trigger: "axis",
		formatter: (params: any) => {
			let result = `${params[0].axisValue}<br/>`;

			params.forEach((param: any) => {
				result += `${param.marker} ${param.seriesName}: ${param.value}万<br/>`;
			});

			return result;
		},
	},
	legend: {
		data: ["预计", "实际"],
		right: "center",
		top: 0,
		icon: "rect",
		itemWidth: 12,
		itemHeight: 4,
		textStyle: {
			color: "#9ca3af",
		},
	},
	grid: {
		left: "0",
		right: "0",
		bottom: "0",
		top: "40",
		containLabel: true,
	},
	xAxis: {
		type: "category",
		boundaryGap: false,
		data: chartData.value.dates,
		axisLine: {
			lineStyle: {
				color: "#e5e7eb",
			},
		},
		axisLabel: {
			color: "#9ca3af",
			margin: 15,
		},
		axisTick: {
			show: true,
			lineStyle: {
				color: "#e5e7eb",
			},
		},
	},
	yAxis: {
		type: "value",
		min: 0,
		max: 100,
		interval: 20,
		axisLabel: {
			color: "#9ca3af",
			formatter: "{value}万",
		},
		splitLine: {
			lineStyle: {
				type: "dashed",
				color: "#f3f4f6",
			},
		},
	},
	series: [
		{
			name: "预计",
			type: "line",
			data: chartData.value.forecastData,
			smooth: false,
			symbol: "none",
			lineStyle: {
				color: "#3b82f6",
				width: 2,
			},
			areaStyle: {
				color: {
					type: "linear",
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{
							offset: 0,
							color: "rgba(59, 130, 246, 0.2)",
						},
						{
							offset: 1,
							color: "rgba(59, 130, 246, 0)",
						},
					],
				},
			},
		},
		{
			name: "实际",
			type: "line",
			data: chartData.value.actualData,
			smooth: false,
			symbol: "none",
			lineStyle: {
				color: "#22c55e",
				width: 2,
			},
			areaStyle: {
				color: {
					type: "linear",
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{
							offset: 0,
							color: "rgba(34, 197, 94, 0.2)",
						},
						{
							offset: 1,
							color: "rgba(34, 197, 94, 0)",
						},
					],
				},
			},
		},
	],
}));

watch(currentMonthDate, (newMonth) => {
	if (newMonth) {
		chartData.value = generateChartData(newMonth);
	}
});
</script>

<template>
	<div class="flex-y rounded bg-white p-5">
		<div class="flex-center-x pointer-events-none justify-between">
			<h2 class="text-(lg gray-800) font-600">销售趋势</h2>
			<el-config-provider :locale="zhCn">
				<el-date-picker
					v-model="currentMonthDate"
					type="month"
					placeholder="选择月份"
					format="YYYY-MM"
					value-format="YYYY-MM"
					class="pointer-events-auto !w-30"
					size="small"
					:clearable="false"
					:disabled-date="disabledDate"
				/>
			</el-config-provider>
		</div>
		<div class="min-h-[300px] max-w-[calc(100vw-200px)] flex-1">
			<v-chart :option="chartOption" autoresize />
		</div>
	</div>
</template>
