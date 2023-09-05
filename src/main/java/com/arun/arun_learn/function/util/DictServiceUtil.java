package com.arun.arun_learn.function.util;

import com.arun.arun_learn.function.IndexEnum;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * @ClassName DictServiceUtil
 * @Description TODO
 * @Author wurunxiang
 * @DATE 2023/9/5 11:14
 * @VERSION 1.0
 */
public class DictServiceUtil {

    private static DictServiceUtil instance;

    private DictServiceUtil(){}

    public static DictServiceUtil getInstance() {
        if (instance == null) {
            instance = new DictServiceUtil();
            DICT_MAP.put("测试", dictType -> getEnumByType(dictType));
        }
        return instance;
    }

    private static Map<String, Function<String, List>> DICT_MAP = new HashMap<>(10);

    public List getDictMapByType(String type) {
        List result = new ArrayList();
        Function<String, List> lists = DICT_MAP.get(type);
        if (lists != null) {
            //执行这段表达式获得String类型的结果
            result = lists.apply(type);
        }
        return result;
    }

    public static List getEnumByType(String type) {
        return IndexEnum.getOption(type).getResponse(type);
    }
}
