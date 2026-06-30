<script setup lang="ts">
import { useTimeoutFn } from "@vueuse/core";

import { changePassword } from "../../api";
import { AUTH_KEY, DELAY_TIME } from "@/constants";
import { ButtonText, HttpCode, RouterKey } from "@/enums";
import { redirectTo } from "@/utils";

type Props = {
	newPassword: string;
	confirmPassword: string;
};

defineOptions({
	name: "ChangePassword",
});

const props = defineProps<{
	id: number;
}>();

const visible = defineModel<boolean>();

const validatePassword = (rule: any, value: string, callback: (error?: Error) => void): void => {
	if (value.length < 6 || value.length > 20) {
		callback(new Error("密码长度需为 6-20 个字符"));

		return;
	}

	if (rule.field === "confirmPassword" && value !== formModel.newPassword) {
		callback(new Error("两次输入密码不一致"));

		return;
	}

	callback();
};

const loading = ref<boolean>(false);

const formRef = useTemplateRef<FormInstance>("formRef");

const formModel = reactive<Props>({
	newPassword: "",
	confirmPassword: "",
});
const formRules = reactive<FormRules<Props>>({
	newPassword: [
		{ required: true, message: "请输入新密码", trigger: ["blur", "change"] },
		{ validator: validatePassword, trigger: ["blur", "change"] },
	],
	confirmPassword: [
		{ required: true, message: "请确认新密码", trigger: ["blur", "change"] },
		{ validator: validatePassword, trigger: ["blur", "change"] },
	],
});

const closeDialog = (): void => {
	visible.value = false;
	loading.value = false;
	formRef.value?.resetFields();
};

const handleChange = async (form: Nullable<FormInstance>): Promise<void> => {
	if (form === null) {
		return;
	}

	await form.validate(async (valid) => {
		if (valid === false) {
			return;
		}

		try {
			loading.value = true;

			const { code, message } = await changePassword(props.id, formModel.newPassword);
			if (code === HttpCode.NoContent) {
				ElNotification.success({
					message,
					duration: DELAY_TIME,
				});

				useTimeoutFn(() => {
					localStorage.removeItem(AUTH_KEY);
					redirectTo(RouterKey.Login);
				}, DELAY_TIME);
			} else {
				ElNotification.error({
					message,
					duration: DELAY_TIME,
				});
			}
		} catch (error) {
			console.error(error);
		} finally {
			closeDialog();
		}
	});
};
</script>

<template>
	<el-dialog v-model="visible" title="修改密码" width="400px" @closed="closeDialog" align-center>
		<el-form ref="formRef" :model="formModel" :rules="formRules">
			<el-form-item prop="newPassword" label="新密码" label-width="100px">
				<el-input type="password" v-model.trim="formModel.newPassword" autocomplete="off" show-password clearable />
			</el-form-item>
			<el-form-item prop="confirmPassword" label="确认新密码" label-width="100px">
				<el-input type="password" v-model.trim="formModel.confirmPassword" autocomplete="off" show-password clearable />
			</el-form-item>
			<el-form-item>
				<div class="flex-center-x w-full justify-end gap-1">
					<el-button type="default" @click="closeDialog">
						{{ ButtonText.Cancel }}
					</el-button>
					<el-button type="primary" :loading="loading" @click="handleChange(formRef)">
						{{ ButtonText.Confirm }}
					</el-button>
				</div>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
