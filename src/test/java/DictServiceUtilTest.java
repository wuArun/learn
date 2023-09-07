import com.arun.arun_learn.function.util.DictServiceUtil;
import org.junit.Test;

import java.util.Objects;

/**
 * @ClassName DictServiceUtilTest
 * @Description TODO
 * @Author wurunxiang
 * @DATE 2023/9/5 11:29
 * @VERSION 1.0
 */
public class DictServiceUtilTest {

    @Test
    public void get(){
        System.out.println(DictServiceUtil.getInstance().getDictMapByType("测试"));
    }

    @Test
    public void get1(){

        System.out.println(Objects.equals(null,1));
    }
}
