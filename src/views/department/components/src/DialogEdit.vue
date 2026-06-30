<script setup lang="ts">
import { update } from "../../api";
import { DELAY_TIME } from "@/constants";
import { ButtonText, HttpCode, StatusMap } from "@/enums";
import { currentTime } from "@/utils";

type DepartmentForm = {
	id: number;
	name: string;
	title: string;
	status: Status;
	updatedAt: string;
};

defineOptions({
	name: "DialogEdit",
});

const props = defineProps<{
	data: Department[];
}>();

const visible = ref<boolean>(false);
const editingId = ref<number>(0);

const formRef = useTemplateRef<FormInstance>("formRef");

const formModel = reactive<DepartmentForm>({
	id: 0,
	name: "",
	title: "",
	status: StatusMap.Enabled,
	updatedAt: currentTime(),
});
const formRules = reactive<FormRules<DepartmentForm>>({
	name: [{ required: true, message: "请输入名称", trigger: "blur" }],
	title: [{ required: true, message: "请输入标题", trigger: "blur" }],
});

const handleCancel = (): void => {
	visible.value = false;
	formRef.value?.resetFields();
};

const handleConfirm = async (form: Nullable<FormInstance>): Promise<void> => {
	if (form === null) {
		return;
	}

	await form.validate(async (valid) => {
		if (valid === false) {
			return;
		}

		const { code, message } = await update(formModel);

		ElMessage({
			type: code === HttpCode.NoContent ? "success" : "error",
			message,
			duration: DELAY_TIME,
		});

		handleCancel();
	});
};

const open = (row: Department): void => {
	visible.value = true;
	editingId.value = row.id;
	formModel.id = row.id;
	formModel.name = row.name;
	formModel.title = row.title;
	formModel.status = row.status;
};

defineExpose({
	open,
});
</script>

<template>
	<el-dialog v-model="visible" title="编辑" width="500px" @close="handleCancel">
		<el-form ref="formRef" :model="formModel" :rules="formRules" label-width="80px">
			<el-form-item label="名称" prop="name">
				<el-input v-model="formModel.name" placeholder="请输入名称" clearable />
			</el-form-item>
			<el-form-item label="标题" prop="title">
				<el-input v-model="formModel.title" placeholder="请输入标题" clearable />
			</el-form-item>
			<el-form-item label="状态" prop="status">
				<el-switch
					v-model="formModel.status"
					:active-text="StatusMap.Enabled"
					:active-value="StatusMap.Enabled"
					:inactive-text="StatusMap.Disabled"
					:inactive-value="StatusMap.Disabled"
					inline-prompt
					style="--el-switch-on-color: #67c23a; --el-switch-off-color: #f56c6c"
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="handleCancel">
				{{ ButtonText.Cancel }}
			</el-button>
			<el-button type="primary" @click="handleConfirm(formRef)">
				{{ ButtonText.Confirm }}
			</el-button>
		</template>
	</el-dialog>
</template>
