import type { Directive, DirectiveBinding } from "vue";

import { DELAY_TIME } from "@/constants";
import { getAuth } from "@/utils";

// * 自定义指令，权限校验
const hasPermission = (name: string): boolean => {
	const auth = getAuth();
	if (auth === null) {
		return false;
	}

	if (auth.user.roles.includes(1)) {
		return true;
	}

	return auth.permissions.some((permission) => permission.name === name);
};

const handlerMap = new WeakMap<HTMLElement, (e: Event) => void>();

const mounted = (el: HTMLElement, binding: DirectiveBinding<string>): void => {
	const handler = (e: Event): void => {
		if (hasPermission(binding.value)) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		ElMessage.warning({
			message: "权限不足，请联系管理员！",
			duration: DELAY_TIME,
		});
	};

	handlerMap.set(el, handler);
	el.addEventListener("click", handler, true);
};

const unmounted = (el: HTMLElement): void => {
	const handler = handlerMap.get(el);

	if (handler) {
		el.removeEventListener("click", handler, true);
	}
};

const vPerm: Directive = {
	mounted,
	unmounted,
};

export default vPerm;
