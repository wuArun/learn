package com.arun.arun_learn.util;

import com.alibaba.fastjson2.JSON;
import com.arun.arun_learn.common.Constants;
import com.arun.arun_learn.connection.IConnection;
import com.arun.arun_learn.entity.AreaAndServer;
import com.arun.arun_learn.entity.EquipmentInfo;
import com.arun.arun_learn.entity.Group;
import com.arun.arun_learn.entity.Head;
import com.arun.arun_learn.entity.ReturnInfo;
import com.arun.arun_learn.entity.ServerEntity;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.util.StringUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.stream.LongStream;

/**
 * @program: learn
 * @ClassName JDBCUtil
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-12 21:14
 * @email: wurunx@gmail.com
 **/
public class JdbcUtil implements IConnection {

    final Logger logger = Logger.getLogger("common.jdbc_util");

    private final static String QUERY_SQL = "SELECT %s FROM %s WHERE 1=1 %s LIMIT %s;";

    private JdbcUtil() {
    }

    private static JdbcUtil instance;

    public static JdbcUtil getInstance() {
        if (instance == null) {
            instance = new JdbcUtil();
        }
        return instance;
    }

    /**
     * 查询列表
     * @param url
     * @param user
     * @param password
     * @param columns
     * @param params
     * @return
     */
    public ReturnInfo<ArrayList<String>> query(String url, String user, String password, String sql, ArrayList<Object> columns, ArrayList<String> params) {
        ReturnInfo<ArrayList<String>> returnInfo = new ReturnInfo<>();
        ArrayList<String> results = new ArrayList<>(10);
        Connection connection = null;
        PreparedStatement pstm = null;
        ResultSet rs = null;
        EquipmentInfo equipmentInfo;
        try {
            Class.forName(Constants.MYSQL_DRIVER);
            connection = getConnection(url,user,password);
            pstm = connection.prepareStatement(sql);
            rs = pstm.executeQuery();
            while (rs.next()) {
                equipmentInfo = new EquipmentInfo();
                equipmentInfo.setId(rs.getInt("id"));
                equipmentInfo.setEquipmentNumber(rs.getString("equipment_number"));
                equipmentInfo.setScanCount(rs.getInt("scan_count"));
                equipmentInfo.setCreateTime(rs.getDate("create_time"));
                results.add(JSON.toJSONString(equipmentInfo));
            }
            returnInfo.successInfo(Constants.OK_CODE,Constants.OK_MSG,results,Long.valueOf(results.size()));
        } catch (Exception e) {
            logger.log(Level.SEVERE, MessageFormat.format("JDBC 执行错误，请检查： \r\n "
                    + "[connection] {0} \r\n "
                    + "[user] {1} \r\n"
                    + "[columns] {2} \r\n"
                    + "[params] {3} \r\n"
                    + "[ex] {4}",
                    columns, user, JSON.toJSONString(columns), JSON.toJSONString(params),e));
        } finally {
            closeConnection(rs, pstm, connection);
        }
        return returnInfo;
    }

    //2.创建连接
    private static Connection getConnection(String url,String user,String password) throws SQLException {
        Connection conn = DriverManager.getConnection(url, user, password);
        return conn;
    }

    //3.关闭连接
    private static void closeConnection(ResultSet rs, PreparedStatement pstm, Connection conn) {
        if (conn != null) {

            try {
                conn.close();
            } catch (SQLException e1) {
                e1.printStackTrace();

            }

        }
    }

    public static void main(String[] args) {
        String key = "";
        Map<String,AreaAndServer> map;
        try {
            List<AreaAndServer> areaAndServers = readXlxs("D:\\Users\\Public\\Documents\\imData\\im\\257221@nd\\RecvFile\\江洪_880831\\test3.xlsx");
            map = new HashMap<>(areaAndServers.size());
            for (AreaAndServer areaAndServer : areaAndServers) {
                map.put(areaAndServer.getServerName(),areaAndServer);
            }
            List<ServerEntity> serverEntities = readDat("D:\\Users\\Public\\Documents\\imData\\im\\257221@nd\\RecvFile\\江洪_880831\\Server.txt");
            for (ServerEntity serverEntity : serverEntities) {
                if (map.get(serverEntity.getServer_name()) != null) {
                    key = serverEntity.getServer_name();
                    AreaAndServer areaAndServer = map.get(key);
                    serverEntity.setServer_id(areaAndServer.getServerId());
                    serverEntity.setArea_id(areaAndServer.getAreaId());
                    serverEntity.setArea_show_name(areaAndServer.getAreaName());
                }
            }
            write(serverEntities);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public static String printStackTraceInfo() {
        StackTraceElement[] stackTraceElements = Thread.currentThread().getStackTrace();
        StringBuilder stringBuilder = new StringBuilder();
        for (StackTraceElement element : stackTraceElements) {
            stringBuilder.append(MessageFormat.format("{0}.{1}({2})\n", element.getClassName(), element.getMethodName(),  element.getLineNumber()));
        }
        return stringBuilder.toString();
    }

    public static String getStackTrace(Exception e) {
        StringWriter sw = null;
        PrintWriter pw = null;
        try {
            sw = new StringWriter();
            pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            pw.flush();
            sw.flush();
        } finally {
            if (sw != null) {
                try {
                    sw.close();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            }
            if (pw != null) {
                pw.close();
            }
        }
        return sw.toString();
    }

    public static List<ServerEntity>  readDat(String filePath) throws UnsupportedEncodingException, FileNotFoundException {
        List<ServerEntity> serverEntities = new ArrayList<>();
        File file = new File(filePath);
        FileInputStream fis = new FileInputStream(file);
        InputStreamReader isr = new InputStreamReader(fis, "GB2312");
        try (BufferedReader reader = new BufferedReader(isr);) {
            // 跳过 BOM 字符
            reader.mark(1);
            if (reader.read() != 0xFEFF) {
                reader.reset();
            }

            String line;
            List<String> lines = new ArrayList<>(128);
            while ((line = reader.readLine()) != null) {
                byte[] bytes = line.getBytes("GB2312");
                line = new String(bytes, "GB2312");
                // 处理读取的每一行数据
                lines.add(line);
            }
            serverEntities = getServerEntities(lines);
            List<Head> heads = getHeads(lines);
            for (ServerEntity serverEntity : serverEntities) {
                for (Head head : heads) {
                    List<String> groupList = head.getGroupNames();
                    if (StringUtils.isNotEmpty(serverEntity.getHeadName())) {
                        break;
                    } else {
                        for (String group : groupList) {
                            if (group.equalsIgnoreCase(serverEntity.getGroup_id())) {
                                serverEntity.setHeadName(head.getHeadName());
                                break;
                            }
                        }
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return serverEntities;
    }

    private static List<ServerEntity> getServerEntities(List<String> lines){
        List<ServerEntity> serverEntities = new ArrayList<>();
        ServerEntity serverEntity = null;
        String groupId = "";
        for (String line : lines) {
            if (line.toLowerCase().startsWith("[group")) {
                groupId = line.substring(1, line.length() - 1);
            } else if (line.toLowerCase().startsWith("server") && Character.isDigit(line.substring(6,7).charAt(0))) {
                serverEntity = new ServerEntity();
                String v = line.split("=")[1];
                serverEntity.setGroup_id(groupId);
                serverEntity.setServer_name(v);
                serverEntity.setIndex(line.substring(6,7));
                if (v.contains("(新)") || v.contains("（新）")) {
                    serverEntity.setStatus_mark("包含新");
                } else {
                    serverEntity.setStatus_mark("0");
                }
            } else if (line.toLowerCase().startsWith("opentime")){
                if (serverEntity != null) {
                    serverEntities.add(serverEntity);
                    serverEntity = null;
                }
            } else {
                if (serverEntity != null) {
                    String v = line.split("=")[1];
                    if (line.toLowerCase().startsWith("keyip")) {
                        String[] split = v.split(":");
                        serverEntity.setKey_ip(split[0]);
                        serverEntity.setKey_port(split[1]);
                    } else if (line.toLowerCase().startsWith("bindip")) {
                        String[] split = v.split(":");
                        serverEntity.setBind_ip(split[0]);
                        serverEntity.setBind_port(split[1]);
                    } else if (line.toLowerCase().startsWith("ip")) {
                        String[] split = v.split(":");
                        serverEntity.setAddress(split[0]);
                        serverEntity.setPort(split[1]);
                    } else if (line.toLowerCase().startsWith("pic")) {
                        serverEntity.setPic(v);
                    } else if (line.toLowerCase().startsWith("maxdelay")) {
                        serverEntity.setMax_delay(v);
                    } else if (line.toLowerCase().startsWith("servername")) {
                        if (v.equals(serverEntity.getServer_name())) {
                            serverEntity.setServer_show_name("");
                        } else {
                            serverEntity.setServer_show_name(v);
                        }
                    }
                }
            }
        }
        return serverEntities;
    }

    private static List<Head> getHeads(List<String> lines){
        List<Head> heads = new ArrayList<>(32);
        Head head = null;
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line.toLowerCase().startsWith("[header")) {
                if (head != null) {
                    heads.add(head);
                }
                head =new Head();
                head.setHeadName(line.substring(1, line.length() - 1));
            } else if (line.toLowerCase().startsWith("groupamount")) {
                if (head != null) {
                    head.setAmount(Integer.parseInt(line.split("=")[1]));
                }
            } else if (!line.toLowerCase().startsWith("groupamount") && line.toLowerCase().startsWith("group")){
                if (head != null) {
                    head.addGroupName(line.split("=")[0]);
                }
            } else if (head != null && i == lines.size() -1 ) {
                heads.add(head);
                head = null;
            }
        }
        return heads;
    }

    private static List<Group> getGroups(List<String> lines){
        List<Group> groups = new ArrayList<>(32);
        Group group = null;
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line.toLowerCase().startsWith("[group")) {
                if (group != null) {
                    groups.add(group);
                }
                group = new Group();
                group.setGroupName(line.substring(1, line.length() - 1));
            } else if (line.toLowerCase().startsWith("serveramount")) {
                if (group != null) {
                    group.setAmount(Integer.parseInt(line.split("=")[1]));
                }
            } else if (!line.toLowerCase().startsWith("serveramount") && line.toLowerCase().startsWith("group")) {
                if (group != null) {
                    group.addServerName(line.split("=")[1]);
                }
            } else if (group != null && i == lines.size() -1 ) {
                groups.add(group);
                group = null;
            }
        }
        return groups;
    }

    public static List<AreaAndServer> readXlxs(String filePath){

        List<AreaAndServer> areaAndServers = new ArrayList<>();
        try {
            // 创建文件输入流
            FileInputStream fis = new FileInputStream(new File(filePath));

            // 使用XSSFWorkbook加载xlsx文件
            Workbook workbook = new XSSFWorkbook(fis);

            // 获取第一个工作表
            Sheet sheet = workbook.getSheetAt(0);
            // 遍历工作表中的行
            for (Row row : sheet) {
                AreaAndServer areaAndServer = new AreaAndServer();
                if (row.getRowNum() == 0) {
                    continue;
                }
                // 遍历行中的单元格
                for (Cell cell : row) {
                    String  value = getValueByCell(cell);
                    switch (cell.getColumnIndex()) {
                        case 0:
                            areaAndServer.setServerId(value);
                            break;
                        case 1:
                            areaAndServer.setServerName(value);
                            break;
                        case 5:
                            areaAndServer.setAreaId(value);
                            break;
                        case 6:
                            areaAndServer.setAreaName(value);
                            break;
                        default:
                            break;
                    }
                }
                areaAndServers.add(areaAndServer);
            }

            // 关闭文件输入流
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return areaAndServers;
    }


    public static String getValueByCell(Cell cell){
        String v = null;
        // 根据单元格类型获取值
        switch (cell.getCellType()) {
            case STRING:
                v = cell.getStringCellValue();
                break;
            case NUMERIC:
                v = String.valueOf((int) Math.round(cell.getNumericCellValue()));
                break;
            default:
                System.out.print("\t");
                break;
        }
        return v;
    }

    public static void write(List<ServerEntity> serverEntities){
        Workbook workbook = new HSSFWorkbook();

        // 创建工作表
        Sheet sheet = workbook.createSheet("Sheet1");

        for (int i = 0; i < serverEntities.size(); i++) {
            ServerEntity item = serverEntities.get(i);
            // 创建行，并在行中创建单元格，并设置值
            Row row = sheet.createRow(i);

            Cell cell;
            cell = row.createCell(0);
            cell.setCellValue(item.getHeadName());
            cell = row.createCell(1);
            cell.setCellValue(item.getArea_id());
            cell = row.createCell(2);
            cell.setCellValue(item.getArea_show_name());
            cell = row.createCell(3);
            cell.setCellValue(item.getName());
            cell = row.createCell(4);
            cell.setCellValue(item.getAddress());
            cell = row.createCell(5);
            cell.setCellValue(item.getPort());
            cell = row.createCell(6);
            cell.setCellValue(item.getServer_id());
            cell = row.createCell(7);
            cell.setCellValue(item.getServer_show_name());
            cell = row.createCell(8);
            cell.setCellValue(item.getStatus_mark());
            cell = row.createCell(9);
            cell.setCellValue("0");
            cell = row.createCell(10);
            cell.setCellValue(item.getKey_ip());
            cell = row.createCell(11);
            cell.setCellValue(item.getKey_port());
            cell = row.createCell(12);
            cell.setCellValue(item.getBind_ip());
            cell = row.createCell(13);
            cell.setCellValue(item.getBind_port());
            cell = row.createCell(14);
            cell.setCellValue(item.getPic());
            cell = row.createCell(15);
            cell.setCellValue(item.getMax_delay());
            cell = row.createCell(16);
            cell.setCellValue(item.getServer_name());
            cell = row.createCell(17);
            cell.setCellValue(item.getIndex());
            cell = row.createCell(17);
            cell.setCellValue(item.getIndex());
        }

        // 保存工作簿到文件
        try {
            String uuid = UUID.randomUUID().toString().toLowerCase();
            FileOutputStream fos = new FileOutputStream(MessageFormat.format("E:\\learn\\result{0}.xls",uuid));
            workbook.write(fos);
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 关闭工作簿
        try {
            workbook.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


}
