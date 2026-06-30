import Dexie, { type EntityTable } from "dexie";

import { DB_NAME, DEFAULT_PASSWORD, USER_AVATAR } from "@/constants";
import { RouterKey, RouterPath, StatusMap } from "@/enums";
import { currentTime } from "@/utils";

const db = new Dexie(DB_NAME) as Dexie & {
	users: EntityTable<User, "id">;
	roles: EntityTable<Role, "id">;
	menus: EntityTable<Menu, "id">;
	permissions: EntityTable<Permission, "id">;
	departments: EntityTable<Department, "id">;
};

db.version(1).stores({
	users: "++id, status, &username, &email, &phone, department, roles, [username+password]",
	menus: "++id, status, &key, &path, parentId",
	roles: "++id, status, &name, &title, permissions, menus",
	permissions: "++id, status, &name, &title, parentId",
	departments: "++id, status, &name, &title",
});

const userTable = db.users;
const roleTable = db.roles;
const menuTable = db.menus;
const permissionTable = db.permissions;
const departmentTable = db.departments;
const status = StatusMap.Enabled;
const date = currentTime();

const initDB = async (): Promise<void> => {
	if (!(await Dexie.exists(DB_NAME))) {
		try {
			await db.transaction("rw", ["users", "roles", "menus", "permissions", "departments"], async () => {
				await initUser();
				await initRole();
				await initMenu();
				await initPermission();
				await initDepartment();
			});
		} catch (error) {
			window.indexedDB.deleteDatabase(DB_NAME);
			console.error("初始化数据库失败：", error);
		}
	} else {
		console.info("数据库已存在！");
	}
};

const initUser = async (): Promise<void> => {
	await userTable.bulkAdd([
		{
			realname: "梅西",
			username: "admin",
			password: DEFAULT_PASSWORD,
			avatar: USER_AVATAR,
			phone: "13800000000",
			email: "admin@qmail.com",
			department: 1,
			roles: [1],
			createdAt: date,
			status,
		},
		{
			realname: "测试",
			username: "test",
			password: DEFAULT_PASSWORD,
			avatar: USER_AVATAR,
			phone: "13800000001",
			email: "test@qmail.com",
			department: 1,
			roles: [2],
			createdAt: date,
			status,
		},
	]);
};

const initRole = async (): Promise<void> => {
	await roleTable.bulkAdd([
		{
			name: "administrator",
			title: "超级管理员",
			menus: [],
			permissions: [],
			createdAt: date,
			status,
		},
		{
			name: "tester",
			title: "测试员",
			menus: [1, 2, 3, 4, 5, 6, 7],
			permissions: [2, 3, 4],
			createdAt: date,
			status,
		},
	]);
};

const initMenu = async (): Promise<void> => {
	await menuTable.bulkAdd([
		{
			parentId: 0,
			key: RouterKey.Home,
			path: RouterPath[RouterKey.Home],
			icon: "flag:fr-1x1",
			createdAt: date,
			status,
		},
		{
			parentId: 0,
			key: RouterKey.System,
			path: RouterPath[RouterKey.System],
			icon: "flag:ar-1x1",
			createdAt: date,
			status,
		},
		{
			parentId: 2,
			key: RouterKey.Department,
			path: RouterPath[RouterKey.Department],
			icon: "",
			createdAt: date,
			status,
		},
		{
			parentId: 2,
			key: RouterKey.User,
			path: RouterPath[RouterKey.User],
			icon: "",
			createdAt: date,
			status,
		},
		{
			parentId: 2,
			key: RouterKey.Role,
			path: RouterPath[RouterKey.Role],
			icon: "",
			createdAt: date,
			status,
		},
		{
			parentId: 2,
			key: RouterKey.Menu,
			path: RouterPath[RouterKey.Menu],
			icon: "",
			createdAt: date,
			status,
		},
		{
			parentId: 2,
			key: RouterKey.Permission,
			path: RouterPath[RouterKey.Permission],
			icon: "",
			createdAt: date,
			status,
		},
		{
			parentId: 0,
			key: RouterKey.Purchase,
			path: RouterPath[RouterKey.Purchase],
			icon: "flag:br-1x1",
			createdAt: date,
			status,
		},
		{
			parentId: 8,
			key: RouterKey.Supplier,
			path: RouterPath[RouterKey.Supplier],
			icon: "",
			createdAt: date,
			status,
		},
	]);
};

const initPermission = async (): Promise<void> => {
	await permissionTable.bulkAdd([
		{
			parentId: 0,
			name: "permission",
			title: "权限管理",
			createdAt: date,
			status,
		},
		{
			parentId: 1,
			name: "permission:add",
			title: "新增权限",
			createdAt: date,
			status,
		},
		{
			parentId: 1,
			name: "permission:edit",
			title: "编辑权限",
			createdAt: date,
			status,
		},
		{
			parentId: 1,
			name: "permission:delete",
			title: "删除权限",
			createdAt: date,
			status,
		},
	]);
};

const initDepartment = async (): Promise<void> => {
	await departmentTable.add({
		name: "technology",
		title: "技术部",
		createdAt: date,
		status,
	});
};

export { initDB, userTable, roleTable, menuTable, permissionTable, departmentTable };
