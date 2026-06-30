const StatusMap = {
	Enabled: "启用",
	Disabled: "禁用",
} as const;

const ActionMessage = {
	Create: "创建成功！",
	Update: "更新成功！",
	Destroy: "删除成功！",
	BatchDelete: "批量删除完成！",
} as const;

const HttpCode = {
	OK: 200,
	Created: 201,
	NoContent: 204,
	BadRequest: 400,
	Unauthorized: 401,
	Forbidden: 403,
	NotFound: 404,
	InternalServerError: 500,
} as const;

const ButtonText = {
	Add: "新增",
	Edit: "编辑",
	Destroy: "删除",
	BatchDelete: "批量删除",
	Confirm: "确认",
	Cancel: "取消",
	Search: "查询",
	Reset: "重置",
} as const;

const RouterKey = {
	Login: "Login",
	Home: "Home",
	System: "System",
	Department: "Department",
	User: "User",
	Role: "Role",
	Menu: "Menu",
	Permission: "Permission",
	Purchase: "Purchase",
	Supplier: "Supplier",
} as const;

const RouterPath = {
	[RouterKey.Login]: "登录",
	[RouterKey.Home]: "首页",
	[RouterKey.System]: "系统",
	[RouterKey.Department]: "部门管理",
	[RouterKey.User]: "用户管理",
	[RouterKey.Role]: "角色管理",
	[RouterKey.Menu]: "菜单管理",
	[RouterKey.Permission]: "权限管理",
	[RouterKey.Purchase]: "采购",
	[RouterKey.Supplier]: "供应商管理",
} as const;

export { StatusMap, ButtonText, RouterKey, RouterPath, HttpCode, ActionMessage };
