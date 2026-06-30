import { flatMap } from "es-toolkit/array";

import { SERVER_ERROR } from "@/constants";
import { ActionMessage, HttpCode, StatusMap } from "@/enums";
import { permissionTable, roleTable } from "@/models";
import { createResult, currentTime } from "@/utils";

const hasChild = async (id: number): Promise<boolean> => {
	return (await permissionTable.where("parentId").equals(id).count()) > 0;
};

// * 检查字段是否存在
const isFieldExist = async (field: "name" | "title", value: string): Promise<boolean> => {
	return (await permissionTable.where(field).equals(value).count()) > 0;
};

// * 获取已分配的权限ID
const getAssignedIds = async (): Promise<number[]> => {
	return roleTable.orderBy("permissions").uniqueKeys() as Promise<number[]>;
};

// * 获取数据列表
const getDataList = async (): Promise<Result<Permission[]>> => {
	const result = createResult<Permission[]>();

	try {
		result.data = await permissionTable.toArray();
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

// * 创建
const create = async (data: Omit<Permission, "id">): Promise<Result> => {
	const result = createResult();

	try {
		if (await isFieldExist("name", data.name)) {
			result.code = HttpCode.BadRequest;
			result.message = "名称已存在！";
		} else if (await isFieldExist("title", data.title)) {
			result.code = HttpCode.BadRequest;
			result.message = "标题已存在！";
		} else {
			const lastId = (await permissionTable.orderBy("id").lastKey()) as number;
			if (lastId) {
				await permissionTable.upsert(lastId + 1, data);

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
const update = async (data: Permission): Promise<Result> => {
	const result = createResult();

	try {
		const existing = await permissionTable.get(data.id);
		if ((await isFieldExist("name", data.name)) && existing?.name !== data.name) {
			result.code = HttpCode.BadRequest;
			result.message = "名称已存在！";
		} else if ((await isFieldExist("title", data.title)) && existing?.title !== data.title) {
			result.code = HttpCode.BadRequest;
			result.message = "标题已存在！";
		} else {
			const { id, ...changes } = data;
			await permissionTable.update(id, changes);

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
		await permissionTable.delete(id);

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
		await permissionTable.bulkDelete(ids);

		result.code = HttpCode.NoContent;
		result.message = ActionMessage.BatchDelete;
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

/**
 * 切换权限状态
 * 顶级节点（parentId === 0）：级联更新其直接子节点，保持父子状态一致
 * 非顶级节点：更新自身后检查兄弟节点状态 ——
 * 若当前启用则强制父级启用（父级至少有一个子权限可用时不应为禁用）；
 * 若当前禁用且所有兄弟均已禁用，则父级也应同步为禁用
 */
const switchStatus = async (row: Permission, status: Status): Promise<Result> => {
	const result = createResult();

	try {
		if (row.parentId === 0 && row.children !== undefined) {
			const allIds = [...flatMap(row.children, (child) => child.id), row.id];

			await permissionTable.bulkUpdate(
				allIds.map((id) => ({
					key: id,
					changes: { status, updatedAt: currentTime() },
				})),
			);
		} else {
			await permissionTable.update(row.id, {
				status,
				updatedAt: currentTime(),
			});

			const totalSiblings = await permissionTable.where("parentId").equals(row.parentId).count();
			const matchedSiblings = await permissionTable
				.where("parentId")
				.equals(row.parentId)
				.and((item) => item.status === status)
				.count();

			if (status === StatusMap.Enabled) {
				await permissionTable.update(row.parentId, {
					status,
					updatedAt: currentTime(),
				});
			} else if (totalSiblings === matchedSiblings) {
				await permissionTable.update(row.parentId, {
					status,
					updatedAt: currentTime(),
				});
			}
		}
	} catch (error) {
		result.code = HttpCode.InternalServerError;
		result.message = SERVER_ERROR;

		console.error(error);
	}

	return result;
};

export { hasChild, getAssignedIds, getDataList, create, update, destroy, batchDelete, switchStatus };
