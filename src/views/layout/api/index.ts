import { SERVER_ERROR } from "@/constants";
import { HttpCode } from "@/enums";
import { userTable } from "@/models";
import { createResult } from "@/utils";

const changePassword = async (id: number, password: string): Promise<Result> => {
	const result = createResult();

	try {
		await userTable.update(id, { password });

		result.code = HttpCode.NoContent;
		result.message = "密码已修改，请重新登录！";
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

export { changePassword };
