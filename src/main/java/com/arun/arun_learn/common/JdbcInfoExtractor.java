package com.arun.arun_learn.common;

import java.io.*;
import java.text.MessageFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JdbcInfoExtractor {

    public static void main(String[] args) {
        String directoryPath = "D:\\Users\\Public\\Documents\\imData\\im\\257221@nd\\RecvFile\\江洪_880831\\10.35.5.181\\mygm.99.com\\util\\data\\sql_slow\\202409";  // 指定文件夹路径
        String outputFilePath = "D:\\Users\\Public\\Documents\\imData\\im\\257221@nd\\RecvFile\\江洪_880831\\10.35.5.181\\mygm.99.com\\util\\data\\sql_slow\\202409\\jdbc.txt"; // 指定输出文件路径
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            readAllFilesInDirectory(directoryPath, writer);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 读取文件夹下所有文件，并写入提取的JDBC信息
    private static void readAllFilesInDirectory(String directoryPath, BufferedWriter writer) {
        File folder = new File(directoryPath);

        if (!folder.exists()) {
            System.out.println("目录不存在！");
            return;
        }

        File[] listOfFiles = folder.listFiles();  // 获取文件夹下所有文件

        if (listOfFiles != null) {
            for (File file : listOfFiles) {
                if (file.isFile()) {  // 只处理文件，不处理子目录
                    System.out.println("处理文件: " + file.getName());
                    readAndExtractJdbc(file.getPath(), writer);
                }
            }
        }
    }

    // 读取文件内容并解析出包含 JDBC 信息的行，写入到文件
    private static void readAndExtractJdbc(String filePath, BufferedWriter writer) {
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = br.readLine()) != null) {
                extractJdbcInfo(line, writer);  // 提取 JDBC 信息并写入
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 使用正则表达式提取 JDBC 信息，并写入到文件
    private static void extractJdbcInfo(String line, BufferedWriter writer) throws IOException {
        // JDBC URL 的正则表达式模式，匹配 IP、端口和数据库名
        String jdbcRegex = "jdbc:mysql://([\\d\\.]+):(\\d+)/([\\w]+)";
        Pattern pattern = Pattern.compile(jdbcRegex);
        Matcher matcher = pattern.matcher(line);

        // 如果匹配到 JDBC 信息，则提取并写入文件 IP、端口和数据库名
        if (matcher.find()) {
            String ip = matcher.group(1);      // IP 地址
            String port = matcher.group(2);    // 端口号
            String dbName = matcher.group(3);  // 数据库名
            String result = MessageFormat.format("{0},{1},{2}", ip, port, dbName);
            System.out.println(result);  // 打印到控制台
            writer.write(result);        // 写入到文件
            writer.newLine();            // 换行
        }
    }
}
