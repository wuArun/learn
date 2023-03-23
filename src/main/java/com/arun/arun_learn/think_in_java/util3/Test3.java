package com.arun.arun_learn.think_in_java.util3;

import java.util.Random;

/**
 * @program: learn
 * @ClassName Test3
 * @description:编写一个计算速度的程序，它所使用的距离和时间都是常量
 * @author: wurunxiang
 * @create: 2023-03-18 21:24
 * @email: wurunx@gmail.com
 **/
public class Test3 {

    private static final int LENGTH = 100;

    private static final int TIME = 2;

    private Random random = new Random(20);

    public static void main(String[] args) throws Throwable {
        Integer i1 = new Integer(47);
        Integer i2 = new Integer(47);
        System.out.println(i1.hashCode());
        System.out.println(i2.hashCode());
        System.out.println(i1.equals(i2));
        Test3 test3 = new Test3();
        for (int i = 0; i < 100; i++) {
            System.out.println(test3.calculateSpeed());
        }
    }

    private int calculateSpeed() {
        return random.nextInt() * TIME;
    }

    @Override
    protected void finalize() throws Throwable {
        System.out.println("调用了finalize方法");
    }
}
