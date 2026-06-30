<script setup lang="ts">
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { from } from "rxjs";

import { getDataList } from "./api";
import { SearchFilter, TableData } from "./components";
import { RouterKey } from "@/enums";

defineOptions({
	name: RouterKey.Department,
});

const dataList = useObservable(
	from(
		liveQuery(() =>
			getDataList().then((res) => {
				if (res.data === null) {
					return [];
				}

				return res.data;
			}),
		),
	),
	{ initialValue: [] },
);

const searchQuery = ref<string>("");

const data = computed<Department[]>(() => {
	if (searchQuery.value === "") {
		return dataList.value;
	}

	return dataList.value.filter((department) => department.title.toLowerCase().includes(searchQuery.value));
});

const handleSearch = (query: string): void => {
	searchQuery.value = query;
};
</script>

<template>
	<base-layout :active="RouterKey.Department">
		<div class="flex-y space-y-5 py-5">
			<search-filter @search="handleSearch" />
			<table-data :data="data" />
		</div>
	</base-layout>
</template>
