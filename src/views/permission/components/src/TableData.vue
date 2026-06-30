<script setup lang="ts">
import { flatMap, uniq } from "es-toolkit/array";

import { DialogAdd, DialogEdit } from "..";
import { batchDelete, destroy, getAssignedIds, hasChild, switchStatus } from "../../api";
import { DELAY_TIME, NO_DATA } from "@/constants";
import { ButtonText, HttpCode, StatusMap } from "@/enums";

defineOptions({
	name: "TableData",
});

const props = defineProps<{
	data: Permission[];
}>();

const addRef = useTemplateRef<InstanceType<typeof DialogAdd>>("addRef");
const editRef = useTemplateRef<InstanceType<typeof DialogEdit>>("editRef");

const assignedIds = ref<number[]>([]);
const multipleSelection = ref<Permission[]>([]);

const handleSelectable = (row: Permission): boolean => {
	if (row.children !== undefined && row.children.length > 0) {
		return false;
	}

	return assignedIds.value.includes(row.id) === false;
};

const handleDestroy = async (row: Permission): Promise<void> => {
	if (row.parentId === 0) {
		const child = await hasChild(row.id);
		if (child) {
			ElMessage({
				message: "存在子权限，不能删除！",
				duration: DELAY_TIME,
				type: "warning",
			});

			return;
		}
	} else {
		if (assignedIds.value.includes(row.id) === true) {
			ElMessage({
				message: "已分配给角色，不能删除！",
				duration: DELAY_TIME,
				type: "warning",
			});

			return;
		}
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

const handleSelectionChange = (val: Permission[]): void => {
	multipleSelection.value = val;
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
			<el-button type="primary" v-perm="'permission:add'" @click="addRef?.open()">
				<svg-icon icon="ep-plus" class="mr-1" />
				{{ ButtonText.Add }}
			</el-button>
			<el-button
				type="danger"
				v-perm="'permission:delete'"
				@click="handleBatchDelete"
				:disabled="multipleSelection.length === 0"
			>
				<svg-icon icon="ep-delete" class="mr-1" />
				{{ ButtonText.BatchDelete }}
			</el-button>
		</div>

		<el-table
			:data="data"
			row-key="id"
			stripe
			border
			style="width: 100%"
			:tree-props="{ children: 'children' }"
			@selection-change="handleSelectionChange"
		>
			<template #empty>{{ NO_DATA }}</template>
			<el-table-column type="selection" min-width="60" align="center" :selectable="handleSelectable" />
			<el-table-column prop="id" label="序号" min-width="60" align="center" sortable />
			<el-table-column prop="name" label="名称" min-width="150" align="center" />
			<el-table-column prop="title" label="标题" min-width="150" align="center" />
			<el-table-column prop="status" label="状态" min-width="100" align="center">
				<template #default="{ row }">
					<el-switch
						v-model="(row as Permission).status"
						:active-text="StatusMap.Enabled"
						:active-value="StatusMap.Enabled"
						:inactive-text="StatusMap.Disabled"
						:inactive-value="StatusMap.Disabled"
						inline-prompt
						style="--el-switch-on-color: #67c23a; --el-switch-off-color: #f56c6c"
						@change="(val: any) => switchStatus(row as Permission, val as Status)"
					/>
				</template>
			</el-table-column>
			<el-table-column prop="createdAt" label="创建时间" min-width="200" align="center" />
			<el-table-column prop="updatedAt" label="更新时间" min-width="200" align="center" />
			<el-table-column label="操作" min-width="200" align="center" fixed="right">
				<template #default="{ row }">
					<el-button type="primary" v-perm="'permission:edit'" @click="editRef?.open(row as Permission)">
						<svg-icon icon="ep-edit" class="mr-1" />
						{{ ButtonText.Edit }}
					</el-button>
					<el-button type="danger" v-perm="'permission:delete'" @click="handleDestroy(row as Permission)">
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

<style scoped>
:deep(.el-table__indent) {
	padding-left: 0 !important;
}

:deep(.el-table__placeholder) {
	display: none;
}
</style>
