<script setup lang="ts">
import { Icon as SvgIcon } from "@iconify/vue";
import { flatMap, uniq } from "es-toolkit/array";

import { DialogAdd, DialogEdit } from "..";
import { batchDelete, destroy, getAssignedIds, switchStatus } from "../../api";
import { DELAY_TIME, NO_DATA } from "@/constants";
import { ButtonText, HttpCode, StatusMap } from "@/enums";

defineOptions({
	name: "TableData",
});

const props = defineProps<{
	data: Department[];
}>();

const assignedIds = ref<number[]>([]);
const multipleSelection = ref<Department[]>([]);

const addRef = useTemplateRef<InstanceType<typeof DialogAdd>>("addRef");
const editRef = useTemplateRef<InstanceType<typeof DialogEdit>>("editRef");

const handleSelectable = (row: Department): boolean => {
	return assignedIds.value.includes(row.id) === false;
};

const handleSelectionChange = (val: Department[]): void => {
	multipleSelection.value = val;
};

const handleDestroy = async (row: Department): Promise<void> => {
	if (assignedIds.value.includes(row.id)) {
		ElMessage({
			message: "已分配给用户，不能删除！",
			duration: DELAY_TIME,
			type: "warning",
		});

		return;
	}

	ElMessageBox.confirm(`确定要删除 "${row.title}" 吗？`, "提示", {
		confirmButtonText: ButtonText.Confirm,
		cancelButtonText: ButtonText.Cancel,
		type: "warning",
	}).then(async () => {
		const { code, message } = await destroy(row.id);

		ElMessage({
			message,
			duration: DELAY_TIME,
			type: code === HttpCode.NoContent ? "success" : "error",
		});
	});
};

const handleBatchDelete = async (): Promise<void> => {
	ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个吗？`, "提示", {
		confirmButtonText: ButtonText.Confirm,
		cancelButtonText: ButtonText.Cancel,
		type: "warning",
	}).then(async () => {
		const { code, message } = await batchDelete(multipleSelection.value.map((row) => row.id));

		ElMessage({
			message,
			duration: DELAY_TIME,
			type: code === HttpCode.NoContent ? "success" : "error",
		});
	});
};

onMounted(async () => {
	assignedIds.value = uniq(flatMap(await getAssignedIds(), (item) => item));
});
</script>

<template>
	<div class="mx-5 flex-1 space-y-5 bg-white p-5">
		<div class="flex-center-x gap-1">
			<el-button type="primary" v-perm="'department:add'" @click="addRef?.open()">
				<svg-icon icon="ep-plus" class="mr-1" />
				{{ ButtonText.Add }}
			</el-button>
			<el-button
				type="danger"
				v-perm="'department:delete'"
				@click="handleBatchDelete"
				:disabled="multipleSelection.length === 0"
			>
				<svg-icon icon="ep-delete" class="mr-1" />
				{{ ButtonText.BatchDelete }}
			</el-button>
		</div>

		<el-table :data="data" row-key="id" stripe border style="width: 100%" @selection-change="handleSelectionChange">
			<template #empty>{{ NO_DATA }}</template>
			<el-table-column type="selection" min-width="60" align="center" :selectable="handleSelectable" />
			<el-table-column prop="id" label="序号" min-width="60" align="center" sortable />
			<el-table-column prop="name" label="名称" min-width="150" align="center" />
			<el-table-column prop="title" label="标题" min-width="150" align="center" />
			<el-table-column prop="status" label="状态" min-width="100" align="center">
				<template #default="{ row }">
					<el-switch
						v-model="(row as Department).status"
						:active-text="StatusMap.Enabled"
						:active-value="StatusMap.Enabled"
						:inactive-text="StatusMap.Disabled"
						:inactive-value="StatusMap.Disabled"
						inline-prompt
						style="--el-switch-on-color: #67c23a; --el-switch-off-color: #f56c6c"
						@change="(val: any) => switchStatus((row as Department).id, val as Status)"
					/>
				</template>
			</el-table-column>
			<el-table-column prop="createdAt" label="创建时间" min-width="200" align="center" />
			<el-table-column prop="updatedAt" label="更新时间" min-width="200" align="center" />
			<el-table-column label="操作" min-width="200" align="center" fixed="right">
				<template #default="{ row }">
					<el-button type="primary" v-perm="'department:edit'" @click="editRef?.open(row as Department)">
						<svg-icon icon="ep-edit" class="mr-1" />
						{{ ButtonText.Edit }}
					</el-button>
					<el-button type="danger" v-perm="'department:delete'" @click="handleDestroy(row as Department)">
						<svg-icon icon="ep-delete" class="mr-1" />
						{{ ButtonText.Destroy }}
					</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>

	<dialog-add ref="addRef" :data="data" />
	<dialog-edit ref="editRef" :data="data" />
</template>
