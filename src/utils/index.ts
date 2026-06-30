import dayjs from "dayjs";

import { AUTH_KEY } from "@/constants";
import { HttpCode, RouterPath } from "@/enums";

// * 授权认证
const getAuth = (): Nullable<Auth> => {
	const auth = JSON.parse(localStorage.getItem(AUTH_KEY) ?? "{}") as Auth;

	if (Object.keys(auth).length === 0) {
		return null;
	}

	return auth;
};

// * 获取当前时间
const currentTime = (format = "YYYY-MM-DD HH:mm:ss"): string => {
	return dayjs().format(format);
};

// * 创建根元素
const createRoot = (): HTMLElement => {
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);

	return app;
};

// * 页面跳转
const redirectTo = (key: string): void => {
	if (import.meta.env.DEV) {
		window.location.href = `/${key.toLowerCase()}/`;
	} else {
		const dom = document.querySelector('[data-label="page"] input') as HTMLInputElement;
		if (dom && dom instanceof HTMLInputElement) {
			try {
				dom.value = RouterPath[key as RouteKey];
				dom.dispatchEvent(new Event("input", { bubbles: true }));
				dom.dispatchEvent(new Event("change", { bubbles: true }));
			} catch (error) {
				console.error("事件异常：", error);
			}
		} else {
			console.error("DOM 不存在！");
		}
	}
};

// * 响应数据
const createResult = <T = unknown>(data?: T): Result<T> => {
	return {
		code: HttpCode.OK,
		message: "",
		data: data ?? null,
	};
};

export { getAuth, currentTime, redirectTo, createRoot, createResult };
