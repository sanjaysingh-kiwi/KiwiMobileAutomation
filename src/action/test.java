package action;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.utilities.Keywords;

import Topfan.IOS.IOSAppLocators;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import io.appium.java_client.ios.IOSDriver;


public class test {
	
	static AppiumDriver<MobileElement> wd;

	public static void main(String[] args) throws MalformedURLException {
		/*DesiredCapabilities capabilities = new DesiredCapabilities();
		capabilities.setCapability("appium-version", "1.0");
		capabilities.setCapability("platformName", "iOS");
		capabilities.setCapability("platformVersion", "9.2");
		capabilities.setCapability("deviceName", "iPhone");
		capabilities.setCapability("udid", "auto");
		capabilities.setCapability("app", "/Users/kiwitech/Documents/Sanjay_Data/workspace/KiwiMobileAutomation/app/TopFan.app");
		wd = new IOSDriver<MobileElement>(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
		wd.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
		wd.findElement(By.xpath("//UIAButton[@name='LOGIN']")).click();
		wd.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIATextField[2]")).sendKeys("apfun26");
		wd.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIASecureTextField[1]")).click();
		wd.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIASecureTextField[1]")).sendKeys("123456");
		wd.findElement(By.xpath("//UIAButton[starts-with(@name,'Login')]")).click();
		wd.switchTo().alert().accept();
		wd.quit();
		wd.close();*/
		WebElement element;
		WebDriver wd = new FirefoxDriver();
		wd.get("https://topfan-staging.herokuapp.com/clients/19/home_screen/edit");
		element = IOSAppLocators.getInstance().emailFieldCMS(wd);
		Keywords.typeText(element, "collin.thaw@top-fan.com");
		element = IOSAppLocators.getInstance().passwordFieldCMS(wd);
		Keywords.typeText(element, "password");
		element = IOSAppLocators.getInstance().loginButtonCMS(wd);
		Keywords.click(element);
		List<WebElement> elements = IOSAppLocators.getInstance().getAllCardsFromCMS(wd);
		List<String> cardIDs = new ArrayList<String>();
		for(WebElement card : elements){
			cardIDs.add(card.getAttribute("id").replace("carousel_feed_", ""));
//			wd.get("https://topfan-staging.herokuapp.com/clients/19/carousel_feeds/"+cardID+"/edit");
//			element = IOSAppLocators.getInstance().showCardOnScreenFromCMS(wd);
//			if(element.isSelected())
//				element.click();
		}
		for(String cardID : cardIDs){
			wd.navigate().to("https://topfan-staging.herokuapp.com/clients/19/carousel_feeds/"+cardID+"/edit");
		}
	}
}
