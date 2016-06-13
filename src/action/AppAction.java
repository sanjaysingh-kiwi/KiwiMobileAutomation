package action;

import java.util.HashMap;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;

import com.session.DriverSession;
import com.utilities.GlobalParam;
import com.utilities.Utility;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

import com.session.DriverFactory;
import testCaseReporting.TestCaseReporting;

public class AppAction extends CommonAll {

	Utility utilObj = new Utility();
	Properties pageProp;

	HashMap<String, String> testData = new HashMap<String, String>();
	TestCaseReporting testCaseReporting = null;
	String etPortfolioName = "";
	String productName = "";
	
	AppiumDriver<MobileElement> a_Driver;

	public AppAction(AppiumDriver<MobileElement> lastExecutionDriver) { // ##U
		super(lastExecutionDriver);
		this.driver = lastExecutionDriver;
		this.testData = DriverSession.getTestCaseData();
		setPageProp();
	}

	public void setPageProp() {
		if (GlobalParam.FEATURE_TYPE.equalsIgnoreCase("android"))
			pageProp = utilObj.loadPageProperties(GlobalParam.CURRENT_PROJECT_PATH + "/AndroidApp.properties");
		else if (GlobalParam.FEATURE_TYPE.equalsIgnoreCase("ios"))
			pageProp = utilObj.loadPageProperties(GlobalParam.CURRENT_PROJECT_PATH + "/iOSApp.properties");
	}

	public void launchApp(WebDriver driver) { // ##U
		try {
			this.driver = driver;
			this.testData = DriverSession.getTestCaseData();
			driver.manage().timeouts().implicitlyWait(Long.parseLong(pageProp.getProperty("defaultWaitTime")),
					TimeUnit.SECONDS);
			DriverSession.setLastExecutionDriver(driver);
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App Launched", "PASS",
					"App should Launch");
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App didn't Launched", "FAIL",
					"App should Launch.");
		}
	}

	public void closeApp() {
		try {
			driver.quit();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App is closed", "PASS",
					"App should be Closed");
		} catch (Exception ee) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App is not Closed", "FAIL",
					"App should be Closed");
		}
		DriverSession.getLastExecutionReportingInstance().footer();
	}
	
	@SuppressWarnings("unchecked")
	public void killApp() {
		try {
			a_Driver = (AppiumDriver<MobileElement>) DriverSession.getLastExecutionDriver();
			a_Driver.closeApp();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App forced kill", "PASS",
					"App should be killed");
		} catch (Exception ee) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App is not Closed", "FAIL",
					"App should be killed");
		}
	}
	
	@SuppressWarnings("unchecked")
	public void relaunchApp() {
		try {
			a_Driver = (AppiumDriver<MobileElement>) DriverSession.getLastExecutionDriver();
			a_Driver.launchApp();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App is closed", "PASS",
					"App should launch again");
		} catch (Exception ee) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting("App didn't launch", "FAIL",
					"App should launch again");
		}
	}

	public void launchAppAgain() { // ##U
		try {
			DriverFactory df = new DriverFactory(
					GlobalParam.CURRENT_EXECUTION_MODE);
			DriverSession.setLastExecutionDriver(df.getDriver());

			this.driver = DriverSession.getLastExecutionDriver();
			this.testData = DriverSession.getTestCaseData();
			DriverSession.setLastExecutionDriver(driver);
			driver.manage()
					.timeouts()
					.implicitlyWait(
							Long.parseLong(pageProp
									.getProperty("defaultWaitTime")),
							TimeUnit.SECONDS);
			DriverSession
					.getLastExecutionReportingInstance()
					.teststepreporting(
							"App launched successfully with test product added in cartfor test user ID ",
							"INFO",
							"App should be Launched with test product Added in cart for test user ID");
		} catch (Exception e) {
			DriverSession
					.getLastExecutionReportingInstance()
					.teststepreporting("App is not Launched Again", "FAIL",
							"App should be Launched with test product Added in cart for test user ID");
		}
	}

}