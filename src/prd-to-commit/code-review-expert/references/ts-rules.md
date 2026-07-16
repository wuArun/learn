# TypeScript 规范检查项

## 基本规范

### 1. 类型定义

- 所有函数参数、返回值必须有类型定义
- 优先使用接口（interface）而不是类型别名（type）来定义对象类型
- 使用泛型而不是 any

```typescript
// 正例
interface User {
  id: number;
  name: string;
}

function getUser(id: number): User {
  return { id, name: "test" };
}

// 反例
function getUser(id: number) {
  return { id, name: "test" };
}
```

### 2. 类型推断

- 变量声明时，如果赋值了初始值，可以省略类型标注（让类型推断生效）
- 函数参数必须标注类型

```typescript
// 正例
const count = 0; // number
const name = "tom"; // string
function add(a: number, b: number): number {}

// 反例
const count: number = 0;
const name: string = "tom";
function add(a, b) {}
```

### 3. 接口 vs 类型别名

- 使用 interface 定义对象类型，可以被 implements 和 extends
- 使用 type 定义联合类型、元组、函数类型

```typescript
// 正例 - 对象类型用 interface
interface User {
  id: number;
  name: string;
}

class UserModel implements User {
  id: number;
  name: string;
}

// 正例 - 联合类型用 type
type Status = "pending" | "success" | "error";
type Pair<T> = [T, T];
type Callback = () => void;
```

### 4. 泛型规范

- 优先使用泛型而不是 any
- 为泛型提供约束

```typescript
// 正例
function identity<T>(arg: T): T {
  return arg;
}

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length > b.length ? a : b;
}

// 反例
function identity(arg: any): any {
  return arg;
}
```

### 5. null 和 undefined

- 使用 optional chaining（?.）和 nullish coalescing（??）
- 明确区分 null 和 undefined

```typescript
// 正例
const name = user?.profile?.name ?? "Unknown";
const value = data ?? defaultValue;

// 反例
const name = (user && user.profile && user.profile.name) || "Unknown";
```

### 6. 枚举规范

- 优先使用 const enum 或对象 + as const
- 避免使用数字枚举

```typescript
// 正例 - const enum
const enum Status {
  Pending = "pending",
  Success = "success",
  Error = "error",
}

// 正例 - 对象 + as const
const Status = {
  Pending: "pending",
  Success: "success",
  Error: "error",
} as const;

// 反例 - 数字枚举
enum Status {
  Pending,
  Success,
  Error,
}
```

### 7. 类型断言

- 优先使用类型守卫而不是类型断言
- 必须使用 as 语法而不是尖括号语法

```typescript
// 正例
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(value)) {
  console.log(value.toUpperCase());
}

// 正例 - 必须使用 as
const name = value as string;

// 反例
const name = <string>value;
```

### 8. any 禁止使用

- 禁止使用 any，会丢失类型安全
- 使用 unknown 代替 any，然后在使用时进行类型守卫

```typescript
// 反例
function process(value: any): any {
  return value;
}

// 正例
function process(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return "";
}
```

### 9. strict 模式

- 开启 strict 模式的所有检查
- 禁止使用 any

## 命名规范

### 1. 变量和函数

使用小驼峰命名（lowerCamelCase）

```typescript
const userName = "tom";
function getUserInfo() {}
```

### 2. 接口和类型

使用大驼峰命名（PascalCase）

```typescript
interface UserInfo {}
type ResponseData = {};
```

### 3. 常量

使用全大写 + 下划线

```typescript
const MAX_COUNT = 100;
const API_BASE_URL = "https://api.example.com";
```

### 4. 文件命名

- 组件文件：PascalCase（如：UserInfo.tsx）
- 工具文件：kebab-case（如：format-date.ts）
- 类型文件：kebab-case（如：types.ts）

### 5. 泛型命名

- 使用有意义的泛型名称
- T、K、V 用于通用类型

```typescript
// 正例
interface Repository<T> {}
type KeyValuePair<K, V> = { key: K; value: V };

// 反例
interface Repository<A> {}
```

## 类型安全

### 1. 可选属性

只在必要时使用可选属性（?）

```typescript
// 正例
interface User {
  id: number;
  name: string;
  email?: string; // 只有真正可空的字段才用可选
}

// 反例 - 避免所有字段都是可选的
interface Config {
  host?: string;
  port?: number;
  timeout?: number;
}
```

### 2. 只读属性

不会修改的属性使用 readonly

```typescript
interface User {
  readonly id: number;
  readonly createdAt: Date;
  name: string;
}
```

### 3. 返回类型

- 优先使用返回类型注解
- async 函数必须标注返回类型

```typescript
// 正例
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

// 正例
function getConfig(): Readonly<Config> {
  return { ... };
}
```

### 4. 函数重载

使用函数重载时，将最具体的签名放在前面

```typescript
// 正例
function parse(value: string): number;
function parse(value: string, radix: number): number;
function parse(value: string, radix?: number): number {
  return parseInt(value, radix);
}
```

## 导入导出

### 1. 导入排序

```typescript
// 1. 外部库
import React from "react";
import { useState } from "react";

// 2. 内部模块
import { UserService } from "@/services";
import { useUserStore } from "@/stores";

// 3. 类型导入
import type { User, Role } from "@/types";

// 4. 相对导入
import { Footer } from "./components";
```

### 2. 类型导入导出

使用 type 关键字区分类型导入

```typescript
import type { User, Role } from "./types";
import { type FC, useState } from "react";

export type { User, Role };
export interface UserInfo {}
```

### 3. 导出规范

- 优先使用命名导出
- 避免使用 default 导出

```typescript
// 正例
export function formatDate() {}
export class UserService {}

// 反例
export default function formatDate() {}
```

## 注释规范

### 1. 函数注释

复杂函数需要 JSDoc 注释

```typescript
/**
 * 获取用户信息
 * @param id 用户ID
 * @returns 用户信息
 */
function getUser(id: number): Promise<User> {}
```

### 2. 接口注释

接口和类型需要注释说明用途

```typescript
/** 用户基本信息 */
interface User {
  /** 用户ID */
  id: number;
  /** 用户名称 */
  name: string;
}
```

## 性能优化

### 1. 循环类型性能

在运行循环的所有方式中，for 循环是最快的方式。

```typescript
// 最快
for (let i = 0; i < arr.length; i++) {}

// 较快
for (const item of arr) {
}

// 较慢
arr.forEach((item) => {});
```

### 2. 避免不必要的类型转换

```typescript
// 反例
const str = String(num);
const num = Number(str);

// 正例
const str = `${num}`;
const num = +str;
```

### 3. 合理使用 memo

对于复杂计算，使用 useMemo 缓存结果

```typescript
// 正例
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);
```

## 最佳实践

### 1. 优先使用 type 而不是 interface

除非需要 extends 或 implements

### 2. 使用 satisfies 精确推断类型

```typescript
// 正例 - 使用 satisfies
const config = {
  port: 3000,
  host: "localhost",
} satisfies ServerConfig;
```

### 3. 使用 satisfies 验证配置

```typescript
// 正例
const theme = {
  primary: "#007bff",
  secondary: "#6c757d",
} satisfies Theme;

theme.primary; // 类型是 '#007bff' 而非 string
```

### 4. 工具类型

使用内置工具类型

```typescript
// 选取部分属性
type UserPreview = Pick<User, "id" | "name">;

// 排除部分属性
type UserWithoutPassword = Omit<User, "password">;

// 让属性可选
type PartialUser = Partial<User>;

// 让属性必填
type RequiredUser = Required<User>;
```

## 重载函数规范

### 重载的函数必须写在一起

自然相关的项组合在一起将提高代码可读性和组织性。

```typescript
// 反例
declare namespace Foo {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function bar(): void;
  export function foo(sn: string | number): void;
}

// 正例
declare namespace Foo {
  export function foo(s: string): void;
  export function foo(n: number): void;
  export function foo(sn: string | number): void;
  export function bar(): void;
}
```

```typescript
// 反例
type Foo = {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void;
  foo(sn: string | number): void;
};

// 正例
type Foo = {
  foo(s: string): void;
  foo(n: number): void;
  foo(sn: string | number): void;
  bar(): void;
};
```

## 数组类型规范

### 简单数组类型的定义使用 T[]，复杂类型使用 Array<T>

简单类型（数字、字符串、布尔等）请使用 T[] 或 readonly T[]，其他复杂类型（联合、交叉、对象、函数等）请使用 Array<T> 或 ReadonlyArray<T>

```typescript
// 反例
const a: (string | number)[] = ["a", 1];
const b: { prop: string }[] = [{ prop: "a" }];
const c: (() => void)[] = [() => {}];
const d: Array<MyType> = ["a", "b"];
const e: Array<string> = ["a", "b"];

// 正例
const a: Array<string | number> = ["a", 1];
const b: Array<{ prop: string }> = [{ prop: "a" }];
const c: Array<() => void> = [() => {}];
const d: MyType[] = ["a", "b"];
const e: string[] = ["a", "b"];
const f: readonly string[] = ["a", "b"];
```

## 注释指令规范

### 使用 TypeScript 注释指令时需跟随描述说明

TS 提供了一些指令注释，可用于忽略 TypeScript 编译器在编译阶段的错误。

```typescript
// 反例
// @ts-expect-error
console.log("my code");

// 正例
// @ts-expect-error: Unreachable code here
console.log("my code");

// @ts-ignore: It's ok to ignore this compile error
console.log("my code");
```

### 禁止使用 tslint 注释

tslint 已经被废弃，对应的指令注释也不应再出现。

```typescript
// 反例
/* tslint:disable */
/* tslint:enable */
// tslint:disable-next-line
someCode();
```

## 类规范

### 如果类的属性是一个字面量，则推荐使用只读属性 readonly 而不是 getter

```typescript
// 反例
class Mx {
  public static get myField1() {
    return 1;
  }
}

// 正例
class Mx {
  public readonly myField1 = 1;
}
```

### 设置类成员的可访问性

将非公开成员的可访问性设置为「私有」，可以增强代码可理解性。

```typescript
// 正例
class Foo {
  private static foo = "foo";
  public static getFoo() {
    return Foo.foo;
  }
  public constructor() {}
  protected bar = "bar";
  public getBar() {}
}
```

### 类的成员应按照固定的先后顺序排列

- 静态方法 / 属性（static）优先于实例的方法 / 属性（instance）
- 属性（field）优先于构造函数（constructor），优先于方法（method）
- 公开的成员（public）优先于受保护的成员（protected），优先于私有的成员（private）

```typescript
// good
class Foo {
  public static foo1 = "foo1";
  protected static foo2 = "foo2";
  private static foo3 = "foo3";
  public static getFoo1() {}
  protected static getFoo2() {}
  private static getFoo3() {}
  public bar1 = "bar1";
  protected bar2 = "bar2";
  private bar3 = "bar3";
  public constructor() {}
  public getBar1() {}
  protected getBar2() {}
  private getBar3() {}
}
```

## 类型定义规范

### 类型断言必须使用 as Type

```typescript
// 反例
const foo = <string>"bar";

// 正例
const foo = "bar" as string;
```

### 对象字面量禁止类型断言

```typescript
// 反例
const x = { ... } as T;

// 正例
const x: T = { ... };
const y = { ... } as any;
```

### 优先使用 interface 定义类型

```typescript
// 反例
type T = { x: number };

// 正例
interface T {
  x: number;
}
```

### interface/type 类型中使用一致的成员分隔符 ;

```typescript
// 正例
interface Foo {
  name: string;
  greet(): void;
}

type Bar = {
  name: string;
  greet(): void;
};
```

### 接口中的方法使用属性的方式定义

```typescript
// 反例
interface T1 {
  func(arg: string): number;
}

// 正例
interface T1 {
  func: (arg: string) => number;
}
```

### 禁止定义空的接口类型

```typescript
// 反例
interface Foo {}
interface Bar extends Foo {}

// 正例
interface Foo {
  name: string;
}
```

### 初始化为 number/string/boolean 的变量或参数应避免显式的类型声明

```typescript
// 反例
const foo: number = 1;
const bar: string = "";
function fn(a: number = 5, b: boolean = true) {}

// 正例
const foo = 1;
const bar = "";
function fn(a = 5, b = true) {}
```

### 定义函数时，优先使用参数的联合类型而不是函数的类型重载

```typescript
// 反例
function f(x: number): void;
function f(x: string): void;

// 正例
function f(x: number | string): void;
```

## 其他规范

### 禁止使用容易混淆的非空断言

在相等比较运算符前使用非空断言很容易和不等运算符混淆。

```typescript
// 反例
const isEqualsBar = foo.bar! == "hello";

// 正例
const isEqualsBar = foo.bar == "hello";
```

### 禁止在 optional chaining 之后使用 non-null 断言

```typescript
// 反例
foo?.bar!;
foo?.bar!.baz;

// 正例
foo?.bar;
(foo?.bar).baz;
```

### 使用 ES2015 import 语法引入模块

```typescript
// 反例
const fs = require("fs");

// 正例
import * as fs from "fs";
```

### 不建议将 this 赋值给其他变量

```typescript
// 反例
function foo() {
  const self = this;
  setTimeout(function () {
    self.doWork();
  });
}

// 正例
function foo() {
  setTimeout(() => {
    this.doWork();
  });
}
```

### 当变量的值与类型声明相等时，优先使用 as const

```typescript
// 反例
let bar: 2 = 2;
let foo = <"bar">"bar";

// 正例
let foo = "bar" as const;
let foo: "bar" = "bar" as const;
```

### 禁止使用 namespace 来定义命名空间

```typescript
// 反例
module foo {}
namespace foo {}

// 正例
declare module "foo" {}
declare namespace foo {}
```

### 禁止使用 module 来定义命名空间

```typescript
// 反例
module Foo {}

// 正例
declare module Foo {}
```

### 字符串字面量使用单引号包裹

```typescript
// 反例
const foo = "bar";

// 正例
const foo = "bar";
```

### 加号 + 连接的两侧同为数字或同为字符串

```typescript
// 反例
var foo = "5.5" + 5;
var foo = 1n + 1;

// 正例
var foo = parseInt("5.5", 10) + 10;
var foo = 1n + 1n;
```

### 禁止使用三斜杠语法 /// 导入文件

三斜杠语法已经被废弃，声明文件（d.ts）以外禁止使用。

```typescript
// 反例
/// <reference path="./my-module" />

// 正例
import myModule from "./my-module";
```

### 类型声明时应正确添加空格间距

- 冒号前无空格，冒号后保留一个空格
- 箭头前后都保留一个空格

```typescript
// 反例
let foo: string = "bar";
function foo(): string {}

// 正例
let foo: string = "bar";
function foo(): string {}
type Foo = () => {};
```

### interface 和 type 定义时必须声明成员的类型

```typescript
// 反例
type Members = {
  member;
  otherMember;
};

// 正例
type Members = {
  member: boolean;
  otherMember: string;
};
```
