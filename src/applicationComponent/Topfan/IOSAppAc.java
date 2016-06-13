package applicationComponent.Topfan;

import java.util.HashMap;

import org.testng.annotations.Test;

import com.session.DriverSession;

import action.Topfan.IOSAppAction;
import applicationComponent.AppComponent;
import applicationComponent.ApplicationComponent;
import io.appium.java_client.MobileElement;
import io.appium.java_client.ios.IOSDriver;

@Test
public class IOSAppAc extends AppComponent implements ApplicationComponent {
	IOSDriver<MobileElement> driver = null;
	HashMap<String, String> testData = new HashMap<String, String>();
	IOSAppAction action;

	@SuppressWarnings("unchecked")
	@Override
	public void openApplication() throws Exception {
		driver = (IOSDriver<MobileElement>) DriverSession.getLastExecutionDriver();
		action = new IOSAppAction((IOSDriver<MobileElement>) DriverSession.getLastExecutionDriver());
		action.launchApp(driver);
	}

	@Override
	public void closeApplication() {
		action.closeApp();
	}

	@Override
	public void validateHomePage() {
		// TODO Auto-generated method stub

	}
	
	public void verifyHomePage() throws Exception {
//		action.launchCMSAndAddCards();
		action.login();
		action.killApp();
		action.relaunchApp();
	}
}
