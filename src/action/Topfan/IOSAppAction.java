package action.Topfan;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.session.DriverSession;
import com.utilities.Keywords;

import Topfan.IOS.CMS;
import Topfan.IOS.CarouselType;
import Topfan.IOS.IOSAppLocators;
import action.AppAction;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class IOSAppAction extends AppAction {

	public WebElement element;

	public IOSAppAction(AppiumDriver<MobileElement> lastExecutionDriver) {
		super(lastExecutionDriver);
	}

	public void enterEmailID() {
		String email = DriverSession.getTestCaseData().get("Username");
		element = IOSAppLocators.getInstance().emailFieldLoginPage(driver);
		Keywords.typeText(element, email);
	}

	public void enterPassword() {
		String password = DriverSession.getTestCaseData().get("Password");
		element = IOSAppLocators.getInstance().passwordFieldLoginPage(driver);
		Keywords.typeText(element, password);
	}

	public void tapLoginButtonOnWelcomeScreen() {
		element = IOSAppLocators.getInstance().LoginButtonWelcomeScreen(driver);
		Keywords.click(element);
	}

	public void tapLoginButtonOnLoginpage() {
		element = IOSAppLocators.getInstance().LoginButtonLoginPage(driver);
		Keywords.click(element);
	}

	public void login() throws Exception {
		try {
			Keywords.acceptAlert();
			tapLoginButtonOnWelcomeScreen();
			enterEmailID();
			enterPassword();
			tapLoginButtonOnLoginpage();
			Keywords.explicitWait(5);
			Keywords.acceptAlert();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("User Successfully logged in", "PASS",
					"User should be able to log in");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Exception Occurred...while logging into the app", "FAIL", "User should be able to log in");
		}
	}

	public void launchCMSAndAddCards() throws Exception {
		CMS cms = new CMS("firefox");
		cms.login("collin.thaw@top-fan.com", "password");
		cms.navigateToClientHome();
		cms.createAllTypesOfCard();
	}
}
