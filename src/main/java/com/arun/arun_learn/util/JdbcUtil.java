package com.arun.arun_learn.util;

import com.alibaba.fastjson2.JSON;
import com.arun.arun_learn.common.Constants;
import com.arun.arun_learn.connection.IConnection;
import com.arun.arun_learn.entity.EquipmentInfo;
import com.arun.arun_learn.entity.ReturnInfo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

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
}
