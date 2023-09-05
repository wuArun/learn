package com.arun.arun_learn.function;

import java.util.List;
import java.util.Map;

public interface IndexFactory {
    List getResponse(String source);
    Map<String, Float> keywordFields();
}
