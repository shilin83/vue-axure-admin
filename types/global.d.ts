import type { StatusMap, RouterKey, RouterPath, HttpCode } from "@/enums";

declare global {
	type RouteKey = keyof typeof RouterKey;

	type RoutePath = (typeof RouterPath)[RouteKey];

	type Status = (typeof StatusMap)[keyof typeof StatusMap];

	type Nullable<T> = T | null;

	type ComponentRef<T> = InstanceType<T>;

	type Recordable<T = unknown, K extends string | number | symbol = string> = [K] extends [null | undefined]
		? Record<string, T>
		: Record<K, T>;

	type Result<T = unknown> = {
		code: (typeof HttpCode)[keyof typeof HttpCode];
		message: string;
		data: T | null;
	};

	interface BaseModel {
		id: number;
		status: Status;
		createdAt?: string;
		updatedAt?: string;
	}

	interface User extends BaseModel {
		realname: string;
		username: string;
		password: string;
		avatar: string;
		phone: string;
		email: string;
		department: number;
		roles: number[];
	}

	interface Menu extends BaseModel {
		parentId: number;
		key: RouteKey;
		path: RoutePath;
		icon: string;
		children?: Omit<Menu, "children">[];
	}

	interface Role extends BaseModel {
		name: string;
		title: string;
		menus: number[];
		permissions: number[];
	}

	interface Permission extends BaseModel {
		parentId: number;
		name: string;
		title: string;
		children?: Omit<Permission, "children">[];
	}

	interface Department extends BaseModel {
		name: string;
		title: string;
	}

	interface Auth {
		remember: boolean;
		user: User;
		roles: Role[];
		menus: Menu[];
		permissions: Permission[];
	}
}

export {};
