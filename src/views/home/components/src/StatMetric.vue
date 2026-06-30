<script setup lang="ts">
import { faker } from "@faker-js/faker/locale/zh_CN";
import { Icon as SvgIcon } from "@iconify/vue";

defineOptions({
	name: "Metric",
});

const metrics = ref<
	{
		title: string;
		value: string;
		percent: string;
		icon: string;
		color: string;
	}[]
>([
	{
		title: "今日订单数",
		value: faker.number.int({ min: 1000, max: 10000 }).toLocaleString(),
		percent: `${faker.helpers.arrayElement(["+", "-"])}${faker.number.float({ min: 0, max: 20, fractionDigits: 2 })}%`,
		icon: "mdi-clipboard-text-outline",
		color: "bg-gradient-to-r from-green-400 via-green-500 to-green-600",
	},
	{
		title: "今日销售利润",
		value: faker.number
			.float({ min: 10000, max: 100000, fractionDigits: 2 })
			.toLocaleString("zh-CN", { minimumFractionDigits: 2 }),
		percent: `${faker.helpers.arrayElement(["+", "-"])}${faker.number.float({ min: 0, max: 20, fractionDigits: 2 })}%`,
		icon: "mdi-invoice-text-check-outline",
		color: "bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600",
	},
	{
		title: "库存余额",
		value: faker.number.int({ min: 100000, max: 1000000 }).toLocaleString(),
		percent: `${faker.helpers.arrayElement(["+", "-"])}${faker.number.float({ min: 0, max: 5, fractionDigits: 2 })}%`,
		icon: "mdi-warehouse",
		color: "bg-gradient-to-r from-red-400 via-red-500 to-red-600",
	},
	{
		title: "配送准时率",
		value: `${faker.number.float({ min: 95, max: 99, fractionDigits: 1 })}%`,
		percent: `${faker.helpers.arrayElement(["+", "-"])}${faker.number.float({ min: 0, max: 2, fractionDigits: 2 })}%`,
		icon: "mdi-truck-check-outline",
		color: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
	},
]);
</script>

<template>
	<div class="flex-y gap-5 rounded bg-white px-5">
		<h2 class="text-(lg gray-800) font-600 mt-5">数据概览</h2>
		<el-row :gutter="20" justify="space-between">
			<el-col v-for="(item, index) in metrics" :key="index" :xl="6" :lg="6" :md="12" :sm="12" :xs="24" class="mb-5">
				<div :class="['rounded p-5 text-white', item.color]">
					<div class="flex-y gap-2.5">
						<div class="text-(lg white/90) font-600 leading-none">{{ item.title }}</div>
						<div class="flex-center-x justify-between">
							<div class="font-800 text-4xl leading-none tracking-wide">
								{{ item.value }}
							</div>
							<div class="text-5xl opacity-60">
								<svg-icon :icon="item.icon" />
							</div>
						</div>
						<div class="text-(sm white/90) font-600 leading-none">{{ item.percent }}</div>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>
