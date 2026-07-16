# DICC 组件规范指南

> DICC (Digital Intelligent Component Center) 是 CATL 内部前端组件库体系
> 基于 React 18 + TypeScript + Ant Design 5 构建

---

## 一、组件库体系

### 1.1 核心组件库

| 包名 | 用途 | 安装方式 |
|------|------|----------|
| `catl-components` | CATL 业务组件库 | 已内置 |
| `@dicc/utils` | 工具函数库 | 已内置 |
| `@dicc/service` | HTTP 服务 & 菜单工具 | 已内置 |
| `@dicc/icons` | 图标库 | 已内置 |

### 1.2 使用优先级

```
第一优先级: catl-components (CATL 业务组件)
    ↓
第二优先级: antd (Ant Design 基础组件)
    ↓
第三优先级: 其他第三方库
```

---

## 二、表单组件规范

### 2.1 输入框 (DiccInput)

```tsx
import { DiccInput } from 'catl-components';

// 基础用法
<DiccInput placeholder="请输入" />

// 带前缀/后缀
<DiccInput 
  prefix={<UserOutlined />} 
  suffix={<Tooltip title="提示"><InfoCircleOutlined /></Tooltip>}
/>

// 在搜索表单中使用
{
  label: '物料编码',
  name: 'materialCode',
  render: <DiccInput placeholder="请输入物料编码" />,
}
```

**规范要求**:
- 表单中必须使用 `DiccInput` 替代 `Input`
- 搜索条件使用 `BaseInput`（项目内封装）

### 2.2 选择器 (DiccSelect / ScrollSelect)

```tsx
import { DiccSelect, ScrollSelect } from 'catl-components';

// 静态选项 - DiccSelect
<DiccSelect
  placeholder="请选择"
  options={[
    { value: '1', label: '选项1' },
    { value: '2', label: '选项2' },
  ]}
/>

// 异步加载/大数据量 - ScrollSelect
<ScrollSelect
  placeholder="请选择供应商"
  fetchData={fetchSupplierList}
  pageSize={20}
/>
```

**规范要求**:
- 数据量 < 50 条：使用 `DiccSelect`
- 数据量 >= 50 条或异步加载：使用 `ScrollSelect`
- 值集数据：使用 `getLovToSelect()` 转换后传入

### 2.3 日期选择器 (DiccDatePicker)

```tsx
import { DiccDatePicker } from 'catl-components';

// 单日期
<DiccDatePicker format="YYYY-MM-DD" />

// 日期范围
<DiccDatePicker.RangePicker format="YYYY-MM-DD" />

// 日期时间
<DiccDatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
```

**规范要求**:
- 日期格式统一使用 `"YYYY-MM-DD"`
- 日期时间格式统一使用 `"YYYY-MM-DD HH:mm:ss"`

### 2.4 开关 (DiccSwitch)

```tsx
import { DiccSwitch } from 'catl-components';

<DiccSwitch 
  checked={value === 1}
  onChange={(checked) => setValue(checked ? 1 : 0)}
/>
```

### 2.5 表单容器 (DiccForm)

```tsx
import { DiccForm } from 'catl-components';

<DiccForm
  columns={columns}
  onSearch={handleSearch}
  onReset={handleReset}
/>
```

---

## 三、数据展示组件规范

### 3.1 表格 (ComposeTable)

```tsx
import { ComposeTable } from 'catl-components';

<ComposeTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  pagination={pagination}
/>
```

**规范要求**:
- 必须使用 `ComposeTable` 替代 `Table`
- 行操作使用 `OperateSpace` 组件
- 权限控制使用 `ActionPermission` 或 `ButtonPermission`

### 3.2 描述列表 (DiccDescriptions)

```tsx
import { DiccDescriptions } from 'catl-components';

<DiccDescriptions
  title="详细信息"
  items={descriptionItems}
/>
```

### 3.3 空状态 (DiccEmpty)

```tsx
import { DiccEmpty } from 'catl-components';

<DiccEmpty description="暂无数据" />
```

---

## 四、反馈组件规范

### 4.1 按钮 (DiccButton)

```tsx
import { DiccButton } from 'catl-components';

// 主按钮
<DiccButton type="primary">提交</DiccButton>

// 文字按钮
<DiccButton type="text">取消</DiccButton>

// 带权限的按钮
<ButtonPermission
  code="apqp.material.create"
  text="新增物料"
  type="primary"
/>
```

**规范要求**:
- 业务操作使用 `DiccButton`
- 需要权限控制的使用 `ButtonPermission`

### 4.2 抽屉 (DiccDrawer)

```tsx
import { DiccDrawer } from 'catl-components';

<DiccDrawer
  title="详情"
  open={visible}
  onClose={() => setVisible(false)}
  width={720}
>
  {content}
</DiccDrawer>
```

**规范要求**:
- 详情页优先使用抽屉而非弹窗
- 宽度根据内容自适应，常用：720px、960px

### 4.3 上传 (DiccUpload)

```tsx
import { DiccUpload } from 'catl-components';

<DiccUpload
  accept=".pdf,.doc,.docx"
  multiple
  beforeUpload={handleBeforeUpload}
>
  <ButtonPermission text="上传文件" />
</DiccUpload>
```

### 4.4 提示 (DiccTooltip)

```tsx
import { DiccTooltip } from 'catl-components';

<DiccTooltip title="提示文本">
  <InfoCircleOutlined />
</DiccTooltip>
```

---

## 五、布局组件规范

### 5.1 图标 (CatlIcon)

```tsx
import { CatlIcon } from 'catl-components';

// 使用 CATL 品牌图标
<CatlIcon type="success" />
<CatlIcon type="warning" />
<CatlIcon type="error" />
```

### 5.2 操作空间 (OperateSpace)

```tsx
import { OperateSpace } from 'catl-components';

// 行内操作按钮组
<OperateSpace>
  <ButtonPermission text="编辑" />
  <ButtonPermission text="删除" />
</OperateSpace>
```

---

## 六、工具函数规范

### 6.1 HTTP 请求 (@dicc/service)

```tsx
import http from '@dicc/service';

// GET 请求
const res = await http.get({
  url: '/api/v1/materials',
  params: { page: 1, size: 10 },
});

// POST 请求
const res = await http.post({
  url: '/api/v1/materials',
  data: formData,
});
```

### 6.2 工具函数 (@dicc/utils)

```tsx
import { message, isArray, isString } from '@dicc/utils';

// 消息提示
message.success('操作成功');
message.error('操作失败');

// 类型判断
if (isArray(data)) { ... }
if (isString(value)) { ... }
```

### 6.3 国际化 (react-intl-universal)

```tsx
import { getIntl } from '@/utils/i18n';

// 基础用法
getIntl('apqp.common.wlbm_c9dc', '物料编码')

// 带参数
getIntl('apqp.common.count_result', '共 {count} 条', { count: 100 })
```

---

## 七、页面规范

### 7.1 标准页面结构

```tsx
import React from 'react';
import { Form, Row, Col } from 'antd';
import { DiccInput, DiccSelect, DiccButton } from 'catl-components';
import { CardWrapper } from '@/pages/components';
import { trackPage } from '@/utils/track';
import { getIntl } from '@/utils/i18n';

const MyPage: React.FC = () => {
  const [form] = Form.useForm();
  
  // 页面逻辑...
  
  return (
    <div style={{ padding: '12px' }}>
      {/* 搜索区域 */}
      <CardWrapper>
        <Form form={form}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="物料编码" name="materialCode">
                <DiccInput placeholder="请输入" />
              </Form.Item>
            </Col>
            {/* ... */}
          </Row>
        </Form>
      </CardWrapper>
      
      {/* 表格区域 */}
      <CardWrapper>
        <ComposeTable columns={columns} />
      </CardWrapper>
    </div>
  );
};

// 必须使用 trackPage 包装
export default trackPage(MyPage, '页面名称');
```

### 7.2 权限控制

```tsx
import { ButtonPermission, ActionPermission } from '@/components';

// 按钮权限
<ButtonPermission
  code="apqp.material.create"
  text="新增物料"
  type="primary"
/>

// 操作权限
<ActionPermission code="apqp.material.edit" isDisabled>
  <DiccButton type="text">编辑</DiccButton>
</ActionPermission>
```

---

## 八、禁止事项

1. **禁止直接使用 antd 的 Input、Select、Button**（除非 catl-components 没有）
2. **禁止虚构不存在的 DICC 组件**
3. **禁止在已有内部组件时引入重复的第三方库**
4. **禁止页面组件不使用 `trackPage` 包装**
5. **禁止硬编码中文，必须使用 `getIntl` 国际化**

---

## 九、常用组件速查表

| 功能 | 组件 | 库 |
|------|------|-----|
| 输入框 | DiccInput / BaseInput | catl-components |
| 选择器 | DiccSelect / ScrollSelect | catl-components |
| 日期选择 | DiccDatePicker | catl-components |
| 开关 | DiccSwitch | catl-components |
| 按钮 | DiccButton / ButtonPermission | catl-components / 项目组件 |
| 表格 | ComposeTable | catl-components |
| 抽屉 | DiccDrawer | catl-components |
| 上传 | DiccUpload | catl-components |
| 空状态 | DiccEmpty | catl-components |
| 图标 | CatlIcon / @ant-design/icons | catl-components / antd |
| HTTP请求 | http | @dicc/service |
| 消息提示 | message | @dicc/utils |
| 国际化 | getIntl | 项目 utils |

---

**最后更新**: 2026-03-12
**版本**: v1.0
