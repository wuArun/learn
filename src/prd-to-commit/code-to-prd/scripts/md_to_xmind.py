#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 PRD 的 XMind 思维导图 - 手动创建符合 XMind 格式的文件
"""
import zipfile
import os
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def create_xmind():
    output_path = "/Users/linkaiyan/.openclaw/workspace/PRD_graph-kg-base.xmind"
    
    # 创建 content.xml
    xmap_content = Element('xmap-content')
    xmap_content.set('version', '2.0')
    
    # 创建 sheet
    sheet = SubElement(xmap_content, 'sheet')
    sheet.set('id', '1')
    
    # 创建主题
    topic = SubElement(sheet, 'topic')
    topic.set('id', 'root')
    topic.set('structure-class', 'org.xmind.ui.logic.right')
    
    # 根标题
    title = SubElement(topic, 'title')
    title.text = "Graph-KG-Base 业务流程"
    
    # 创建子主题
    children = SubElement(topic, 'children')
    topics = SubElement(children, 'topics')
    topics.set('type', 'attached')
    
    # 1. 文档上传流程
    t1 = SubElement(topics, 'topic')
    t1.set('id', 't1')
    t1_title = SubElement(t1, 'title')
    t1_title.text = "文档上传流程"
    
    t1_children = SubElement(t1, 'children')
    t1_topics = SubElement(t1_children, 'topics')
    t1_topics.set('type', 'attached')
    
    for i, text in enumerate(["选择文件", "文件校验(格式/大小/SHA256)", "填写元数据", "保存至存储介质", "向量入库", "全文索引", "摘要生成", "状态更新"]):
        sub = SubElement(t1_topics, 'topic')
        sub.set('id', f't1-{i}')
        sub_title = SubElement(sub, 'title')
        sub_title.text = text
    
    # 2. 文档检索流程
    t2 = SubElement(topics, 'topic')
    t2.set('id', 't2')
    t2_title = SubElement(t2, 'title')
    t2_title.text = "文档检索流程"
    
    t2_children = SubElement(t2, 'children')
    t2_topics = SubElement(t2_children, 'topics')
    t2_topics.set('type', 'attached')
    
    for i, text in enumerate(["输入关键词/筛选条件", "权限过滤", "ES全文检索", "向量相似度检索", "结果合并排序", "返回分页结果"]):
        sub = SubElement(t2_topics, 'topic')
        sub.set('id', f't2-{i}')
        sub_title = SubElement(sub, 'title')
        sub_title.text = text
    
    # 3. 审批流程
    t3 = SubElement(topics, 'topic')
    t3.set('id', 't3')
    t3_title = SubElement(t3, 'title')
    t3_title.text = "审批流程"
    
    t3_children = SubElement(t3, 'children')
    t3_topics = SubElement(t3_children, 'topics')
    t3_topics.set('type', 'attached')
    
    for i, text in enumerate(["提交申请", "创建流程实例", "审批人审核", "通过/驳回/撤销", "结果通知", "文档状态更新"]):
        sub = SubElement(t3_topics, 'topic')
        sub.set('id', f't3-{i}')
        sub_title = SubElement(sub, 'title')
        sub_title.text = text
    
    # 4. 智能问答流程
    t4 = SubElement(topics, 'topic')
    t4.set('id', 't4')
    t4_title = SubElement(t4, 'title')
    t4_title.text = "智能问答流程"
    
    t4_children = SubElement(t4, 'children')
    t4_topics = SubElement(t4_children, 'topics')
    t4_topics.set('type', 'attached')
    
    for i, text in enumerate(["输入问题", "解析问题意图", "检索知识片段", "调用大语言模型", "生成答案", "返回答案和来源"]):
        sub = SubElement(t4_topics, 'topic')
        sub.set('id', f't4-{i}')
        sub_title = SubElement(sub, 'title')
        sub_title.text = text
    
    # 5. 权限管理流程
    t5 = SubElement(topics, 'topic')
    t5.set('id', 't5')
    t5_title = SubElement(t5, 'title')
    t5_title.text = "权限管理流程"
    
    t5_children = SubElement(t5, 'children')
    t5_topics = SubElement(t5_children, 'topics')
    t5_topics.set('type', 'attached')
    
    for i, text in enumerate(["用户请求操作", "校验用户身份", "查询空间权限", "查询文档权限", "权限判定", "允许/拒绝操作"]):
        sub = SubElement(t5_topics, 'topic')
        sub.set('id', f't5-{i}')
        sub_title = SubElement(sub, 'title')
        sub_title.text = text
    
    # 格式化 XML
    rough_string = tostring(xmap_content, encoding='utf-8')
    reparsed = minidom.parseString(rough_string)
    content_xml = reparsed.toprettyxml(indent="  ", encoding='utf-8')
    
    # 创建 META-INF/manifest.xml
    manifest = '''<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
</manifest>'''
    
    # 创建 zip 文件
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('content.xml', content_xml)
        zf.writestr('META-INF/manifest.xml', manifest.encode('utf-8'))
    
    print(f"XMind 文件已生成: {output_path}")

if __name__ == "__main__":
    create_xmind()