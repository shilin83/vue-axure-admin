<script setup lang="ts">
import { intersectionWith, remove, head } from "es-toolkit/array";

import { RouterKey } from "@/enums";

defineOptions({
	name: "TopBreadcrumb",
});

const props = defineProps<{
	active: RouteKey;
	menus: Menu[];
}>();

const items = computed(() => {
	if (props.menus.length === 0 || !(props.active in RouterKey)) {
		return [];
	}

	const res: {
		key: string;
		path: string;
	}[] = [];

	// * 根据 active 找到当前选中的菜单项
	let matched = head(remove(props.menus, (menu) => menu.key === props.active));
	while (matched) {
		res.push({
			key: matched.key,
			path: matched.path,
		});

		// * 如果是根菜单，直接添加到根节点
		if (matched.parentId === 0) {
			break;
		}

		// * 找到当前菜单的父菜单
		matched = head(intersectionWith(props.menus, [matched.parentId], (obj, parentId) => obj.id === parentId));
	}

	return res.reverse();
});
</script>

<template>
	<el-breadcrumb separator="/">
		<template v-for="item in items" :key="item.key">
			<el-breadcrumb-item>{{ item.path }}</el-breadcrumb-item>
		</template>
	</el-breadcrumb>
</template>
