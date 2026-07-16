package com.catlbattery.app.service;

import com.catlbattery.domain.dto.{resourceName}.{ResourceName}DTO;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}QueryDTO;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}ReqDTO;
import com.catlbattery.domain.entity.{resourceName}.{ResourceName}Entity;
import com.github.pagehelper.PageInfo;
import com.github.yulichang.base.MPJBaseService;

import java.util.List;

/**
 * {功能描述} Service 接口
 *
 * @author {author} {date}
 */
public interface {ResourceName}Service extends MPJBaseService<{ResourceName}Entity> {

    /**
     * 分页查询{功能描述}列表
     *
     * @param pageNum  页码
     * @param pageSize 每页条数
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageInfo<{ResourceName}DTO> page(Integer pageNum, Integer pageSize, {ResourceName}QueryDTO queryDTO);

    /**
     * 根据ID查询{功能描述}详情
     *
     * @param id 主键ID
     * @return 详情信息
     */
    {ResourceName}DTO getById(String id);

    /**
     * 新增{功能描述}
     *
     * @param reqDTO 新增数据
     * @return 新增结果
     */
    {ResourceName}DTO add({ResourceName}ReqDTO reqDTO);

    /**
     * 更新{功能描述}
     *
     * @param reqDTO 更新数据
     * @return 更新结果
     */
    {ResourceName}DTO update({ResourceName}ReqDTO reqDTO);

    /**
     * 删除{功能描述}
     *
     * @param id 主键ID
     */
    void deleteById(String id);
}