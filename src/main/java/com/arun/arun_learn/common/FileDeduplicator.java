package com.arun.arun_learn.common;

import java.io.*;
import java.util.HashSet;
import java.util.Set;

public class FileDeduplicator {

    public static void main(String[] args) {
        String inputFilePath = "D:\\Users\\Public\\Documents\\imData\\im\\257221@nd\\RecvFile\\江洪_880831\\10.35.5.181\\mygm.99.com\\util\\data\\sql_slow\\202409\\jdbc.txt";  // 输入文件路径
        String outputFilePath = "D:\\Users\\Public\\Documents\\imData\\im\\257221@nd\\RecvFile\\江洪_880831\\10.35.5.181\\mygm.99.com\\util\\data\\sql_slow\\202409\\jdbcFileDeduplicator.txt"; // 输出文件路径

        Set<String> uniqueLines = new HashSet<>();  // 用于存储去重后的行

        // 读取文件并去重
        try (BufferedReader reader = new BufferedReader(new FileReader(inputFilePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                uniqueLines.add(line);  // 使用 Set 自动去重
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 将去重后的行写入新文件
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            for (String uniqueLine : uniqueLines) {
                writer.write(uniqueLine);
                writer.newLine();  // 换行
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("去重完成，已将结果写入文件: " + outputFilePath);
    }
}
