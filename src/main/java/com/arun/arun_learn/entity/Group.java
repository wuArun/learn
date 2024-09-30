package com.arun.arun_learn.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @ClassName Group
 * @Description TODO
 * @Author wurunxiang
 * @DATE 2023/11/27 10:48
 * @VERSION 1.0
 */
public class Group {

    private String groupName;

    private int amount;

    private List<String> serverNames;

    private List<ServerEntity> serverEntities;

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public boolean addServerName(String serverName) {
        if (serverNames == null) {
            serverNames = new ArrayList<>(32);
        }
        return serverNames.add(serverName);
    }

    public boolean addServerEntity(ServerEntity serverEntity) {
        if (serverEntities == null) {
            serverEntities = new ArrayList<>(64);
        }
        return serverEntities.add(serverEntity);
    }

    public List<ServerEntity> getServerEntities() {
        return serverEntities;
    }
}
