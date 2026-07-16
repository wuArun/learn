package com.arun.agent.controller;

import com.arun.agent.dto.AgentRequest;
import com.arun.agent.dto.AgentResponse;
import com.arun.agent.service.AgentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Agent API 控制器
 * 提供 HTTP 端点供前端调用
 */
@Slf4j
@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    /**
     * 处理 Agent 请求
     * POST /api/agent/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<AgentResponse> chat(@RequestBody AgentRequest request) {
        log.info("Received chat request: {}", request);
        
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                AgentResponse.builder()
                    .status("error")
                    .errorMessage("Message cannot be empty")
                    .build()
            );
        }
        
        AgentResponse response = agentService.processRequest(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取对话历史
     * GET /api/agent/history/{conversationId}
     */
    @GetMapping("/history/{conversationId}")
    public ResponseEntity<?> getHistory(@PathVariable String conversationId) {
        log.info("Getting conversation history for: {}", conversationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("history", agentService.getConversationHistory(conversationId));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 清空对话历史
     * DELETE /api/agent/history/{conversationId}
     */
    @DeleteMapping("/history/{conversationId}")
    public ResponseEntity<?> clearHistory(@PathVariable String conversationId) {
        log.info("Clearing conversation history for: {}", conversationId);
        
        agentService.clearConversation(conversationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Conversation history cleared");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 健康检查端点
     * GET /api/agent/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Agent service is running");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取可用的 Agent 类型
     * GET /api/agent/types
     */
    @GetMapping("/types")
    public ResponseEntity<?> getAgentTypes() {
        Map<String, Object> response = new HashMap<>();
        response.put("types", new String[]{
            "general",      // 通用对话
            "calculator",   // 计算器
            "knowledge",    // 知识库
            "weather"       // 天气查询
        });
        response.put("descriptions", new HashMap<String, String>() {{
            put("general", "通用智能对话 Agent");
            put("calculator", "数学计算 Agent");
            put("knowledge", "知识库问答 Agent");
            put("weather", "天气查询 Agent");
        }});
        
        return ResponseEntity.ok(response);
    }

    /**
     * 异常处理
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        log.error("Error occurred", e);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "error");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
