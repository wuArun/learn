package com.catlbattery.infra.mapper;

import com.catlbattery.domain.dto.{resourceName}.{ResourceName}QueryDTO;
import com.catlbattery.domain.entity.{resourceName}.{ResourceName}Entity;
import com.github.yulichang.base.MPJBaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * {功能描述} Mapper 接口
 *
 * 注意：禁止使用 @Select/@Update/@Insert/@Delete 注解定义 SQL，
 * 所有 SQL 必须写在 src/main/resources/mapper/{ResourceName}Mapper.xml 中。
 *
 * @author {author} {date}
 */
@Mapper
public interface {ResourceName}Mapper extends MPJBaseMapper<{ResourceName}Entity> {

    /**
     * 根据条件分页查询{功能描述}列表
     *
     * @param condition 查询条件
     * @return 实体列表
     */
    List<{ResourceName}Entity> selectByCondition(@Param("condition") {ResourceName}QueryDTO condition);

    /**
     * 根据ID列表批量查询
     *
     * @param ids ID列表
     * @return 实体列表
     */
    List<{ResourceName}Entity> selectByIds(@Param("ids") List<String> ids);

    /**
     * 逻辑删除（软删除）
     *
     * @param id       主键ID
     * @param operator 操作人
     * @return 影响行数
     */
    int logicalDeleteById(@Param("id") String id, @Param("operator") String operator);
}