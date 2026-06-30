<script setup lang="ts">
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { from } from "rxjs";

import { getDataList } from "./api";
import { SearchFilter, TableData } from "./components";
import { RouterKey } from "@/enums";

defineOptions({
	name: RouterKey.Permission,
});

const dataList = useObservable(
	from(
		liveQuery(() =>
			getDataList().then((res) => {
				if (res.data === null) {
					return [];
				}

				const permissionMap = new Map<number, Permission>(
					res.data.map((permission) => [permission.id, { ...permission, children: [] }]),
				);

				// * 构建权限树形结构
				return res.data.reduce<Permission[]>((root, permission) => {
					const current = permissionMap.get(permission.id)!;
					if (current.parentId === 0) {
						root.push(current);
					} else {
						const parent = permissionMap.get(current.parentId);
						if (parent) {
							parent.children?.push(current);
						} else {
							root.push(current);
						}
					}

					return root;
				}, []);
			}),
		),
	),
	{ initialValue: [] },
);

const searchQuery = ref<string>("");

const filterPermissionTree = (tree: Permission[], keyword: string): Permission[] => {
	if (keyword === "") {
		return tree;
	}

	return tree.reduce<Permission[]>((result, permission) => {
		const children = filterPermissionTree(permission.children ?? [], keyword);
		const isMatched = permission.title.toLowerCase().includes(keyword);
		if (isMatched === false && children.length === 0) {
			return result;
		}

		result.push({
			...permission,
			children: isMatched ? permission.children : children,
		});

		return result;
	}, []);
};

const data = computed<Permission[]>(() => {
	return filterPermissionTree(dataList.value, searchQuery.value.trim().toLowerCase());
});

const handleSearch = (query: string): void => {
	searchQuery.value = query;
};
</script>

<template>
	<base-layout :active="RouterKey.Permission">
		<div class="flex-y space-y-5 py-5">
			<search-filter @search="handleSearch" />
			<table-data :data="data" />
		</div>
	</base-layout>
</template>
