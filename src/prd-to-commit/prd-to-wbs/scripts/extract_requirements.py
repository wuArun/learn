#!/usr/bin/env python3
"""
从PRD文本中提取需求。
"""

import sys
import json
import re
import argparse

def extract_requirements(text):
    """从文本中提取需求"""
    requirements = []

    # 常见的需求标识模式
    patterns = [
        # 编号列表项: 1. 2. 3. 或 a. b. c.
        (r'(?:^|\n)\s*(?:\d+\.|[a-zA-Z]\.)\s*(.+?)(?=\n\s*(?:\d+\.|[a-zA-Z]\.|$)|\Z)', '功能需求'),

        # 关键词引导的需求
        (r'(?:需要|应该|必须|需支持|功能|特性)[：:\s]+([^。\n]+[。\n])', '功能需求'),
        (r'(?:非功能性需求|性能要求|安全要求)[：:\s]+([^。\n]+[。\n])', '非功能需求'),
        (r'(?:业务规则|规则)[：:\s]+([^。\n]+[。\n])', '业务规则'),

        # 用户故事格式: As a... I want... So that...
        (r'As an?\s+[^,\n]+,\s+I want\s+[^,\n]+,\s+so that\s+[^.\n]+', '用户故事'),
    ]

    for pattern, req_type in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE | re.DOTALL)
        for match in matches:
            # 清理和标准化
            desc = match.strip()
            if len(desc) > 10 and not any(r['description'] == desc for r in requirements):
                # 判断优先级（简单规则）
                priority = '中'
                if re.search(r'核心|关键|必须|P0|最高', desc, re.IGNORECASE):
                    priority = '高'
                elif re.search(r'可选|后续|二期|P2|最低', desc, re.IGNORECASE):
                    priority = '低'

                req = {
                    "id": f"REQ-{len(requirements)+1:03d}",
                    "description": desc,
                    "type": req_type,
                    "priority": priority,
                    "confidence": 0.7  # 提取置信度
                }
                requirements.append(req)

    return requirements

def main():
    parser = argparse.ArgumentParser(description='从PRD文本中提取需求')
    parser.add_argument('--input', '-i', help='输入文件路径（默认从stdin读取）')
    parser.add_argument('--output', '-o', help='输出JSON文件路径（默认输出到stdout）')
    parser.add_argument('--format', '-f', choices=['json', 'text'], default='json', help='输出格式')

    args = parser.parse_args()

    # 读取输入
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        text = sys.stdin.read()

    # 提取需求
    requirements = extract_requirements(text)

    # 输出
    if args.format == 'json':
        output = json.dumps({
            "total": len(requirements),
            "requirements": requirements
        }, indent=2, ensure_ascii=False)
    else:
        output_lines = [f"{r['id']} [{r['type']}] {r['description']} (优先级: {r['priority']})"
                       for r in requirements]
        output = '\n'.join(output_lines)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
    else:
        print(output)

if __name__ == "__main__":
    main()