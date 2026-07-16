package com.catlbattery.app.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import com.catl.rosefinch.core.exception.CommonException;
import com.catl.rosefinch.core.oauth.CustomUserDetails;
import com.catl.rosefinch.core.oauth.SecurityContextHelper;
import com.catlbattery.app.service.{ResourceName}Service;
import com.catlbattery.common.constant.ErrorCodeConstants;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}DTO;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}QueryDTO;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}ReqDTO;
import com.catlbattery.domain.entity.{resourceName}.{ResourceName}Entity;
import com.catlbattery.infra.mapper.{ResourceName}Mapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.github.yulichang.base.MPJBaseServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * {功能描述} Service 实现
 *
 * @author {author} {date}
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class {ResourceName}ServiceImpl
        extends MPJBaseServiceImpl<{ResourceName}Mapper, {ResourceName}Entity>
        implements {ResourceName}Service {

    private final {ResourceName}Mapper {resourceName}Mapper;

    @Override
    public PageInfo<{ResourceName}DTO> page(Integer pageNum, Integer pageSize, {ResourceName}QueryDTO queryDTO) {
        log.info("[page] 开始分页查询{功能描述}, pageNum: {}, pageSize: {}, condition: {}", pageNum, pageSize, queryDTO);

        long startTime = System.currentTimeMillis();

        // 分页查询
        PageInfo<{ResourceName}Entity> pageInfo = PageHelper.startPage(pageNum, pageSize)
                .doSelectPageInfo(() -> {resourceName}Mapper.selectByCondition(queryDTO));

        List<{ResourceName}Entity> records = pageInfo.getList();
        if (CollUtil.isEmpty(records)) {
            log.info("[page] 无数据, 耗时: {}ms", System.currentTimeMillis() - startTime);
            return new PageInfo<>();
        }

        // Entity -> DTO 转换
        List<{ResourceName}DTO> dtoList = records.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        PageInfo<{ResourceName}DTO> result = new PageInfo<>();
        result.setList(dtoList);
        result.setTotal(pageInfo.getTotal());
        result.setPageNum(pageInfo.getPageNum());
        result.setPageSize(pageInfo.getPageSize());

        log.info("[page] 查询完成, 共{}条数据, 耗时: {}ms", dtoList.size(), System.currentTimeMillis() - startTime);
        return result;
    }

    @Override
    public {ResourceName}DTO getById(String id) {
        {ResourceName}Entity entity = {resourceName}Mapper.selectById(id);
        if (entity == null) {
            log.warn("[getById] {功能描述}不存在, id: {}", id);
            throw new CommonException(ErrorCodeConstants.APQP_PROCESS_NOT_EXISTS);
        }
        return toDTO(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public {ResourceName}DTO add({ResourceName}ReqDTO reqDTO) {
        log.info("[add] 开始新增{功能描述}, req: {}", reqDTO);

        // 参数校验
        // TODO: 添加业务校验逻辑

        // DTO -> Entity 转换
        {ResourceName}Entity entity = toEntity(reqDTO);

        // 保存
        {resourceName}Mapper.insert(entity);

        log.info("[add] 新增{功能描述}成功, id: {}", entity.getId());
        return toDTO(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public {ResourceName}DTO update({ResourceName}ReqDTO reqDTO) {
        log.info("[update] 开始更新{功能描述}, id: {}", reqDTO.getId());

        // 检查是否存在
        {ResourceName}Entity existing = {resourceName}Mapper.selectById(reqDTO.getId());
        if (existing == null) {
            log.warn("[update] {功能描述}不存在, id: {}", reqDTO.getId());
            throw new CommonException(ErrorCodeConstants.APQP_PROCESS_NOT_EXISTS);
        }

        // 更新
        {ResourceName}Entity entity = toEntity(reqDTO);
        entity.setId(reqDTO.getId());
        {resourceName}Mapper.updateById(entity);

        log.info("[update] 更新{功能描述}成功, id: {}", entity.getId());
        return toDTO(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteById(String id) {
        log.info("[deleteById] 开始删除{功能描述}, id: {}", id);

        // 检查是否存在
        {ResourceName}Entity existing = {resourceName}Mapper.selectById(id);
        if (existing == null) {
            log.warn("[deleteById] {功能描述}不存在, id: {}", id);
            throw new CommonException(ErrorCodeConstants.APQP_PROCESS_NOT_EXISTS);
        }

        // 逻辑删除
        {resourceName}Mapper.logicalDeleteById(id, SecurityContextHelper.getUserDetails().getUsername());

        log.info("[deleteById] 删除{功能描述}成功, id: {}", id);
    }

    // ========== 批量获取 + Map 匹配示例（重要规范） ==========

    /**
     * 根据ID列表批量查询并转换为DTO（示例：批量获取 + Map 匹配模式）
     * <p>
     * 规范要求：禁止在 for 循环中调用外部接口或中间件。
     * 必须：先批量获取全部数据 → 转为 Map → 循环中用 Map 匹配。
     */
    public List<{ResourceName}DTO> listByIds(List<String> ids) {
        if (CollUtil.isEmpty(ids)) {
            return new ArrayList<>();
        }

        // 步骤1: 一次批量查询
        List<{ResourceName}Entity> entities = {resourceName}Mapper.selectByIds(ids);

        // 步骤2: 转为 Map，key=主键，value=实体
        Map<String, {ResourceName}Entity> entityMap = entities.stream()
                .collect(Collectors.toMap({ResourceName}Entity::getId, Function.identity()));

        // 步骤3: 按入参顺序组装结果（直接从 Map 获取，无循环内外部调用）
        List<{ResourceName}DTO> dtoList = new ArrayList<>();
        for (String id : ids) {
            {ResourceName}Entity entity = entityMap.get(id);
            if (entity != null) {
                dtoList.add(toDTO(entity));
            }
        }
        return dtoList;
    }

    // ========== 转换方法 ==========

    private {ResourceName}DTO toDTO({ResourceName}Entity entity) {
        if (entity == null) {
            return null;
        }
        // TODO: 使用 ModelMapper 或手动转换
        {ResourceName}DTO dto = new {ResourceName}DTO();
        // dto.setField(entity.getField());
        return dto;
    }

    private {ResourceName}Entity toEntity({ResourceName}ReqDTO reqDTO) {
        if (reqDTO == null) {
            return null;
        }
        // TODO: 使用 ModelMapper 或手动转换
        {ResourceName}Entity entity = new {ResourceName}Entity();
        // entity.setField(reqDTO.getField());
        return entity;
    }
}