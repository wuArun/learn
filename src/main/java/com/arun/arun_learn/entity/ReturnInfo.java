package com.arun.arun_learn.entity;

import com.arun.arun_learn.common.Constants;

import java.io.Serializable;

/**
 * @program: learn
 * @ClassName ReturnInfo
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-12 21:23
 * @email: wurunx@gmail.com
 **/
public class ReturnInfo<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private Boolean success;
    private Integer code;
    private String msg;
    private T data;
    private Long total; // 分页信息：总条数

    public ReturnInfo(){
        setSuccess(false);
        setCode(Constants.FAIL_CODE);
        setMsg(Constants.FAIL_MSG);
        setTotal(0L);
        setData(null);
    }

    public ReturnInfo(Boolean success, Integer code, String msg, T data, Long total) {
        this.success = success;
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.total = total;
    }

    public void  successInfo(Integer code, String msg, T data, Long total){
        setSuccess(true);
        setCode(code);
        setMsg(msg);
        setData(data);
        setTotal(total);
    }

    public void  errorInfo(Integer code, String msg, T data, Long total){
        setSuccess(false);
        setCode(code);
        setMsg(msg);
        setData(data);
        setTotal(total);
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
