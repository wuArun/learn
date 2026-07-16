package com.arun.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Agent 响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponse {
    /**
     * 回复内容
     */
    private String reply;

    /**
     * 对话 ID
     */
    private String conversationId;

    /**
     * 状态：success, error
     */
    private String status;

    /**
     * 错误消息（如果有）
     */
    private String errorMessage;

    /**
     * Agent 执行时间（毫秒）
     */
    private Long executionTime;
}
