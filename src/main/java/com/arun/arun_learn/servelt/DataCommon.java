package com.arun.arun_learn.servelt;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 测试 servelt 连接
 * @author wurunxiang
 * @emai wurunx@gmail.com
 */
@WebServlet(name = "dataCommon", value = "/data_common")
public class DataCommon extends HttpServlet {

    @Override
    public void init() throws ServletException {

    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
//        super.service(req, resp);
        //打印内容在控制台
        System.out.println("Hello Servlet");
        //通过流输出内容
        resp.getWriter().write("hi hello inner freedom，嘿！你好");
    }

    /**
     * 执行SQL测试
     */
    private void executeSql(){

    }
}
