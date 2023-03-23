package com.arun.arun_learn.think_in_java.util3;

import java.security.cert.PKIXParameters;

/**
 * @program: learn
 * @ClassName BitOperator
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-19 10:49
 * @email: wurunx@gmail.com
 **/
public class BitOperator {
    public static void main(String[] args) {
        BitOperator bitOperator = new BitOperator();
        /*bitOperator.print(0x902313);
        System.out.println("===============================");
        bitOperator.print(Integer.MAX_VALUE);*/
        char[] cs = new char[]{'1','a','!','操','l','Z'};
        for (int i = 0; i < cs.length; i++) {
            bitOperator.printChar(cs[i]);
        }
    }

    private void print(Integer l1){
        int size = Integer.toBinaryString(l1).toString().length();
        System.out.println(size);
        for (int i = 0; i < size; i++) {
            System.out.println(Integer.toBinaryString(l1));
            System.out.println(l1 >>= 1);
        }
    }

    private void printChar(char param){
        System.out.println("char：" + param + "，char对应的数字：" + (int) param + "，char对应的二进制字符串：" + Integer.toBinaryString(param));
    }
}
