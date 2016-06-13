package Topfan.IOS;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import io.appium.java_client.MobileElement;

public class IOSAppLocators {

	public static IOSAppLocators getInstance() {
		IOSAppLocators mHeader = null;
		try {
			mHeader = new IOSAppLocators();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mHeader;
	}

	public WebElement emailFieldCMS(WebDriver driver) {
		WebElement element = driver.findElement(By.id("agent_email"));
		return element;
	}

	public WebElement passwordFieldCMS(WebDriver driver) {
		WebElement element = driver.findElement(By.id("agent_password"));
		return element;
	}

	public WebElement loginButtonCMS(WebDriver driver) {
		WebElement element = driver.findElement(By.xpath("//input[@class='btn']"));
		return element;
	}

	public WebElement LoginButtonWelcomeScreen(WebDriver driver) {
		WebElement element = driver.findElement(By.xpath("//UIAButton[@name='LOGIN']"));
		return element;
	}

	public WebElement LoginButtonLoginPage(WebDriver driver) {
		WebElement element = driver.findElement(By.xpath("//UIAButton[starts-with(@name,'Login')]"));
		return element;
	}

	public WebElement emailFieldLoginPage(WebDriver driver) {
		WebElement element = driver
				.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIATextField[2]"));
		return element;
	}

	public WebElement passwordFieldLoginPage(WebDriver driver) {
		WebElement element = driver
				.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIASecureTextField[1]"));
		return element;
	}

	public List<WebElement> getAllCardsFromCMS(WebDriver driver) {
		List<WebElement> elements = driver.findElements(By.xpath("//li[starts-with(@id,'carousel_feed')]"));
		return elements;
	}

	public WebElement showCardOnScreenFromCMS(WebDriver driver) {
		WebElement element = driver
				.findElement(By.xpath("//input[contains(@id,'show_on_home_screen')]"));
		return element;
	}
	
	public WebElement showCardOnScreenFromCarousel(WebDriver driver) {
		WebElement element = driver
				.findElement(By.xpath("//input[@id='carousel_feed_feed_item_attributes_show_on_home_screen']"));
		return element;
	}

	public WebElement updateCarouselButtonOnCMS(WebDriver driver) {
		WebElement element = driver.findElement(By.xpath("//input[@class='btn primary']"));
		return element;
	}

	public WebElement getURLFromCarousel(WebDriver driver, CarouselType carousel) {
		WebElement element = driver.findElement(By.xpath("//a[contains(text(),'" + carousel + "')]"));
		return element;
	}

	public WebElement getFirstCardFromCarousel(WebDriver driver) {
		WebElement element = driver.findElement(By.xpath("(//tbody//tr//a)[1]"));
		return element;
	}
}
