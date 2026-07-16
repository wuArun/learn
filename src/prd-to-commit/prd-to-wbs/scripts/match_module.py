#!/usr/bin/env python3
"""
匹配需求到模块。
"""

import sys
import json
import argparse
from difflib import SequenceMatcher

def calculate_similarity(text1, text2):
    """计算文本相似度"""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def match_requirement(requirement_desc, modules):
    """将需求匹配到最相关的模块"""
    matches = []

    for module in modules:
        # 计算与模块名称的相似度
        name_score = calculate_similarity(requirement_desc, module['name'])

        # 计算与模块描述的相似度
        desc_score = calculate_similarity(requirement_desc, module.get('description', ''))

        # 计算与关键词的匹配度
        keyword_score = 0
        if 'keywords' in module:
            for kw in module['keywords']:
                if kw.lower() in requirement_desc.lower():
                    keyword_score += 0.2

        # 综合得分
        total_score = (name_score * 0.3 + desc_score * 0.5 + keyword_score)
        total_score = min(1.0, total_score)

        matches.append({
            "module_id": module['id'],
            "module_name": module['name'],
            "module_path": module['path'],
            "similarity": round(total_score, 3),
            "name_score": round(name_score, 3),
            "desc_score": round(desc_score, 3),
            "keyword_score": round(keyword_score, 3)
        })

    # 按相似度排序
    matches.sort(key=lambda x: x['similarity'], reverse=True)
    return matches[:5]  # 返回前5个

def main():
    parser = argparse.ArgumentParser(description='匹配需求到模块')
    parser.add_argument('--requirement', '-r', help='需求描述')
    parser.add_argument('--requirement-file', '-f', help='包含需求描述的JSON文件')
    parser.add_argument('--index', '-i', required=True, help='模块索引文件 (JSON)')
    parser.add_argument('--threshold', '-t', type=float, default=0.5, help='匹配阈值')

    args = parser.parse_args()

    # 获取需求描述
    if args.requirement:
        req_desc = args.requirement
    elif args.requirement_file:
        with open(args.requirement_file, 'r', encoding='utf-8') as f:
            req_data = json.load(f)
            # 如果是单个需求
            if isinstance(req_data, dict) and 'description' in req_data:
                req_desc = req_data['description']
            # 如果是需求列表，取第一个
            elif 'requirements' in req_data and req_data['requirements']:
                req_desc = req_data['requirements'][0]['description']
            else:
                print(json.dumps({"error": "无法从文件中提取需求描述"}))
                sys.exit(1)
    else:
        req_desc = sys.stdin.read().strip()

    if not req_desc:
        print(json.dumps({"error": "未提供需求描述"}))
        sys.exit(1)

    # 加载模块索引
    with open(args.index, 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    modules = index_data.get('modules', [])
    if not modules:
        print(json.dumps({"matches": [], "status": "no_modules"}))
        return

    # 匹配
    matches = match_requirement(req_desc, modules)

    # 判断是否明确
    best_score = matches[0]['similarity'] if matches else 0
    status = "clear" if best_score >= args.threshold else "unclear"

    result = {
        "requirement": req_desc,
        "status": status,
        "threshold": args.threshold,
        "matches": matches
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()