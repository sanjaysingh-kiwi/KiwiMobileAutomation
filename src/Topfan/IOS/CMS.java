package Topfan.IOS;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.utilities.Keywords;

public class CMS {

	WebDriver driver;
	WebElement element;

	public CMS(String browserName) {
		switch (browserName.toLowerCase()) {
		case "chrome":
			String driverPath = System.getProperty("user.dir") + "\\libs";
			System.setProperty("webdriver.chrome.driver", driverPath + "\\chromedriver.exe");
			driver = new ChromeDriver();
			break;
		case "firefox":
		default:
			driver = new FirefoxDriver();
			break;
		}
	}

	public void navigateToEditHomeScreen() {
		driver.get("https://topfan-staging.herokuapp.com/clients/19/home_screen/edit");
	}

	public void login(String username, String password) {
		driver.get("https://topfan-staging.herokuapp.com");
		element = IOSAppLocators.getInstance().emailFieldCMS(driver);
		Keywords.typeText(element, username);
		element = IOSAppLocators.getInstance().passwordFieldCMS(driver);
		Keywords.typeText(element, password);
		element = IOSAppLocators.getInstance().loginButtonCMS(driver);
		Keywords.click(element);
	}

	public void navigateToEditCarouselByCardID(String cardID) {
		driver.get("https://topfan-staging.herokuapp.com/clients/19/carousel_feeds/" + cardID + "/edit");
	}

	public void navigateToCarousel(String url) {
		driver.get("https://topfan-staging.herokuapp.com" + url);
	}
	
	public void navigateToEditCardUrl(String url) {
		driver.get("https://topfan-staging.herokuapp.com" + url + "/edit");
	}
	
	public void navigateToClientHome() {
		driver.get("https://topfan-staging.herokuapp.com/clients/19");
	}

	public void removeAllCardsFromCarousel() {
		List<WebElement> elements = IOSAppLocators.getInstance().getAllCardsFromCMS(driver);
		if (elements.size() != 0) {
			List<String> cardIDs = new ArrayList<String>();
			for (WebElement card : elements) {
				cardIDs.add(card.getAttribute("id").replace("carousel_feed_", ""));
			}
			for (String cardID : cardIDs) {
				navigateToEditCarouselByCardID(cardID);
				element = IOSAppLocators.getInstance().showCardOnScreenFromCMS(driver);
				if (element.isSelected())
					Keywords.click(element);
				element = IOSAppLocators.getInstance().updateCarouselButtonOnCMS(driver);
				Keywords.click(element);
			}
		}
	}

	public void addAllTypesOfCard() {
		List<CarouselType> carousels = Arrays.asList(CarouselType.values());
		List<String> carouselUrls = new ArrayList<String>();
		for (CarouselType carousel : carousels) {
			element = IOSAppLocators.getInstance().getURLFromCarousel(driver, carousel);
			carouselUrls.add(element.getAttribute("href"));
		}
		for (String url : carouselUrls) {
			navigateToCarousel(url);
			element = IOSAppLocators.getInstance().getFirstCardFromCarousel(driver);
			String cardUrl = element.getAttribute("href");
			navigateToEditCardUrl(cardUrl);
			element = IOSAppLocators.getInstance().showCardOnScreenFromCMS(driver);
			if (!element.isSelected())
				Keywords.click(element);
		}
	}
	
	public void createAllTypesOfCard() {
		List<CarouselType> carousels = Arrays.asList(CarouselType.values());
		List<String> carouselUrls = new ArrayList<String>();
		for (CarouselType carousel : carousels) {
			element = IOSAppLocators.getInstance().getURLFromCarousel(driver, carousel);
			carouselUrls.add(element.getAttribute("href"));
		}
	}

}
