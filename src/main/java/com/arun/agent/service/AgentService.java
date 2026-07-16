package com.arun.agent.service;

import com.alibaba.fastjson2.JSON;
import com.arun.agent.dto.AgentRequest;
import com.arun.agent.dto.AgentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 基础 Agent 服务实现
 * 
 * 这个服务提供以下功能：
 * 1. 文本问答能力
 * 2. 简单的对话管理
 * 3. Tool 调用模拟
 */
@Slf4j
@Service
public class AgentService {

    @Value("${agent.api-key:default}")
    private String apiKey;

    // 模拟的对话历史存储
    private final Map<String, List<Map<String, String>>> conversationHistory = new ConcurrentHashMap<>();

    /**
     * 处理 Agent 请求的主方法
     */
    public AgentResponse processRequest(AgentRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("Processing agent request: {}", JSON.toJSONString(request));
            
            // 生成对话 ID（如果没有提供）
            String conversationId = request.getConversationId() != null ? 
                request.getConversationId() : UUID.randomUUID().toString();
            
            // 初始化对话历史
            conversationHistory.putIfAbsent(conversationId, new ArrayList<>());
            List<Map<String, String>> history = conversationHistory.get(conversationId);
            
            // 添加用户消息到历史
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", request.getMessage());
            history.add(userMessage);
            
            // 调用 Agent 处理逻辑
            String reply = handleAgentLogic(request.getMessage(), request.getAgentType());
            
            // 添加 Agent 回复到历史
            Map<String, String> assistantMessage = new HashMap<>();
            assistantMessage.put("role", "assistant");
            assistantMessage.put("content", reply);
            history.add(assistantMessage);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            return AgentResponse.builder()
                .reply(reply)
                .conversationId(conversationId)
                .status("success")
                .executionTime(executionTime)
                .build();
                
        } catch (Exception e) {
            log.error("Error processing agent request", e);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            return AgentResponse.builder()
                .status("error")
                .errorMessage(e.getMessage())
                .executionTime(executionTime)
                .build();
        }
    }

    /**
     * Agent 处理逻辑
     * 根据不同的 Agent 类型处理用户输入
     */
    private String handleAgentLogic(String message, String agentType) {
        if (agentType == null) {
            agentType = "general";
        }
        
        return switch (agentType) {
            case "calculator" -> handleCalculator(message);
            case "knowledge" -> handleKnowledge(message);
            case "weather" -> handleWeather(message);
            case "general" -> handleGeneralChat(message);
            default -> handleGeneralChat(message);
        };
    }

    /**
     * 计算器 Agent
     */
    private String handleCalculator(String message) {
        try {
            // 简单的表达式计算
            // 注意：实际应用中应该使用安全的表达式解析器
            if (message.matches(".*[0-9+\\-*/()]+.*")) {
                return "计算结果处理中...（实际应用需要集成数学计算库）";
            }
            return "请输入数学表达式，例如：2 + 3 * 4";
        } catch (Exception e) {
            return "计算出错：" + e.getMessage();
        }
    }

    /**
     * 知识库 Agent
     */
    private String handleKnowledge(String message) {
        // 简单的知识库问答模拟
        Map<String, String> knowledge = new HashMap<>();
        knowledge.put("java", "Java 是一门面向对象的编程语言，具有强大的跨平台能力");
        knowledge.put("spring", "Spring Framework 是 Java 企业级应用开发的标准框架");
        knowledge.put("agent", "Agent 是具有感知-决策-执行能力的智能体");
        knowledge.put("ai", "人工智能（AI）是计算机科学的一个分支");
        
        String lowerMessage = message.toLowerCase();
        for (Map.Entry<String, String> entry : knowledge.entrySet()) {
            if (lowerMessage.contains(entry.getKey())) {
                return "📚 知识回复：\n" + entry.getValue();
            }
        }
        
        return "知识库中未找到相关内容，请尝试其他问题";
    }

    /**
     * 天气 Agent（模拟）
     */
    private String handleWeather(String message) {
        if (message.contains("天气") || message.contains("weather")) {
            return "🌤️ 天气查询结果：\n" +
                   "当前温度：25°C\n" +
                   "天气：晴朗\n" +
                   "湿度：60%\n" +
                   "风力：3级\n" +
                   "建议：适合外出活动";
        }
        return "请输入包含'天气'或'weather'的问题";
    }

    /**
     * 通用对话 Agent
     */
    private String handleGeneralChat(String message) {
        // 这里可以集成真实的 LLM API
        // 目前返回智能的模拟响应
        
        if (message.contains("你好") || message.contains("hello") || message.contains("Hi")) {
            return "👋 你好！我是一个 Spring AI Alibaba Agent，很高兴认识你。\n" +
                   "我可以帮助你进行多种任务。请告诉我你需要什么帮助？";
        }
        
        if (message.contains("是什么") || message.contains("what is")) {
            return "这是一个很好的问题！为了给你更准确的回答，请提供更多上下文信息。";
        }
        
        if (message.contains("怎么") || message.contains("how")) {
            return "这是一个操作问题。请详细描述你想要完成什么，这样我可以给出更具体的步骤。";
        }
        
        if (message.contains("谢谢") || message.contains("thank")) {
            return "😊 不客气！很高兴能帮助你。还有其他问题吗？";
        }
        
        // 默认回复
        return "我理解了你的问题：" + message + "\n" +
               "这需要进一步的分析。我是一个智能 Agent，可以帮助你处理更多复杂的任务。\n" +
               "请尝试选择特定的 Agent 类型或提供更详细的信息。";
    }

    /**
     * 清空对话历史
     */
    public void clearConversation(String conversationId) {
        conversationHistory.remove(conversationId);
        log.info("Cleared conversation history for: {}", conversationId);
    }

    /**
     * 获取对话历史
     */
    public List<Map<String, String>> getConversationHistory(String conversationId) {
        return conversationHistory.getOrDefault(conversationId, new ArrayList<>());
    }
}
