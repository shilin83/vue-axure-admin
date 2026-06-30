import { flatMap, intersectionWith, uniq } from "es-toolkit/array";

import { SERVER_ERROR } from "@/constants";
import { HttpCode, StatusMap } from "@/enums";
import { userTable, roleTable, menuTable, permissionTable } from "@/models";
import { createResult } from "@/utils";

// * 后台登录
const login = async (username: string, password: string, remember: boolean): Promise<Result<Auth>> => {
	const result = createResult<Auth>();

	try {
		const user = await userTable.get({ username, password });
		if (user === undefined) {
			result.code = HttpCode.Unauthorized;
			result.message = "用户名或密码错误！";
		} else if (user.status === StatusMap.Disabled) {
			result.code = HttpCode.Unauthorized;
			result.message = "用户已被禁用！";
		} else {
			const roles = await roleTable
				.where("id")
				.anyOf(user.roles)
				.and((role) => role.status === StatusMap.Enabled)
				.toArray();
			const menus = await menuTable.where("status").equals(StatusMap.Enabled).toArray();
			const permissions = await permissionTable.where("status").equals(StatusMap.Enabled).toArray();
			const isAdmin = user.roles.includes(1);

			result.data = {
				remember,
				user,
				roles,
				menus: isAdmin
					? menus
					: intersectionWith(menus, uniq(flatMap(roles, (role) => role.menus)), (obj, id) => obj.id === id),
				permissions: isAdmin
					? permissions
					: intersectionWith(permissions, uniq(flatMap(roles, (role) => role.permissions)), (obj, id) => obj.id === id),
			};
			result.message = "登录成功！页面自动跳转...";
		}
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

export { login };
