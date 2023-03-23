package com.arun.arun_learn.think_in_java.util3;

import java.text.MessageFormat;

/**
 * @program: learn
 * @ClassName Test5
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-18 21:39
 * @email: wurunx@gmail.com
 **/
public class Test5 {

    public static void main(String[] args) {
        Dog d1 = new Dog();
        d1.name = "spot";
        d1.says = "Ruff!";
        Dog d2 = new Dog();
        d2.name = "scruffy";
        d2.says = "Wurf!";
        System.out.println(d1.println() + "\r\n" + d2.println());
        Dog d3 = d1;
        System.out.println(d1 == d3);
        System.out.println(d1.equals(d3));
    }
}

class Dog {
    String name;
    String says;

    String println() {
        return MessageFormat.format("名字：{0}，叫声：{1}", name, says);
    }
}
