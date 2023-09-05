import com.arun.arun_learn.function.util.DictServiceUtil;
import org.junit.Test;

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
}
