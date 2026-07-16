#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 PRD 的 PDF 文档 - 使用系统中文字体
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import os

def create_prd_pdf():
    output_path = "/Users/linkaiyan/.openclaw/workspace/PRD_graph-kg-base.pdf"
    
    # 注册中文字体 - 使用系统自带的黑体
    font_path = "/System/Library/Fonts/STHeiti Light.ttc"
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('ChineseFont', font_path))
        chinese_font = 'ChineseFont'
        print(f"已注册字体: {font_path}")
    else:
        print(f"字体不存在: {font_path}")
        chinese_font = 'Helvetica'
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    # 自定义样式 - 使用注册的中文字体
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=chinese_font,
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontName=chinese_font,
        fontSize=18,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    heading2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName=chinese_font,
        fontSize=14,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=10,
        spaceBefore=10
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName=chinese_font,
        fontSize=10,
        leading=14,
        alignment=TA_LEFT
    )
    
    bold_style = ParagraphStyle(
        'CustomBold',
        parent=styles['Normal'],
        fontName=chinese_font,
        fontSize=10,
        leading=14,
        alignment=TA_LEFT
    )
    
    story = []
    
    # 封面
    story.append(Spacer(1, 100))
    story.append(Paragraph("产品需求文档 (PRD)", title_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Graph-KG-Base 知识图谱管理系统", heading1_style))
    story.append(Spacer(1, 50))
    story.append(Paragraph("版本: 1.0", normal_style))
    story.append(Paragraph("日期: 2026-03-10", normal_style))
    story.append(PageBreak())
    
    # 目录
    story.append(Paragraph("目录", heading1_style))
    story.append(Spacer(1, 10))
    toc_items = [
        "1. 产品概述",
        "2. 业务模块划分",
        "3. 核心业务场景",
        "4. 数据流转",
        "5. 业务规则汇总",
        "6. 非功能性需求",
        "7. 附录"
    ]
    for item in toc_items:
        story.append(Paragraph(item, normal_style))
    story.append(PageBreak())
    
    # 1. 产品概述
    story.append(Paragraph("1. 产品概述", heading1_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("1.1 产品定位", heading2_style))
    story.append(Paragraph(
        "Graph-KG-Base 是一个企业级知识图谱管理系统，专注于非结构化数据的治理、存储、检索和智能问答。"
        "系统通过整合文档管理、知识空间、审批流程、智能对话等模块，为企业提供完整的知识管理解决方案。",
        normal_style
    ))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("1.2 核心价值", heading2_style))
    values = [
        ["价值点", "说明"],
        ["知识沉淀", "统一管理企业各类文档资料，实现知识资产化"],
        ["智能检索", "基于 Elasticsearch 的全文检索和向量检索能力"],
        ["智能问答", "结合大语言模型实现知识库智能问答"],
        ["流程管控", "文档上传、授权等关键操作通过审批流程管控"],
        ["权限管理", "细粒度的空间权限和文档权限控制"]
    ]
    value_table = Table(values, colWidths=[4*cm, 10*cm])
    value_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), chinese_font),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(value_table)
    story.append(PageBreak())
    
    # 2. 业务模块
    story.append(Paragraph("2. 业务模块划分", heading1_style))
    story.append(Spacer(1, 10))
    
    modules = [
        ["模块名称", "核心功能", "业务价值"],
        ["文档管理", "上传、下载、删除、版本管理", "知识资产沉淀"],
        ["知识空间", "空间创建、目录管理、权限分配", "知识分类组织"],
        ["全文检索", "关键词搜索、多条件筛选、智能提示", "快速获取知识"],
        ["智能对话", "AI问答、流式对话、知识推理", "智能化知识服务"],
        ["审批流程", "上传审批、授权审批、流程追踪", "合规管控"],
        ["用户互动", "点赞、收藏、评论、下载", "知识活跃度提升"],
        ["个人中心", "我的文档、行为记录、贡献统计", "个人知识管理"],
        ["系统管理", "配置管理、数据字典、日志审计", "系统运维"]
    ]
    module_table = Table(modules, colWidths=[3*cm, 6*cm, 5*cm])
    module_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27ae60')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), chinese_font),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#e8f5e9')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(module_table)
    story.append(PageBreak())
    
    # 3. 核心业务场景
    story.append(Paragraph("3. 核心业务场景", heading1_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("3.1 文档上传", heading2_style))
    story.append(Paragraph("业务场景: 用户将本地文档上传至知识库", normal_style))
    story.append(Spacer(1, 5))
    story.append(Paragraph("业务流程:", bold_style))
    
    steps = [
        "1. 用户选择上传文件（支持批量上传）",
        "2. 系统校验文件格式、大小、重复性（SHA256校验）",
        "3. 用户填写文档元数据（标题、摘要、关键词、业务分类等）",
        "4. 系统保存文件至存储介质（MinIO/本地磁盘）",
        "5. 触发文档解析流程（向量入库、全文索引、摘要生成）",
        "6. 更新文档状态并通知用户"
    ]
    for step in steps:
        story.append(Paragraph(step, normal_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("3.2 文档检索", heading2_style))
    story.append(Paragraph("业务场景: 用户通过多种方式查找所需文档", normal_style))
    story.append(Spacer(1, 5))
    story.append(Paragraph("业务流程:", bold_style))
    
    steps = [
        "1. 用户输入关键词或选择筛选条件",
        "2. 系统执行检索（ES全文检索 + 向量相似度检索）",
        "3. 返回排序后的文档列表（支持分页）",
        "4. 用户可进一步筛选（业务体系、部门、时间范围等）"
    ]
    for step in steps:
        story.append(Paragraph(step, normal_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("3.3 审批流程", heading2_style))
    story.append(Paragraph("业务场景: 用户上传文档需经审批后方可入库", normal_style))
    story.append(Spacer(1, 5))
    story.append(Paragraph("业务流程:", bold_style))
    
    steps = [
        "1. 用户提交上传申请（含文档和元数据）",
        "2. 系统创建审批流程实例",
        "3. 审批人收到待办通知",
        "4. 审批人审核文档内容",
        "5. 审批结果处理：通过/驳回/撤销"
    ]
    for step in steps:
        story.append(Paragraph(step, normal_style))
    
    story.append(PageBreak())
    
    # 4. 数据流转
    story.append(Paragraph("4. 数据流转", heading1_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("4.1 文档上传数据流", heading2_style))
    story.append(Paragraph(
        "用户上传 → 文件校验 → 存储介质保存 → 数据库记录 → 消息队列 → "
        "向量入库 → 全文索引 → 摘要生成 → 状态更新 → 通知用户",
        normal_style
    ))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("4.2 文档检索数据流", heading2_style))
    story.append(Paragraph(
        "用户查询 → 权限过滤 → ES检索 → 向量检索 → 结果合并 → 排序打分 → 返回结果",
        normal_style
    ))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("4.3 审批流程数据流", heading2_style))
    story.append(Paragraph(
        "提交申请 → 创建流程实例 → 分配审批人 → 审批处理 → 结果通知 → 文档状态更新",
        normal_style
    ))
    story.append(PageBreak())
    
    # 5. 业务规则
    story.append(Paragraph("5. 业务规则汇总", heading1_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("5.1 权限规则", heading2_style))
    rules_perm = [
        ["规则名称", "规则描述"],
        ["权限继承", "子空间自动继承父空间权限"],
        ["权限叠加", "多维度权限取并集"],
        ["拒绝优先", "显式拒绝权限优先于允许权限"],
        ["文档权限", "文档权限优先于空间权限"],
        ["管理员特权", "空间管理员拥有空间内所有权限"]
    ]
    rules_table = Table(rules_perm, colWidths=[4*cm, 10*cm])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e74c3c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), chinese_font),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ffebee')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(rules_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("5.2 文档规则", heading2_style))
    rules_doc = [
        ["规则名称", "规则描述"],
        ["唯一编码", "文档编码全局唯一，MD5生成"],
        ["重复校验", "基于SHA256校验文件重复"],
        ["版本管理", "支持多版本，历史版本可回溯"],
        ["状态流转", "初始→存储完成→向量入库→全文索引→摘要完成"],
        ["删除限制", "非空目录不可删除，删除需二次确认"]
    ]
    rules_doc_table = Table(rules_doc, colWidths=[4*cm, 10*cm])
    rules_doc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9b59b6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), chinese_font),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3e5f5')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(rules_doc_table)
    story.append(PageBreak())
    
    # 6. 非功能性需求
    story.append(Paragraph("6. 非功能性需求", heading1_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("6.1 性能需求", heading2_style))
    perf_items = [
        "文档上传：支持批量上传，单文件最大100MB",
        "检索响应：普通查询 < 500ms，复杂查询 < 2s",
        "并发支持：支持1000+用户同时在线",
        "文档处理：异步处理，支持队列堆积"
    ]
    for item in perf_items:
        story.append(Paragraph("- " + item, normal_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("6.2 安全需求", heading2_style))
    sec_items = [
        "身份认证：统一登录认证（SSO）",
        "权限控制：细粒度权限，最小权限原则",
        "数据加密：敏感数据加密存储",
        "操作审计：关键操作记录日志",
        "内容安全：敏感词过滤，内容审核"
    ]
    for item in sec_items:
        story.append(Paragraph("- " + item, normal_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("6.3 可用性需求", heading2_style))
    avail_items = [
        "系统可用性：99.9%",
        "数据备份：定期备份，支持恢复",
        "故障恢复：服务降级，熔断保护"
    ]
    for item in avail_items:
        story.append(Paragraph("- " + item, normal_style))
    
    story.append(PageBreak())
    
    # 7. 附录
    story.append(Paragraph("7. 附录", heading1_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("7.1 术语表", heading2_style))
    terms = [
        ["术语", "说明"],
        ["ES", "Elasticsearch，全文搜索引擎"],
        ["KG", "Knowledge Graph，知识图谱"],
        ["KGC", "Knowledge Graph Center，知识图谱中心"],
        ["BPM", "Business Process Management，业务流程管理"],
        ["MinIO", "对象存储服务"],
        ["NGQL", "Nebula Graph Query Language，图数据库查询语言"],
        ["SHA256", "安全哈希算法，用于文件校验"],
        ["MD5", "消息摘要算法，用于生成文档编码"]
    ]
    terms_table = Table(terms, colWidths=[3*cm, 11*cm])
    terms_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f39c12')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), chinese_font),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fff3e0')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(terms_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("7.2 文档状态定义", heading2_style))
    statuses = [
        ["状态值", "状态名称", "说明"],
        ["0", "初始状态", "文档刚创建"],
        ["1", "存储完成", "文件已保存到存储介质"],
        ["2", "向量入库", "文档向量已写入向量库"],
        ["3", "全文索引", "文档全文已写入ES"],
        ["4", "摘要完成", "摘要和关键词已生成"]
    ]
    status_table = Table(statuses, colWidths=[2*cm, 3*cm, 9*cm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#607d8b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), chinese_font),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#eceff1')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(status_table)
    
    # 生成PDF
    doc.build(story)
    print(f"PDF 文件已生成: {output_path}")

if __name__ == "__main__":
    create_prd_pdf()

