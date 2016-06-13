package applicationComponent.Mahalo;

import io.appium.java_client.MobileElement;
import io.appium.java_client.android.AndroidDriver;

import java.util.HashMap;

import org.testng.annotations.Test;

import applicationComponent.AppComponent;
import applicationComponent.ApplicationComponent;

import com.session.DriverSession;
import action.AppAction;

@Test
public class AndroidAppAc extends AppComponent implements ApplicationComponent {
	AndroidDriver<MobileElement> driver = null;
	HashMap<String, String> testData = new HashMap<String, String>();
	AppAction action;

	@SuppressWarnings("unchecked")
	public AndroidAppAc() {
		driver = (AndroidDriver<MobileElement>) DriverSession.getLastExecutionDriver();
		action = new AppAction(driver);
	}

	public void openApplication() { // ##U
		action.launchApp(DriverSession.getLastExecutionDriver());
	}

	public void openApplicationForApp() { // ##U
		action.launchAppAgain();
	}

	public void validateHomePage() { // ##U
	}

	public void closeApplication() { // ##U
		action.closeApp();
	}
}