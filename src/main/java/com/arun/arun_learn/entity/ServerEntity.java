package com.arun.arun_learn.entity;

import java.io.Serializable;

/**
 * @ClassName ServerEntity
 * @Description TODO
 * @Author wurunxiang
 * @DATE 2023/11/24 14:22
 * @VERSION 1.0
 */
public class ServerEntity implements Serializable {

    private String headName;

    private String group_id;

    private String index;

    private String area_id;

    private String area_show_name;

    private String name;

    private String address;

    private String port;

    private String server_id;

    private String server_name;

    private String server_show_name;

    private String status_mark = "0";

    private String is_inner = "0";

    private String key_ip;

    private String key_port;

    private String bind_ip;

    private String bind_port;

    private String pic;

    private String max_delay;

    public String getArea_id() {
        return area_id;
    }

    public void setArea_id(String area_id) {
        this.area_id = area_id;
    }

    public String getArea_show_name() {
        return area_show_name;
    }

    public void setArea_show_name(String area_show_name) {
        this.area_show_name = area_show_name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getServer_id() {
        return server_id;
    }

    public void setServer_id(String server_id) {
        this.server_id = server_id;
    }

    public String getServer_show_name() {
        return server_show_name;
    }

    public void setServer_show_name(String server_show_name) {
        this.server_show_name = server_show_name;
    }

    public String getStatus_mark() {
        return status_mark;
    }

    public void setStatus_mark(String status_mark) {
        this.status_mark = status_mark;
    }

    public String getIs_inner() {
        return is_inner;
    }

    public void setIs_inner(String is_inner) {
        this.is_inner = is_inner;
    }

    public String getKey_ip() {
        return key_ip;
    }

    public void setKey_ip(String key_ip) {
        this.key_ip = key_ip;
    }

    public String getKey_port() {
        return key_port;
    }

    public void setKey_port(String key_port) {
        this.key_port = key_port;
    }

    public String getBind_ip() {
        return bind_ip;
    }

    public void setBind_ip(String bind_ip) {
        this.bind_ip = bind_ip;
    }

    public String getBind_port() {
        return bind_port;
    }

    public void setBind_port(String bind_port) {
        this.bind_port = bind_port;
    }

    public String getPic() {
        return pic;
    }

    public void setPic(String pic) {
        this.pic = pic;
    }

    public String getMax_delay() {
        return max_delay;
    }

    public void setMax_delay(String max_delay) {
        this.max_delay = max_delay;
    }

    public String getServer_name() {
        return server_name;
    }

    public void setServer_name(String server_name) {
        this.server_name = server_name;
    }

    public String getGroup_id() {
        return group_id;
    }

    public void setGroup_id(String group_id) {
        this.group_id = group_id;
    }

    public String getIndex() {
        return index;
    }

    public void setIndex(String index) {
        this.index = index;
    }

    public String getHeadName() {
        return headName;
    }

    public void setHeadName(String headName) {
        this.headName = headName;
    }
}
