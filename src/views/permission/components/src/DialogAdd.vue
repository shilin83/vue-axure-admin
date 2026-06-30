<script setup lang="ts">
import { create } from "../../api";
import { DELAY_TIME } from "@/constants";
import { ButtonText, HttpCode, StatusMap } from "@/enums";
import { currentTime } from "@/utils";

type PermissionForm = {
	parentId: number;
	name: string;
	title: string;
	status: Status;
	createdAt: string;
};

defineOptions({
	name: "DialogAdd",
});

const props = defineProps<{
	data: Permission[];
}>();

const visible = ref<boolean>(false);

const permissions = computed(() => props.data.filter((item) => item.status === StatusMap.Enabled));

const formRef = useTemplateRef<FormInstance>("formRef");

const formModel = reactive<PermissionForm>({
	parentId: 0,
	name: "",
	title: "",
	status: StatusMap.Enabled,
	createdAt: currentTime(),
});
const formRules = reactive<FormRules<PermissionForm>>({
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

		const { code, message } = await create(formModel);

		ElMessage({
			type: code === HttpCode.Created ? "success" : "error",
			message,
			duration: DELAY_TIME,
		});

		handleCancel();
	});
};

const open = (): void => {
	visible.value = true;
};

defineExpose({
	open,
});
</script>
<template>
	<el-dialog v-model="visible" title="新增" width="500px" @close="handleCancel" align-center>
		<el-form ref="formRef" :model="formModel" :rules="formRules" label-width="80px">
			<el-form-item label="父级" prop="parentId">
				<el-select v-model="formModel.parentId" placeholder="请选择父级权限" class="w-full">
					<el-option :value="0" label="无" />
					<el-option
						v-for="permission in permissions"
						:key="permission.id"
						:label="`${permission.title}（${permission.name}）`"
						:value="permission.id"
					/>
				</el-select>
			</el-form-item>
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
