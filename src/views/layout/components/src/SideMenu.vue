<script setup lang="ts">
import { Icon as SvgIcon } from "@iconify/vue";

import { redirectTo } from "@/utils";

defineOptions({
	name: "SideMenu",
});

const props = defineProps<{
	active: RouteKey;
	menus: Menu[];
}>();

const menus = computed<Menu[]>(() => {
	// * 转换为树状结构
	const menuMap = new Map<number, Menu>(props.menus.map((menu) => [menu.id, { ...menu, children: [] }]));

	// * 递归处理菜单，将子菜单添加到父菜单的 children 中
	return props.menus.reduce<Menu[]>((root, menu) => {
		// * 如果是根菜单，直接添加到根节点
		const current = menuMap.get(menu.id)!;
		if (current.parentId === 0) {
			root.push(current);
		} else {
			// * 如果父菜单存在，将当前菜单添加到父菜单的 children 中
			// * 否则，将当前菜单添加到根节点
			const parent = menuMap.get(current.parentId);
			if (parent) {
				parent.children?.push(current);
			} else {
				root.push(current);
			}
		}

		return root;
	}, []);
});

const handleSelect = (index: string): void => {
	if (index !== props.active) {
		redirectTo(index);
	}
};
</script>

<template>
	<el-menu :default-active="active" @select="handleSelect" class="!border-r-0" unique-opened>
		<template v-for="menu in menus" :key="menu.key">
			<el-sub-menu v-if="menu.children?.length" :index="menu.key">
				<template #title>
					<svg-icon :icon="menu.icon" />
					<span class="ml-2.5">{{ menu.path }}</span>
				</template>
				<template v-for="child in menu.children" :key="child.key">
					<el-menu-item :index="child.key">
						<span>{{ child.path }}</span>
					</el-menu-item>
				</template>
			</el-sub-menu>
			<el-menu-item v-else :index="menu.key">
				<svg-icon :icon="menu.icon" />
				<span class="ml-2.5">{{ menu.path }}</span>
			</el-menu-item>
		</template>
	</el-menu>
</template>
