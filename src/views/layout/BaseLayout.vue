<script setup lang="ts">
import "virtual:uno.css";

import { useTimeoutFn } from "@vueuse/core";

import { SideMenu, LocaleDropdown, TopBreadcrumb } from "./components";
import { DELAY_TIME } from "@/constants";
import { RouterKey } from "@/enums";
import { getAuth, redirectTo } from "@/utils";

defineOptions({
	name: "BaseLayout",
});

defineProps<{
	active: RouteKey;
}>();

const auth = getAuth();

onBeforeMount(() => {
	if (auth === null) {
		ElNotification.error({
			message: "会话已过期，请重新登录！",
			duration: DELAY_TIME,
		});

		useTimeoutFn(() => {
			redirectTo(RouterKey.Login);
		}, DELAY_TIME);
	}
});
</script>

<template>
	<div class="full-screen grid-(~ cols-[200px_1fr] rows-[40px_1fr_40px]) overflow-hidden">
		<aside class="flex-y border-r-(1 solid neutral-200) row-span-3 overflow-hidden">
			<div class="flex-center h-10 shrink-0">
				<div class="i-logos:google-workspace text-xl" />
			</div>
			<div class="flex-1 overflow-y-auto">
				<side-menu v-if="auth" :menus="auth.menus" :active="active" />
			</div>
		</aside>

		<header class="flex-center-x border-b-(1 solid neutral-200) justify-between px-2.5">
			<top-breadcrumb v-if="auth" :menus="auth.menus" :active="active" />
			<locale-dropdown v-if="auth" :user="auth.user" />
		</header>

		<main class="overflow-auto bg-neutral-100">
			<slot />
		</main>

		<footer class="border-t-(1 solid neutral-200) flex-center text-(sm neutral-600)">
			<span>Copyright MIT © 2026 Axure</span>
		</footer>
	</div>
</template>
