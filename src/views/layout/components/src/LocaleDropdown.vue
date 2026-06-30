<script setup lang="ts">
import { Icon as SvgIcon } from "@iconify/vue";

import { ChangePassword } from "..";
import { AUTH_KEY, DB_NAME } from "@/constants";
import { ButtonText, RouterKey } from "@/enums";
import { redirectTo } from "@/utils";

defineOptions({
	name: "LocaleDropdown",
});

defineProps<{
	user: User;
}>();

const showDialog = defineModel<boolean>();

const confirmLogout = (): void => {
	ElMessageBox.confirm("退出系统将初始化数据，您确定退出吗？", "温馨提示", {
		confirmButtonText: ButtonText.Confirm,
		cancelButtonText: ButtonText.Cancel,
		type: "warning",
	}).then(() => {
		localStorage.removeItem(AUTH_KEY);
		window.indexedDB.deleteDatabase(DB_NAME);
		redirectTo(RouterKey.Login);
	});
};
</script>

<template>
	<el-dropdown class="h-full cursor-pointer">
		<div class="flex-center-x gap-1">
			<svg-icon :icon="user.avatar" class="h-5 w-5" />
			<span class="text-(sm neutral-600)">{{ user.realname }}</span>
		</div>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item @click="showDialog = true">修改密码</el-dropdown-item>
				<el-dropdown-item @click="confirmLogout">退出系统</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>

	<change-password v-model="showDialog" :id="user.id" />
</template>
