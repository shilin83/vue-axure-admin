<script setup lang="ts">
import { StatMetric, SaleLine, RankBar } from "./components";
import { RouterKey } from "@/enums";

defineOptions({
	name: RouterKey.Home,
});
</script>

<template>
	<base-layout :active="RouterKey.Home">
		<div class="grid-(~ rows-[auto_1fr_auto]) h-full gap-5 p-5">
			<stat-metric />
			<sale-line />
			<rank-bar />
		</div>
	</base-layout>
</template>
