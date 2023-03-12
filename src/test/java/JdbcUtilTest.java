import com.alibaba.fastjson.JSON;
import com.arun.arun_learn.entity.ReturnInfo;
import com.arun.arun_learn.util.JdbcUtil;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;

/**
 * @program: learn
 * @ClassName JdbcUtilTest
 * @description:
 * @author: wurunxiang
 * @create: 2023-03-12 22:03
 * @email: wurunx@gmail.com
 **/
public class JdbcUtilTest {

    @Test
    public void jdbcQuery(){
        String url = "jdbc:mysql://124.70.165.66:3306/renren_security?useUnicode=true";
        String user = "root";
        String password = "123456";
        String sql = "select * from equipment_info limit 10;";
        ReturnInfo<ArrayList<String>> query = JdbcUtil.getInstance().query(url, user, password, sql, null, null);
        Assert.assertTrue(query.getSuccess());
        if (query.getSuccess()){
            System.out.println(JSON.toJSONString(query.getData()));
        }
    }
}
