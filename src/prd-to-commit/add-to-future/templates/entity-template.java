package com.catlbattery.domain.entity.{resourceName};

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.catlbattery.dto.BaseEntity;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * {功能描述} 实体
 *
 * @author {author} {date}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "{功能描述}表")
@JsonInclude(JsonInclude.Include.NON_NULL)
@TableName("{table_name}")
@EqualsAndHashCode
public class {ResourceName}Entity extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "{table_prefix}_id", type = IdType.ASSIGN_ID)
    @Schema(description = "主键")
    private String id;

    @Schema(description = "{功能描述}编码")
    @TableField(value = "{table_prefix}_code")
    private String {resourcePrefix}Code;

    @Schema(description = "{功能描述}名称")
    @TableField(value = "{table_prefix}_name")
    private String {resourcePrefix}Name;

    @Schema(description = "状态 0-禁用 1-启用")
    @TableField(value = "status")
    private Integer status;

    @Schema(description = "排序号")
    @TableField(value = "sort_order")
    private Integer sortOrder;

    @Schema(description = "开始日期")
    @TableField(value = "start_date", updateStrategy = FieldStrategy.IGNORED)
    private LocalDate startDate;

    @Schema(description = "结束日期")
    @TableField(value = "end_date", updateStrategy = FieldStrategy.IGNORED)
    private LocalDate endDate;

    @Schema(description = "备注")
    @TableField(value = "remark")
    private String remark;
}