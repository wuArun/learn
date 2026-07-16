package com.arun.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Agent 请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentRequest {
    /**
     * 用户输入的问题/指令
     */
    private String message;

    /**
     * 对话历史
     */
    private String conversationId;

    /**
     * Agent 类型
     */
    private String agentType;
}
