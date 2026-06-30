<script setup lang="ts">
import { faker } from "@faker-js/faker/locale/zh_CN";
import dayjs from "dayjs";
import { BarChart, PieChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import VChart from "vue-echarts";

type RankRow = {
	name: string;
	volume: number;
	amount: number;
};

type MonthValue = string | null;

defineOptions({
	name: "RankBar",
});

const freshProducts = [
	"智利车厘子JJ级 5kg原箱",
	"阳澄湖大闸蟹礼盒装",
	"澳洲原切M3眼肉牛排",
	"厄瓜多尔三文鱼原切中段",
	"海南佳沛椰子原箱 3kg",
	"丹东金钻燕窝果 100g",
	"新疆树上熟贵妃芒 2.5kg",
	"内蒙阿克苏苹果 5kg",
	"东海野生大黄鱼 500g",
	"宁夏桥头排骨 1kg",
	"云南蓝莓礼盒装 500g",
	"山东烟台红富士苹果 4.5kg",
	"广西百香果 2kg",
	"福建平和蜜柚 3kg",
	"广东湛江对虾 800g",
	"挪威三文鱼刺身拼盘 300g",
	"内蒙古羊排 1kg",
	"泰国金枕榴莲肉 500g",
	"新疆哈密瓜 2枚装",
	"东北有机玉米 10根装",
	"陕西洛川红富士 5kg",
	"赣南脐橙礼盒装 4kg",
	"云南松茸鲜品 250g",
	"大连海参即食装 300g",
	"山东乳山生蚝 30只装",
	"广西砂糖橘 3kg",
	"福建平潭小管鱿鱼 500g",
	"青岛啤酒原浆 1L*2",
	"舟山带鱼段 1kg",
	"江苏盐水鸭礼盒 1.2kg",
	"四川耙耙柑 2.5kg",
	"新疆红枣特级 1kg",
	"东北五常大米 5kg",
	"云南普洱茶饼 357g",
	"广东潮汕牛肉丸 500g",
	"宁波舟山梭子蟹 1kg",
	"福建龙岩香菇 500g",
	"安徽黄山毛峰 200g",
	"广西螺蛳粉 6袋装",
	"海南文昌鸡 1.5kg",
];

use([TooltipComponent, LegendComponent, GridComponent, BarChart, PieChart, CanvasRenderer]);

const formatShortName = (name: string, maxLen = 10): string => {
	if (name.length <= maxLen) {
		return name;
	}

	return `${name.slice(0, maxLen)}…`;
};

const generateRankRows = (): RankRow[] => {
	const count = faker.number.int({ min: 12, max: 16 });
	const picked = faker.helpers.arrayElements(freshProducts, count);

	return picked.map((name) => {
		const volume = faker.number.int({ min: 120, max: 1200 });
		const amount = faker.number.float({ min: 8, max: 220, fractionDigits: 2 });

		return {
			name,
			volume,
			amount,
		};
	});
};

const hashSeed = (value: string): number => {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) | 0;
	}

	return Math.abs(hash);
};

const barColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"];
const lastMonthStr = dayjs().subtract(1, "month").format("YYYY-MM");

const volumeRows = ref<RankRow[]>([]);
const amountRows = ref<RankRow[]>([]);
const volumeMonth = ref<MonthValue>(lastMonthStr);
const amountMonth = ref<MonthValue>(lastMonthStr);

const disabledFutureMonth = (time: Date): boolean => {
	return dayjs(time).startOf("month").isAfter(dayjs().subtract(1, "month").startOf("month"));
};

const refreshVolumeByMonth = (): void => {
	const seed = hashSeed(volumeMonth.value ?? "all");
	faker.seed(seed);
	volumeRows.value = generateRankRows();
};

const refreshAmountByMonth = (): void => {
	const seed = hashSeed(amountMonth.value ?? "all");
	faker.seed(seed);
	amountRows.value = generateRankRows();
};

const topVolumeRows = computed(() => [...volumeRows.value].sort((a, b) => b.volume - a.volume).slice(0, 5));
const topAmountRows = computed(() => [...amountRows.value].sort((a, b) => b.amount - a.amount).slice(0, 5));
const volumeOption = computed(() => ({
	tooltip: {
		trigger: "axis",
		axisPointer: { type: "shadow" },
		formatter: (params: any) => {
			const p = params?.[0];

			if (!p) {
				return "";
			}

			return `${p.name}<br/>${p.marker} 销量：${p.value}`;
		},
	},
	grid: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 20,
		containLabel: true,
	},
	xAxis: {
		type: "category",
		data: topVolumeRows.value.map((i) => i.name),
		axisTick: {
			show: false,
		},
		axisLine: {
			lineStyle: {
				color: "#e5e7eb",
			},
		},
		axisLabel: {
			color: "#6b7280",
			interval: 0,
			rotate: 20,
			formatter: (value: string) => {
				return formatShortName(value, 8);
			},
		},
	},
	yAxis: {
		type: "value",
		axisLabel: {
			color: "#9ca3af",
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
			type: "bar",
			data: topVolumeRows.value.map((i) => i.volume),
			barWidth: 18,
			showBackground: true,
			backgroundStyle: {
				color: "#f3f4f6",
			},
			itemStyle: {
				borderRadius: [6, 6, 0, 0],
				color: (p: any) => {
					return barColors[p.dataIndex % barColors.length];
				},
			},
			label: {
				show: true,
				position: "top",
				color: "#374151",
				fontWeight: 600,
			},
		},
	],
}));

const amountOption = computed(() => ({
	tooltip: {
		trigger: "item",
		formatter: (p: any) => `${p.marker} ${p.name}<br/>销售额：${p.value} 万<br/>占比：${p.percent}%`,
	},
	legend: {
		type: "scroll",
		orient: "vertical",
		right: 0,
		top: "center",
		textStyle: {
			color: "#6b7280",
		},
	},
	series: [
		{
			type: "pie",
			radius: ["45%", "70%"],
			center: ["35%", "50%"],
			avoidLabelOverlap: true,
			itemStyle: {
				borderRadius: 8,
				borderColor: "#fff",
				borderWidth: 2,
			},
			label: { show: false },
			labelLine: { show: false },
			data: topAmountRows.value.map((i) => ({
				name: i.name,
				value: i.amount,
			})),
		},
	],
}));

watch(volumeMonth, refreshVolumeByMonth, {
	immediate: true,
});

watch(amountMonth, refreshAmountByMonth, {
	immediate: true,
});
</script>

<template>
	<div class="grid-(~ cols-2) gap-5 pb-5">
		<div class="flex-y rounded bg-white p-5">
			<div class="flex-center-x pointer-events-none mb-5 justify-between">
				<h2 class="text-(lg gray-800) font-600 leading-none">销量 TOP5</h2>
				<el-config-provider :locale="zhCn">
					<el-date-picker
						v-model="volumeMonth"
						type="month"
						placeholder="选择月份"
						format="YYYY-MM"
						value-format="YYYY-MM"
						class="pointer-events-auto !w-30"
						size="small"
						:clearable="false"
						:disabled-date="disabledFutureMonth"
					/>
				</el-config-provider>
			</div>
			<div class="h-80 max-w-[calc(100vw-200px)]">
				<v-chart :option="volumeOption" autoresize />
			</div>
		</div>
		<div class="flex-y rounded bg-white p-5">
			<div class="flex-center-x pointer-events-none mb-5 justify-between">
				<h2 class="text-(lg gray-800) font-600 leading-none">销售额 TOP5</h2>
				<el-config-provider :locale="zhCn">
					<el-date-picker
						v-model="amountMonth"
						type="month"
						placeholder="选择月份"
						format="YYYY-MM"
						value-format="YYYY-MM"
						class="pointer-events-auto !w-30"
						size="small"
						:clearable="false"
						:disabled-date="disabledFutureMonth"
					/>
				</el-config-provider>
			</div>
			<div class="h-80 max-w-[calc(100vw-200px)]">
				<v-chart :option="amountOption" autoresize />
			</div>
		</div>
	</div>
</template>
