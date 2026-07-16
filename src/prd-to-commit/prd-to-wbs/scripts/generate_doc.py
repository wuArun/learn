#!/usr/bin/env python3
"""
生成需求文档。
"""

import sys
import json
import argparse
from datetime import datetime
from pathlib import Path

def generate_module_abbr(module_name):
    """从模块名生成缩写（用于需求ID）"""
    # 取每个单词的首字母
    words = module_name.replace('-', ' ').split()
    if len(words) == 1:
        # 单个词取前3个字母
        return module_name[:3].upper()
    else:
        # 多个词取首字母
        return ''.join([w[0].upper() for w in words if w])

def generate_document(module_name, requirements, conflicts, notes=None):
    """生成需求文档内容"""
    module_abbr = generate_module_abbr(module_name)
    today = datetime.now().strftime('%Y-%m-%d')

    lines = []

    # 标题
    lines.append(f"# {module_name} 需求列表")
    lines.append(f"\n> 生成时间：{today}")
    lines.append(f"> 基于PRD分析生成\n")

    # 1. 新增需求
    lines.append("## 1. 新增需求")
    if requirements:
        lines.append("\n| 需求ID | 需求描述 | 类型 | 优先级 | 备注 |")
        lines.append("| :--- | :--- | :--- | :--- | :--- |")

        for i, req in enumerate(requirements, 1):
            req_id = f"{module_abbr}-REQ-{i:03d}"
            desc = req.get('description', '')
            req_type = req.get('type', '功能需求')
            priority = req.get('priority', '中')
            notes = req.get('notes', '')

            lines.append(f"| {req_id} | {desc} | {req_type} | {priority} | {notes} |")
    else:
        lines.append("\n*暂无新增需求*\n")

    # 2. 变更/冲突需求
    lines.append("\n## 2. 变更/冲突需求")
    if conflicts:
        lines.append("\n| 需求ID | 需求描述 | 冲突描述 | 建议处理方式 | 涉及模块 |")
        lines.append("| :--- | :--- | :--- | :--- | :--- |")

        for i, conflict in enumerate(conflicts, 1):
            req_id = f"{module_abbr}-CHG-{i:03d}"
            desc = conflict.get('description', '')
            conflict_desc = conflict.get('conflict', '')
            suggestion = conflict.get('suggestion', '需与产品团队确认')
            modules = conflict.get('modules', module_name)

            lines.append(f"| {req_id} | {desc} | {conflict_desc} | {suggestion} | {modules} |")
    else:
        lines.append("\n*未发现与现有文档的直接冲突*\n")

    # 3. 待办/备注
    lines.append("\n## 3. 待办/备注")
    if notes:
        for note in notes:
            lines.append(f"- {note}")
    else:
        lines.append("- 无")

    return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description='生成需求文档')
    parser.add_argument('--module', '-m', required=True, help='模块名称')
    parser.add_argument('--requirements', '-r', help='需求JSON文件')
    parser.add_argument('--conflicts', '-c', help='冲突需求JSON文件')
    parser.add_argument('--notes', '-n', help='备注列表文件')
    parser.add_argument('--output', '-o', required=True, help='输出文件路径')

    args = parser.parse_args()

    # 加载需求
    requirements = []
    if args.requirements:
        with open(args.requirements, 'r', encoding='utf-8') as f:
            req_data = json.load(f)
            if isinstance(req_data, dict) and 'requirements' in req_data:
                requirements = req_data['requirements']
            elif isinstance(req_data, list):
                requirements = req_data

    # 加载冲突
    conflicts = []
    if args.conflicts:
        with open(args.conflicts, 'r', encoding='utf-8') as f:
            conflicts_data = json.load(f)
            if isinstance(conflicts_data, dict) and 'conflicts' in conflicts_data:
                conflicts = conflicts_data['conflicts']
            elif isinstance(conflicts_data, list):
                conflicts = conflicts_data

    # 加载备注
    notes = []
    if args.notes:
        with open(args.notes, 'r', encoding='utf-8') as f:
            notes = [line.strip() for line in f if line.strip()]

    # 生成文档
    content = generate_document(args.module, requirements, conflicts, notes)

    # 自动创建输出目录（如果不存在）
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 输出
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"文档已生成：{args.output}")

if __name__ == "__main__":
    main()