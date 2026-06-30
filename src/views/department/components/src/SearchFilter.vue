<script setup lang="ts">
import { Icon as SvgIcon } from "@iconify/vue";

import { ButtonText } from "@/enums";

defineOptions({
	name: "SearchFilter",
});

const emit = defineEmits<{
	search: [query: string];
}>();

const searchRef = useTemplateRef<FormInstance>("searchRef");

const searchModel = reactive<{
	title: string;
}>({
	title: "",
});

const handleSearch = (): void => {
	emit("search", searchModel.title);
};

const handleReset = (): void => {
	searchRef.value?.resetFields();
	emit("search", searchModel.title);
};
</script>

<template>
	<div class="mx-5 h-15 content-center bg-white px-5">
		<el-form ref="searchRef" :model="searchModel" inline>
			<el-form-item label="标题" prop="title" class="!mb-0">
				<el-input v-model="searchModel.title" placeholder="请输入标题" clearable />
			</el-form-item>
			<el-form-item class="!mb-0">
				<el-button type="primary" @click="handleSearch">
					<svg-icon icon="ep-search" class="mr-1" />
					{{ ButtonText.Search }}
				</el-button>
				<el-button type="default" @click="handleReset">
					<svg-icon icon="ep-refresh" class="mr-1" />
					{{ ButtonText.Reset }}
				</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>
