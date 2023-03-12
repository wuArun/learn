package com.arun.arun_learn.common;

/**
 * @program: learn
 * @ClassName Constants
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-12 21:31
 * @email: wurunx@gmail.com
 **/
public class Constants {

    public final static String MYSQL_DRIVER="com.mysql.cj.jdbc.Driver";

    public final static int OK_CODE = 200;
    public final static int FAIL_CODE = 400;
    public final static int OTHER_FAIL_CODE = 333;    // 其它错误
    public final static String OK_MSG = "请求成功";
    public final static String FAIL_MSG = "请求失败";
    public final static int STATUS_0 = 0;   // 可用状态
    public final static int STATUS_1 = 1;   // 禁用状态

    /**
     * 用户文件上传基础路径
     */
    public final static String BASE_USER_FILE_PATH = "userFile";
}
