package com.arun.arun_learn.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @ClassName Head
 * @Description TODO
 * @Author wurunxiang
 * @DATE 2023/11/27 11:11
 * @VERSION 1.0
 */
public class Head {

    private String headName;

    private int amount;

    private List<String> groupNames;

    private List<Group> groupList;

    public String getHeadName() {
        return headName;
    }

    public void setHeadName(String headName) {
        this.headName = headName;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public boolean addGroupName(String groupName) {
        if (groupNames == null) {
            groupNames = new ArrayList<>(64);
        }
        return groupNames.add(groupName);
    }

    public List<String> getGroupNames() {
        return groupNames;
    }

    public boolean addGroup(Group group) {
        if (groupList == null) {
            groupList = new ArrayList<>(64);
        }
        return groupList.add(group);
    }

    public List<Group> getGroupList() {
        return groupList;
    }
}
