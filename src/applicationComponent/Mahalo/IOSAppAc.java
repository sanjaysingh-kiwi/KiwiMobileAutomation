package applicationComponent.Mahalo;

import java.util.HashMap;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

import com.session.DriverSession;

import action.AppAction;
import applicationComponent.AppComponent;
import applicationComponent.ApplicationComponent;
import io.appium.java_client.MobileElement;
import io.appium.java_client.ios.IOSDriver;

@Test
public class IOSAppAc extends AppComponent implements ApplicationComponent {
	IOSDriver<MobileElement> driver = null;
	HashMap<String, String> testData = new HashMap<String, String>();
	AppAction action;
	
	@SuppressWarnings("unchecked")
	public IOSAppAc() {
		driver = (IOSDriver<MobileElement>) DriverSession.getLastExecutionDriver();
		action = new AppAction(driver);
	}

	@Override
	public void openApplication() throws Exception {
		action.launchApp(DriverSession.getLastExecutionDriver());
	}

	@Override
	public void closeApplication() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void validateHomePage() {
		// TODO Auto-generated method stub
		
	}
	
	public void addIndependentTask() {
		driver.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[2]")).click();
		driver.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[1]"))
				.click();
		driver.findElement(By
				.xpath("//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[2]/UIACollectionView[1]/UIACollectionCell[1]"))
				.click();
		driver.findElement(
				By.xpath("//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[2]/UIATextField[1]"))
				.sendKeys("IndependentTask");
		driver.findElement(
				By.xpath("//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[3]/UIAStaticText[2]"))
				.click();
		driver.findElements(By.className("UIAPickerWheel")).get(0).sendKeys("June");
//		driver.close();
	}
}
