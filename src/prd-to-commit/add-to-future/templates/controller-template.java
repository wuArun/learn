package com.catlbattery.api.controller.v1.{module};

import com.catl.rosefinch.monitor.op.annotation.OperatorAudit;
import com.catlbattery.app.service.{ResourceName}Service;
import com.catlbattery.common.constant.ErrorCodeConstants;
import com.catlbattery.common.service.CommonService;
import com.catlbattery.domain.dto.vo.ResultVo;
import com.catlbattery.domain.dto.vo.ResultVoUtil;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}DTO;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}QueryDTO;
import com.catlbattery.domain.dto.{resourceName}.{ResourceName}ReqDTO;
import com.catlbattery.translate.annoation.TranslateQueryList;
import com.github.pagehelper.PageInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {功能描述} Controller
 *
 * @author {author} {date}
 */
@Tag(name = "{ResourceName}Controller", description = "{功能描述}")
@RestController
@RequestMapping("/v1/{resource-path}")
@RequiredArgsConstructor
@Slf4j
public class {ResourceName}Controller {

    private final {ResourceName}Service {resourceName}Service;

    /**
     * 分页查询{功能描述}列表
     *
     * @param pageNum  页码
     * @param pageSize 每页条数
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    @Operation(summary = "分页查询{功能描述}列表")
    @GetMapping("/getPageList")
    @TranslateQueryList(databaseSchema = "apqp", resultNodeName = "list")
    public ResultVo<PageInfo<{ResourceName}DTO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            {ResourceName}QueryDTO queryDTO) {
        PageInfo<{ResourceName}DTO> pageInfo = {resourceName}Service.page(pageNum, pageSize, queryDTO);
        return ResultVoUtil.success(pageInfo);
    }

    /**
     * 根据ID查询{功能描述}详情
     *
     * @param id 主键ID
     * @return 详情信息
     */
    @Operation(summary = "根据ID查询{功能描述}详情")
    @PostMapping("/getById")
    public ResultVo<{ResourceName}DTO> getById(@RequestBody {ResourceName}ReqDTO reqDTO) {
        {ResourceName}DTO dto = {resourceName}Service.getById(reqDTO.getId());
        return ResultVoUtil.success(dto);
    }

    /**
     * 新增{功能描述}
     *
     * @param reqDTO 新增数据
     * @return 新增结果
     */
    @Operation(summary = "新增{功能描述}")
    @PostMapping("/add")
    @OperatorAudit("新增{功能描述}")
    public ResultVo<{ResourceName}DTO> add(@Valid @RequestBody {ResourceName}ReqDTO reqDTO) {
        {ResourceName}DTO resultDTO = {resourceName}Service.add(reqDTO);
        return ResultVoUtil.success(resultDTO);
    }

    /**
     * 更新{功能描述}
     *
     * @param reqDTO 更新数据
     * @return 更新结果
     */
    @Operation(summary = "更新{功能描述}")
    @PutMapping("/update")
    @OperatorAudit("更新{功能描述}")
    public ResultVo<{ResourceName}DTO> update(@Valid @RequestBody {ResourceName}ReqDTO reqDTO) {
        {ResourceName}DTO resultDTO = {resourceName}Service.update(reqDTO);
        return ResultVoUtil.success(resultDTO);
    }

    /**
     * 删除{功能描述}
     *
     * @param reqDTO 删除参数（含ID）
     * @return 操作结果
     */
    @Operation(summary = "删除{功能描述}")
    @PostMapping("/deleteById")
    @OperatorAudit("删除{功能描述}")
    public ResultVo<Boolean> deleteById(@RequestBody {ResourceName}ReqDTO reqDTO) {
        {resourceName}Service.deleteById(reqDTO.getId());
        return ResultVoUtil.success(true);
    }
}