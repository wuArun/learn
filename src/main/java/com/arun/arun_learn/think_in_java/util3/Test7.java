package com.arun.arun_learn.think_in_java.util3;

import java.util.Random;

/**
 * @program: learn
 * @ClassName Test7
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-18 21:46
 * @email: wurunx@gmail.com
 **/
public class Test7 {

    private static final int ONE = 1;
    private static final int TWO = 2;

    public static void main(String[] args) {
        Long i = 0123L;
        System.out.println(Long.toBinaryString(i));
        Long i2 = 0x0124L;
        System.out.println(Long.toBinaryString(i2));
    }
}
