# JavaScript 规范检查项

## 命名规范

### 1. 变量命名

采用小写驼峰命名 lowerCamelCase，代码中的命名均不能以下划线，也不能以下划线或美元符号结束。

```javascript
// 反例
_name / name_ / name$;
```

方法名、参数名、成员变量、局部变量都统一使用 lowerCamelCase 风格。

```javascript
// 正例
localValue / getHttpMessage() / inputUserId;
```

### 2. 方法命名

其中 method 方法命名必须是**动词**或者**动词+名词**形式：

```javascript
// 正例
saveShopCarData / openShopCarInfoDialog;

// 反例
save / open / show / go;
```

**增删查改，详情统一使用如下 5 个单词**，不得使用其他：

```
add / update / delete / detail / get
```

常用动词：

```
get 获取/set 设置,
add 增加/remove 删除
create 创建/destory 移除
start 启动/stop 停止
open 打开/close 关闭,
read 读取/write 写入
load 载入/save 保存,
create 创建/destroy 销毁
begin 开始/end 结束,
backup 备份/restore 恢复
import 导入/export 导出,
split 分割/merge 合并
inject 注入/extract 提取,
attach 附着/detach 脱离
bind 绑定/separate 分离,
view 查看/browse 浏览
edit 编辑/modify 修改,
select 选取/mark 标记
copy 复制/paste 粘贴,
undo 撤销/redo 重做
insert 插入/delete 移除,
add 加入/append 添加
clean 清理/clear 清除,
index 索引/sort 排序
find 查找/search 搜索,
increase 增加/decrease 减少
play 播放/pause 暂停,
launch 启动/run 运行
compile 编译/execute 执行,
debug 调试/trace 跟踪
observe 观察/listen 监听,
build 构建/publish 发布
input 输入/output 输出,
encode 编码/decode 解码
encrypt 加密/decrypt 解密,
compress 压缩/decompress 解压缩
pack 打包/unpack 解包,
parse 解析/emit 生成
connect 连接/disconnect 断开,
send 发送/receive 接收
download 下载/upload 上传,
refresh 刷新/synchronize 同步
update 更新/revert 复原,
lock 锁定/unlock 解锁
check out 签出/check in 签入,
submit 提交/commit 交付
push 推/pull 拉,
expand 展开/collapse 折叠
begin 起始/end 结束,
start 开始/finish 完成
enter 进入/exit 退出,
abort 放弃/quit 离开
obsolete 废弃/depreciate 废旧,
collect 收集/aggregate 聚集
```

### 3. 常量命名

常量命名全部大写，单词间用下划线隔开，力求语义表达完整清楚，不要嫌名字长。

```javascript
// 正例
MAX_STOCK_COUNT;

// 反例
MAX_COUNT;
```

## 字符串规范

统一使用单引号(')，不使用双引号(")。

```javascript
// 正例
let str = "foo";
let testDiv = '<div id="test"></div>';

// 反例
let str = "foo";
let testDiv = "<div id='test'></div>";
```

## 对象声明规范

### 1. 使用字面值创建对象

```javascript
// 正例
let user = {};

// 反例
let user = new Object();
```

### 2. 使用字面量代替对象构造器

```javascript
// 正例
var user = {
  age: 0,
  name: 1,
  city: 3,
};

// 反例
var user = new Object();
user.age = 0;
user.name = 0;
user.city = 0;
```

## undefined 判断规范

永远不要直接使用 undefined 进行变量判断；使用 typeof 和字符串'undefined'对变量进行判断。

```javascript
// 正例
if (typeof person === "undefined") {
  // ...
}

// 反例
if (person === undefined) {
  // ...
}
```

## console 使用规范

因 console.log 大量使用会有性能问题，所以在非 webpack 项目中谨慎使用 log 功能。

## 代码质量规范

### 1. 避免冗余代码

- 删除未使用的变量、函数、import
- 删除注释掉的代码
- 删除调试用的 console 语句

### 2. 函数职责单一

- 每个函数只做一件事
- 避免过长的函数，适当拆分

### 3. 避免重复代码

- 重复的逻辑应提取为公共方法

### 4. 硬编码问题

- 字符串应提取为常量或配置
- 魔法数字应定义常量

## 性能优化规范

### 1. 尽量使用原生方法

### 2. switch 语句相对 if 较快

通过将 case 语句按照最可能到最不可能的顺序进行组织。

```javascript
// 正例
switch (value) {
  case "likely":
    // ...
    break;
  case "unlikely":
    // ...
    break;
}
```

### 3. 避免全局查找

在一个函数中会用到全局对象存储为局部变量来减少全局查找。

```javascript
// 正例
function() {
  var local = window;
  console.log(local.document.body);
}

// 反例
function() {
  console.log(window.document.body);
}
```

### 4. 循环遍历性能

循环遍历变量的最快方法：**for > forEach > map**

在运行循环的所有方式中，for 循环是最快的方式，比 forEach 快了 10 倍，在对于大型数组时，最好使用 for 循环。

```javascript
// 最快
for (let i = 0; i < arr.length; i++) {
  // ...
}

// 较快
arr.forEach((item) => {
  // ...
});

// 较慢
arr.map((item) => {
  // ...
});
```

## 安全规范

### 敏感信息

禁止在代码中硬编码密钥、密码、token 等敏感信息，敏感信息应通过环境变量或后端接口获取。
