import { SERVER_ERROR } from "@/constants";
import { ActionMessage, HttpCode } from "@/enums";
import { departmentTable, userTable } from "@/models";
import { createResult, currentTime } from "@/utils";

// * 检查字段是否存在
const isFieldExist = async (field: "name" | "title", value: string): Promise<boolean> => {
	return (await departmentTable.where(field).equals(value).count()) > 0;
};

// * 获取已分配的部门ID
const getAssignedIds = async (): Promise<number[]> => {
	return userTable.orderBy("department").uniqueKeys() as Promise<number[]>;
};

// * 获取数据列表
const getDataList = async (): Promise<Result<Department[]>> => {
	const result = createResult<Department[]>();

	try {
		result.data = await departmentTable.toArray();
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

// * 创建
const create = async (data: Omit<Department, "id">): Promise<Result> => {
	const result = createResult();

	try {
		if (await isFieldExist("name", data.name)) {
			result.code = HttpCode.BadRequest;
			result.message = "名称已存在！";
		} else if (await isFieldExist("title", data.title)) {
			result.code = HttpCode.BadRequest;
			result.message = "标题已存在！";
		} else {
			const lastId = (await departmentTable.orderBy("id").lastKey()) as number;
			if (lastId) {
				await departmentTable.upsert(lastId + 1, data);

				result.code = HttpCode.Created;
				result.message = ActionMessage.Create;
			}
		}
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

// * 更新
const update = async (data: Department): Promise<Result> => {
	const result = createResult();

	try {
		const existing = await departmentTable.get(data.id);
		if ((await isFieldExist("name", data.name)) && existing?.name !== data.name) {
			result.code = HttpCode.BadRequest;
			result.message = "名称已存在！";
		} else if ((await isFieldExist("title", data.title)) && existing?.title !== data.title) {
			result.code = HttpCode.BadRequest;
			result.message = "标题已存在！";
		} else {
			const { id, ...changes } = data;
			await departmentTable.update(id, changes);

			result.code = HttpCode.NoContent;
			result.message = ActionMessage.Update;
		}
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

// * 删除
const destroy = async (id: number): Promise<Result> => {
	const result = createResult();

	try {
		await departmentTable.delete(id);

		result.code = HttpCode.NoContent;
		result.message = ActionMessage.Destroy;
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

// * 批量删除
const batchDelete = async (ids: number[]): Promise<Result> => {
	const result = createResult();

	try {
		await departmentTable.bulkDelete(ids);

		result.code = HttpCode.NoContent;
		result.message = ActionMessage.BatchDelete;
	} catch (error) {
		console.error(error);

		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;
	}

	return result;
};

// * 切换状态
const switchStatus = async (id: number, status: Status): Promise<Result> => {
	const result = createResult();

	try {
		await departmentTable.update(id, {
			status,
			updatedAt: currentTime(),
		});

		result.code = HttpCode.NoContent;
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

export { getAssignedIds, getDataList, create, update, destroy, switchStatus, batchDelete };
