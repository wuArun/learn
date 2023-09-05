package com.arun.arun_learn.function;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public enum IndexEnum implements IndexFactory{

    TEST("测试","test"){
        @Override
        public List getResponse(String source) {
            return Arrays.asList(1,2,3);
        }

        @Override
        public Map<String, Float> keywordFields() {
            HashMap<String, Float> fields = new HashMap<>(1);
            fields.put("你好", 1F);
            fields.put("世界", 2F);
            return fields;
        }
    };

    private String chName;
    private String testIndex;

    private static final Gson GSON = new GsonBuilder().create();


    IndexEnum(String chName, String testIndex) {
        this.chName = chName;
        this.testIndex = testIndex;
    }

    public String chName() {
        return chName;
    }

    public String testIndex() {
        return testIndex;
    }

    public static IndexEnum getOption(String key) {
        IndexEnum[] values = IndexEnum.values();
        for (IndexEnum value : values) {
            if (key.equals(value.chName)) {
                return value;
            }
        }
        return null;
    }
}
