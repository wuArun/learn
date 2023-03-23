package com.arun.arun_learn.think_in_java.util4;

import org.apache.commons.lang.StringUtils;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * @program: learn
 * @ClassName Test1
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-23 06:53
 * @email: wurunx@gmail.com
 **/
public class Test1 {

    public static void main(String[] args) {
        Random random = new Random();
        new Test1().test1();
    }

    private void test1() {
        for (int i = 0; i <= 100; i++) {
            if (i == 99) {
                return;
            }
            System.out.println(i);
        }
    }

    private void test2(Random random, int value) {
        for (int i = 0; ; i++) {
            int randomInt = random.nextInt(25);
            if (randomInt > value) {
                System.out.println(MessageFormat.format("第 {2} 次, 当前值 {0} 大于value {1} ", randomInt, value, i));
            } else if (randomInt == value) {
                System.out.println(MessageFormat.format("第 {2} 次，当前值 {0} 等于value {1} ", randomInt, value, i));
                return;
            } else {
                System.out.println(MessageFormat.format("第 {2} 次，当前值 {0} 小于value {1} ", randomInt, value, i));
            }
        }
    }

    private void test4() {
        List<Integer> integers = new ArrayList<>(100);
        for (int i = 3; ; i++) {
            for (int j = 2; j < i; j++) {
                if (i % j == 0) {
                    break;
                } else if (j == i - 1) {
                    integers.add(i);
                    if (integers.size() == 100) {
                        System.out.println(StringUtils.join(integers.toArray(), ","));
                        return;
                    }
                }
            }
        }
    }
}

class IfElse2 {
    static int test(int testval, int target) {
        if (testval > target)
            return +1;
        else if (testval < testval)
            return -1;
        else
            return 0;
    }

    static int test(int testval, int target, int begin, int end) {
        if (testval >= begin && testval <= end)
            return +1;
        else
            return 0;
    }

    public static void main(String[] args) {
        System.out.println(test(10, 5, 10, 20));
        System.out.println(test(5, 10));
        System.out.println(test(5, 5));
    }
}

class SwitchTest {
    public static void main(String[] args) {
        new SwitchTest().test(1);
    }

    private void test(int val) {
        switch (val) {
            case 1:
                System.out.println(1);
                break;
            case 2:
                System.out.println(2);
                break;
            case 3:
                System.out.println(3);
                break;
            default:
                System.out.println("defaut");
        }
    }
}

class Fibonacci {
    public static void main(String[] args) {
        new Fibonacci().test(100);
    }

    private void test(int size) {
        List<Integer> result = new ArrayList<>(10);
        result.add(1);
        result.add(1);
        for (int i = result.size(); i < size; i++) {
            result.add(result.get(i - 1) + result.get(i - 2));
        }
        System.out.println(StringUtils.join(result.toArray(), ","));
    }
}

class DanForhan {
    public static void main(String[] args) {
        System.out.println(new DanForhan().test());
    }

    private List<DanForhanEntity> test() {
        long startTime = System.currentTimeMillis() / 1000;
        List<DanForhanEntity> results = new ArrayList<>(10);
        for (int i = 1000; i < 10000; i++) {
            if (i % 100 == 0) {
                continue;
            }
            for (int j = 10; j < 100; j++) {
                for (int k = 0; k < 100; k++) {
                    if (i == j * k && indexOf(i, j, k)) {
                        results.add(new DanForhanEntity(i, j, k));
                    }
                }
            }
        }
        long endTime = System.currentTimeMillis() / 1000;
        System.out.println(MessageFormat.format("耗时 {0} 秒", endTime - startTime));
        return results;
    }

    private boolean indexOf(int source, int val1, int val2) {
        HashMap<Character, Boolean> sourceMap = StringToCharMap(String.valueOf(source));
        HashMap<Character, Boolean> val1Map = StringToCharMap(String.valueOf(val1));
        HashMap<Character, Boolean> val2Map = StringToCharMap(String.valueOf(val2));
        val1Map.keySet().forEach(val1Kye -> {
            if (sourceMap.containsKey(val1Kye)) {
                sourceMap.replace(val1Kye, false, true);
            }
        });
        val2Map.keySet().forEach(val2Kye -> {
            if (sourceMap.containsKey(val2Kye)) {
                sourceMap.replace(val2Kye, false, true);
            }
        });
        if (sourceMap.containsValue(false)) {
            return false;
        } else {
            return true;
        }
    }

    private HashMap<Character, Boolean> StringToCharMap(String source) {
        HashMap<Character, Boolean> map = new HashMap<>(source.length());
        for (Character c : source.toCharArray()) {
            map.put(c, false);
        }
        return map;
    }
}

class DanForhanEntity {
    private int val1;
    private int val2;
    private int result;

    public DanForhanEntity(int val1, int val2, int result) {
        this.val1 = val1;
        this.val2 = val2;
        this.result = result;
    }

    public int getVal1() {
        return val1;
    }

    public void setVal1(int val1) {
        this.val1 = val1;
    }

    public int getVal2() {
        return val2;
    }

    @Override
    public String toString() {
        return "DanForhanEntity{" +
                "val1=" + val1 +
                ", val2=" + val2 +
                ", result=" + result +
                '}' + "\r\n";
    }

    public void setVal2(int val2) {
        this.val2 = val2;
    }

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }
}