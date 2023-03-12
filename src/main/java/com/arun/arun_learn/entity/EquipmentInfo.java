package com.arun.arun_learn.entity;

import java.util.Date;

/**
 * @program: learn
 * @ClassName EquipmentInfo
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-12 22:06
 * @email: wurunx@gmail.com
 **/
public class EquipmentInfo {

    private int id;
    private String equipmentNumber;
    private int scanCount;
    private Date createTime;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getEquipmentNumber() {
        return equipmentNumber;
    }

    public void setEquipmentNumber(String equipmentNumber) {
        this.equipmentNumber = equipmentNumber;
    }

    public int getScanCount() {
        return scanCount;
    }

    public void setScanCount(int scanCount) {
        this.scanCount = scanCount;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }
}
