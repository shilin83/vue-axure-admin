<script setup lang="ts">
import "virtual:uno.css";

import { useTimeoutFn } from "@vueuse/core";

import { login } from "./api";
import { type CaptchaRef, VerifyCode, InterAnim } from "./components";
import { AUTH_KEY, DEFAULT_PASSWORD, DELAY_TIME } from "@/constants";
import { HttpCode, RouterKey } from "@/enums";
import { initDB } from "@/models";
import { getAuth, redirectTo } from "@/utils";

type LoginForm = {
	username: string;
	password: string;
	captcha: string;
	remember: boolean;
};

defineOptions({
	name: RouterKey.Login,
});

const isTyping = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const loading = ref<boolean>(false);
const captchaCode = ref<string>("");

const captchaRef = useTemplateRef<CaptchaRef>("captchaRef");
const formRef = useTemplateRef<FormInstance>("formRef");

const formModel = reactive<LoginForm>({
	username: "",
	password: "",
	captcha: "",
	remember: false,
});
const formRules = reactive<FormRules<LoginForm>>({
	username: [{ required: true, message: "请输入用户名", trigger: ["blur", "change"] }],
	password: [{ required: true, message: "请输入密码", trigger: ["blur", "change"] }],
	captcha: [{ required: true, message: "请输入验证码", trigger: ["blur", "change"] }],
});

const handleSubmit = async (form: Nullable<FormInstance>): Promise<void> => {
	if (form === null) {
		return;
	}

	await form.validate(async (valid) => {
		if (valid === false) {
			return;
		}

		try {
			loading.value = true;

			const { username, password, captcha, remember } = formModel;

			if (captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
				ElMessage.error({
					message: "验证码错误！",
					duration: DELAY_TIME,
				});
			} else {
				const { code, message, data } = await login(username, password, remember);
				if (code !== HttpCode.OK) {
					ElMessage.error({
						message,
						duration: DELAY_TIME,
					});
				} else {
					ElMessage.success({
						message,
						duration: DELAY_TIME,
					});

					useTimeoutFn(() => {
						localStorage.setItem(AUTH_KEY, JSON.stringify(data));
						redirectTo(RouterKey.Home);
					}, DELAY_TIME);
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			useTimeoutFn(() => {
				loading.value = false;
				captchaRef.value?.refresh();
			}, DELAY_TIME);
		}
	});
};

onBeforeMount(() => {
	const auth = getAuth();
	if (auth === null) {
		initDB();
	} else if (auth.remember) {
		redirectTo(RouterKey.Home);
	}
});
</script>

<template>
	<div class="full-screen grid overflow-hidden bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 lg:grid-cols-2">
		<div class="flex-center hidden lg:flex">
			<inter-anim :is-typing="isTyping" :show-password="showPassword" :password-length="formModel.password.length" />
		</div>

		<div class="flex-center lg:bg-white">
			<div class="min-w-100 space-y-5 rounded bg-white p-5">
				<div class="i-logos:google-workspace mx-auto text-4xl" />
				<el-form ref="formRef" :model="formModel" :rules="formRules" size="large">
					<el-form-item prop="username">
						<el-input
							v-model.trim="formModel.username"
							autocomplete="off"
							placeholder="admin / test"
							@focus="isTyping = true"
							@blur="isTyping = false"
							clearable
						/>
					</el-form-item>
					<el-form-item prop="password">
						<el-input
							v-model.trim="formModel.password"
							autocomplete="off"
							:placeholder="`${DEFAULT_PASSWORD}`"
							:type="showPassword ? 'text' : 'password'"
							@focus="isTyping = true"
							@blur="isTyping = false"
							clearable
						>
							<template #suffix>
								<div
									v-if="formModel.password.length > 0"
									class="cursor-pointer pl-1"
									@click="showPassword = !showPassword"
									@mousedown.prevent
								>
									<div v-if="showPassword" class="i-ep:hide" />
									<div v-else class="i-ep:view" />
								</div>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item prop="captcha">
						<div class="flex-center-x w-full gap-2.5">
							<el-input
								autocomplete="off"
								placeholder="验证码"
								v-model.trim="formModel.captcha"
								@focus="isTyping = true"
								@blur="isTyping = false"
								clearable
							/>
							<verify-code ref="captchaRef" @handle-change="captchaCode = $event" />
						</div>
					</el-form-item>
					<el-form-item prop="remember">
						<div class="flex-center-x w-full justify-between">
							<el-checkbox v-model="formModel.remember">自动登录</el-checkbox>
							<el-tooltip content="请联系管理员" placement="top">
								<el-link type="primary" underline="never">忘记密码</el-link>
							</el-tooltip>
						</div>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" class="w-full" :loading="loading" @click="handleSubmit(formRef)">
							登录
						</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
	</div>
</template>
