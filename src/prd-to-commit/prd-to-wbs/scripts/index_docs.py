#!/usr/bin/env python3
"""
扫描文档目录，建立模块索引。
"""

import sys
import os
import json
import re
from pathlib import Path

def extract_module_name(filepath, content):
    """从文件内容或路径中提取模块名称"""
    # 尝试从文件头部的YAML frontmatter提取
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if frontmatter_match:
        fm = frontmatter_match.group(1)
        name_match = re.search(r'^name:\s*(.+)$', fm, re.MULTILINE)
        if name_match:
            return name_match.group(1).strip()

    # 否则使用文件名（去掉扩展名）
    return filepath.stem.replace('_', '-').lower()

def extract_description(content, max_length=200):
    """提取模块描述（第一段非空文本）"""
    # 跳过YAML frontmatter
    content = re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)

    # 找第一段非空文本
    paragraphs = content.split('\n\n')
    for para in paragraphs:
        para = para.strip()
        if para and not para.startswith('#'):  # 跳过标题
            return para[:max_length] + ('...' if len(para) > max_length else '')

    return ""

def extract_keywords(content, limit=10):
    """简单提取关键词（可以后续用更复杂的NLP）"""
    # 这里简化处理，只提取一些特征词
    words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
    from collections import Counter
    common_words = {'this', 'that', 'with', 'from', 'have', 'will', 'should', 'would', 'could'}
    keywords = [word for word in words if word not in common_words]
    return [word for word, _ in Counter(keywords).most_common(limit)]

def index_docs(root_dir):
    root = Path(root_dir)
    if not root.exists():
        print(json.dumps({"error": f"Directory not found: {root_dir}"}))
        return

    modules = []
    for md_file in root.rglob('*.md'):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            rel_path = md_file.relative_to(root)
            module = {
                "id": str(rel_path).replace('/', '-').replace('.md', ''),
                "name": extract_module_name(md_file, content),
                "path": str(md_file),
                "relative_path": str(rel_path),
                "description": extract_description(content),
                "keywords": extract_keywords(content)
            }
            modules.append(module)
        except Exception as e:
            print(f"Error reading {md_file}: {e}", file=sys.stderr)

    # 如果没有找到模块，尝试从目录结构推断
    if not modules:
        for dir_path in root.iterdir():
            if dir_path.is_dir():
                module = {
                    "id": dir_path.name,
                    "name": dir_path.name.replace('-', ' ').title(),
                    "path": str(dir_path),
                    "relative_path": dir_path.name,
                    "description": f"模块目录: {dir_path.name}",
                    "keywords": [dir_path.name]
                }
                modules.append(module)

    print(json.dumps({"modules": modules}, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python index_docs.py <docs_directory>")
        sys.exit(1)

    index_docs(sys.argv[1])