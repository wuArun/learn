package com.arun.arun_learn.common;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.google.gson.Gson;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;

import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

/**
 *
 */
public class DynamicPOJO {
    private static String classString =
            " import java.util.Arrays;"
            + "public class Student{        "
            + "       private String  studentId;                      "
            + "       public String getStudentId(){                   "
            + "           return studentId;                           "
            + "       }                                               "
            + "       public String setStudentId(int studentId){      "
            + "           this.studentId = String.valueOf(studentId); "
            + "           return \"设置studentId为：\" + studentId;    "
            + "       }                                               "
            + "}                                                      ";

    private static void createStudent() throws Exception {

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        StandardJavaFileManager standardFileManager = compiler.getStandardFileManager(null, null, null);
        ClassJavaFileManager classJavaFileManager = new ClassJavaFileManager(standardFileManager);

    }

    private void executeMethod(ClassJavaFileManager classJavaFileManager) throws Exception {
        ClassJavaFileObject javaFileObject = classJavaFileManager.getClassJavaFileObject();
        ClassLoader classLoader = new MyClassLoader(javaFileObject);
        Object student = classLoader.loadClass("Student").newInstance();
        //student对象
        System.out.println("student-->" + student);
        //获取set方法
        Method setStudentId = student.getClass().getMethod("setStudentId", int.class);
        //使用对象赋值
        Object obj1 = setStudentId.invoke(student, 1);
        System.out.println("-->setStudentId-->" + setStudentId.toString() + "-->" + obj1);
        //获取get方法
        Method getStudentId = student.getClass().getMethod("getStudentId");
        //使用对象取值
        Object obj2 = getStudentId.invoke(student);
        System.out.println("-->getStudentId-->" + getStudentId.toString() + "-->" + obj2);
    }

    /**
     * 使用自定义类加载器
     * @param className 类名称
     * @param classString 类文件详情
     */
    private boolean loadClass(String className, String classString,ClassJavaFileManager classJavaFileManager) throws Exception {
        boolean result = false;
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        try {
            StringObject stringObject = new StringObject(new URI(className + JavaFileObject.Kind.SOURCE), JavaFileObject.Kind.SOURCE, classString);
            result = compiler.getTask(null, classJavaFileManager, null, null, null,
                    Collections.singletonList(stringObject)).call();
        } catch (Exception e) {
            System.out.println("执行错误");
        }
        return result;
    }


    /**    *自定义fileManager    */
    static class ClassJavaFileManager extends ForwardingJavaFileManager{
        private ClassJavaFileObject classJavaFileObject;
        public ClassJavaFileManager(JavaFileManager fileManager) {
            super(fileManager);
        }
        public ClassJavaFileObject getClassJavaFileObject() {
            return classJavaFileObject;
        }
        /**这个方法一定要自定义 */
        @Override
        public JavaFileObject getJavaFileForOutput(Location location, String className,
                                                   JavaFileObject.Kind kind, FileObject sibling) throws IOException {
            return (classJavaFileObject = new ClassJavaFileObject(className,kind));
        }
    }

    /**存储源文件*/
    static class StringObject extends SimpleJavaFileObject{
        private String content;
        public StringObject(URI uri, Kind kind, String content) {
            super(uri, kind);
            this.content = content;
        }
        //使JavaCompiler可以从content获取java源码
        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) throws IOException {
            return this.content;
        }
    }

    /**class文件（不需要存到文件中）*/
    static class ClassJavaFileObject extends SimpleJavaFileObject{
        ByteArrayOutputStream outputStream;

        public ClassJavaFileObject(String className, Kind kind) {
            super(URI.create(className + kind.extension), kind);
            this.outputStream = new ByteArrayOutputStream();
        }
        @Override
        public OutputStream openOutputStream() throws IOException {
            return this.outputStream;
        }
        //获取输出流为byte[]数组
        public byte[] getBytes(){
            return this.outputStream.toByteArray();
        }
    }

    /**自定义classloader*/
    static class MyClassLoader extends ClassLoader{
        private ClassJavaFileObject stringObject;
        public MyClassLoader(ClassJavaFileObject stringObject){
            this.stringObject = stringObject;
        }
        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            byte[] bytes = this.stringObject.getBytes();
            return defineClass(name,bytes,0,bytes.length);
        }
    }


    public static void main(String[] args) {
        String s = "在不？魔域2礼包领了吗，没领加\\/ ：  \"Jokes1990\"";
        Gson gson = new Gson();
        String replace = "{\"send_time\":1682330537,\"server_id\":1087,\"chat_channel\":\"2\",\"source_id\":286143606286222,\"source_name\":\"多拉哈蔓\",\"source_vip\":0,\"target_id\":0,\"target_name\":\"某某某某\",\"message\":\"在不？魔域2礼包领了吗，没领加\\/ ：  Jokes1990\",\"imei\":\"4e562f8ac848c1461795d0e0afc24b64\",\"plat\":\"android\",\"version\":\"1.0.133.19823\",\"remark\":\"0\",\"checkcode\":\"48b9f0fc83d5b8778ac8880b6dd2a3f1\"}".replace("\\", "\\\\");
        ClientChatEntity clientChatEntity = gson.fromJson(replace, ClientChatEntity.class);
        System.out.println(clientChatEntity.getMessage());
    }
}