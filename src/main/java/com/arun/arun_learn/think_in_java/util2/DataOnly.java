package com.arun.arun_learn.think_in_java.util2;

/**
 * @program: learn
 * @ClassName DataOnly
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-18 21:03
 * @email: wurunx@gmail.com
 **/
public class DataOnly {

    int i;
    double d;
    boolean b;

    int storage(String s) {
        return s.length() * 2;
    }

    public static void main(String[] args) {
        System.out.println("println no.3 param" + args[2]);
    }
}
