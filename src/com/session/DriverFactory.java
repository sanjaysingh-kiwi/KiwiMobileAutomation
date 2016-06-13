package com.session;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;

import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.safari.SafariOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.gargoylesoftware.htmlunit.javascript.background.JavaScriptExecutor;
import com.utilities.GlobalParam;
import com.utilities.Keywords;

//import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium;

public class DriverFactory {

	// private Properties masterProp = null;
	private WebDriver driver = null;
	@SuppressWarnings({ "unused", "rawtypes" })
	private AppiumDriver drivers = null;
	// private DesiredCapabilities driverCapabilities1 = null;
	private WebDriverWait driverWait = null;
	private String flavour = null;
	private ArrayList<String> BrowersOnGrid = new ArrayList<String>(
			Arrays.asList("CHROME", "FIREFOX", "CHROME", "FIREFOX", "CHROME", "FIREFOX"));

	// private WebDriverBackedSelenium selenium;

	public DriverFactory() {
		// TODO Auto-generated constructor stub
	}

	public DriverFactory(String flavour) { // ##U
		this.flavour = flavour;
		// loadMasterProperties(flavour);
		// loadDesiredCapabilities();
		if (GlobalParam.TakeBrowserNameFromPath)
			resetBrowserNameForMultipleRun();
		if (GlobalParam.pickBrowserAutomatically)
			assignRandomBrowser();
		setPathValue();
		initDriver();
	}

	public static DriverFactory getInstance() {
		return new DriverFactory();
	}

	private void resetBrowserNameForMultipleRun() {
		String path = System.getProperty("user.dir");
		if (path.toLowerCase().contains("firefox"))
			DriverSession.setBrowserName("firefox");
		if (path.toLowerCase().contains("chrome"))
			DriverSession.setBrowserName("chrome");
		if (path.toLowerCase().contains("safari")) {
			DriverSession.setBrowserName("safari");
			System.out.println("Safari Browser");
		}
	}

	private void assignRandomBrowser() {
		try {
			Random random = new Random();
			int size = random.nextInt(BrowersOnGrid.size());
			String browser = BrowersOnGrid.get(size);
			if (browser.toLowerCase().contains("firefox"))
				DriverSession.setBrowserName("firefox");
			if (browser.toLowerCase().contains("chrome"))
				DriverSession.setBrowserName("chrome");
			if (browser.toLowerCase().contains("safari"))
				DriverSession.setBrowserName("safari");
		} catch (Exception e) {
			DriverSession.setBrowserName("firefox");
		}
	}

	private void setPathValue() {
		String fullPath = "";
		if (System.getProperty("os.name").contains("Windows"))
			fullPath = GlobalParam.CURRENT_PROJECT_PATH + "\\TestRepository\\Downloads\\";
		else
			fullPath = GlobalParam.CURRENT_PROJECT_PATH + "/TestRepository/Downloads/";

		if (GlobalParam.serverIP.equals("192.168.20.164"))
			fullPath = "E:\\AutomationRepository\\Downloads\\";
		GlobalParam.DownloadLocation = fullPath;
	}

	void initDriver() { // ##U
		try {
			if (flavour.contains("App") || flavour.equalsIgnoreCase("MobileWeb")) {
				String baseURL = GlobalParam.masterProp.getProperty("baseURL");
				String OS = System.getProperty("os.name");
				if (OS.contains("Mac OS") && GlobalParam.appiumFromProgram) {
					baseURL = baseURL.replace("4723", String.valueOf(GlobalParam.appiumPort));
					Thread.sleep(2000);
				}
				
				if (flavour.equalsIgnoreCase("iosApp"))
					driver = new IOSDriver<MobileElement>(new URL(baseURL), GlobalParam.driverCapabilities);
				else
					driver = new AndroidDriver<MobileElement>(new URL(baseURL), GlobalParam.driverCapabilities);

				new Keywords(driver);

				// GlobalParam.aDriver = (AppiumDriver<MobileElement>) driver;
				DriverSession.setLastExecutionDriver(driver);
			} else if (flavour.equals("DesktopWeb") || flavour.equals("backEndWeb")) {
				if (GlobalParam.mergeCase && DriverSession.getLastExecutionDriver() != null) {
					this.driver = DriverSession.getLastExecutionDriver();
					return;
				}
				String seleniumServer = GlobalParam.serverIP;
				// String
				// seleniumServer=masterProp.getProperty("seleniumServer");
				System.out.println("*******seleniumServer*******************************************" + seleniumServer);

				if (seleniumServer.isEmpty() || seleniumServer.equalsIgnoreCase("mobile"))
					seleniumServer = "localhost";

				Platform platform = null;

				ArrayList<String> allPlatforms = new ArrayList<String>(
						Arrays.asList("Mac", "Windows", "Linux", "Mac", "Windows"));
				Random random = new Random();

				String PLATFORM = allPlatforms.get(random.nextInt(allPlatforms.size()));

				String temp = GlobalParam.suiteProp.getProperty("PLATFORM");
				String port = GlobalParam.suiteProp.getProperty("port");
				// String port = loadMasterEnvironment("port",
				// "suiteExecution");

				if (!(temp == null || temp.isEmpty()))
					PLATFORM = temp;

				if (PLATFORM.equalsIgnoreCase("mac"))
					platform = Platform.MAC;

				else if (PLATFORM.equalsIgnoreCase("windows"))
					platform = Platform.WINDOWS;

				else if (PLATFORM.equalsIgnoreCase("linux"))
					platform = Platform.LINUX;

				if (DriverSession.getBrowserName().equalsIgnoreCase("safari"))
					GlobalParam.setSafari = true;
				else
					GlobalParam.setSafari = false;

				DesiredCapabilities capability = null;
				String driverPath = "";
				// Remove later
				// platform = Platform.WINDOWS;

				if (DriverSession.getBrowserName().equalsIgnoreCase("firefox")) {
					capability = DesiredCapabilities.firefox();
					//
					FirefoxProfile profile = new FirefoxProfile();
					profile.setAcceptUntrustedCertificates(false);
					profile.setAssumeUntrustedCertificateIssuer(true);
					profile.setPreference("browser.download.folderList", 2);
					profile.setPreference("browser.helperApps.alwaysAsk.force", false);
					profile.setPreference("browser.download.dir", GlobalParam.DownloadLocation);
					profile.setPreference("browser.download.downloadDir", GlobalParam.DownloadLocation);
					profile.setPreference("browser.helperApps.neverAsk.saveToDisk",
							"text/anytext ,text/plain,text/html,application/plain,application/pdf");
					profile.setPreference("browser.download.manager.alertOnEXEOpen", false);
					profile.setPreference("browser.download.manager.focusWhenStarting", false);
					profile.setPreference("browser.download.useDownloadDir", true);
					profile.setPreference("browser.download.manager.closeWhenDone", true);
					profile.setPreference("browser.download.manager.showAlertOnComplete", false);
					profile.setPreference("browser.download.manager.useWindow", false);
					profile.setPreference("services.sync.prefs.sync.browser.download.manager.showWhenStarting", false);
					profile.setPreference("pdfjs.disabled", true);

					capability.setCapability(FirefoxDriver.PROFILE, profile);

					if (PLATFORM.equalsIgnoreCase("linux"))
						platform = Platform.MAC;

					capability.setPlatform(platform);
				} else if (DriverSession.getBrowserName().equalsIgnoreCase("chrome")) {
					capability = DesiredCapabilities.chrome();

					HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
					chromePrefs.put("profile.default_content_settings.popups", 0);
					chromePrefs.put("download.default_directory", GlobalParam.DownloadLocation);
					ChromeOptions options = new ChromeOptions();
					options.setExperimentalOption("prefs", chromePrefs);
					capability.setCapability(CapabilityType.ACCEPT_SSL_CERTS, true);
					capability.setCapability(ChromeOptions.CAPABILITY, options);
					if (PLATFORM.equalsIgnoreCase("linux"))
						platform = Platform.MAC;

					capability.setPlatform(platform);

					if (!GlobalParam.TESTNG_EXECUTION) {
						driverPath = GlobalParam.suiteProp.getProperty("WEB_DRIVER_CHROME");
						System.setProperty("webdriver.chrome.driver", driverPath);
					}
				} else if (DriverSession.getBrowserName().equalsIgnoreCase("opera")) {
					if (!GlobalParam.TESTNG_EXECUTION) {
						driverPath = GlobalParam.suiteProp.getProperty("WEB_DRIVER_OPERA");
						System.setProperty("webdriver.opera.driver", driverPath);
					}
					capability = DesiredCapabilities.operaBlink();
					capability.setPlatform(platform);
					ChromeOptions options = new ChromeOptions();
					// options.setBinary("C:\\Program Files
					// (x86)\\Opera\\launcher.exe");
					capability.setCapability(ChromeOptions.CAPABILITY, options);
				} else if (DriverSession.getBrowserName().equalsIgnoreCase("INTERNET EXPLORER")) {
					if (!GlobalParam.TESTNG_EXECUTION) {
						driverPath = GlobalParam.suiteProp.getProperty("WEB_DRIVER_INTERNET");
						System.setProperty("webdriver.ie.driver", driverPath);
					}
					capability = DesiredCapabilities.internetExplorer();
					platform = Platform.WIN8_1;
					capability.setPlatform(platform);
				} else if (DriverSession.getBrowserName().equalsIgnoreCase("safari")) {
					SafariOptions options = new SafariOptions();
					options.setUseCleanSession(true);

					capability = DesiredCapabilities.safari();
					capability.setPlatform(platform);
				} else if (flavour.equals("API")) {
					GlobalParam.url = getUrl(GlobalParam.SERVER_NAME);
					// GlobalVar.staticKey = getStaticKey();
				}
				// seleniumServer = "192.168.6.15";
				RemoteWebDriver driver1 = new RemoteWebDriver(
						new URL("http://" + seleniumServer + ":" + port + "/wd/hub"), capability);
				driver = driver1;
				driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
				// selenium = new WebDriverBackedSelenium(driver1,
				// getUrl(GlobalParam.SERVER_NAME));
			}

			if (!flavour.contains("App"))
				driver.manage().timeouts().pageLoadTimeout(270, TimeUnit.SECONDS);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public WebDriver getDriver() { // ##U
		return driver;
	}

	public WebDriverWait getWait() {
		return driverWait;
	}

	public String getUrl(String server) {
		System.out.println("*******getUrl*******************************************" + server
				+ GlobalParam.masterProp.getProperty(server));
		return GlobalParam.masterProp.getProperty(server);
	}

	public String getStaticKey() {
		return GlobalParam.masterProp.getProperty("API_Static_Key");
	}

}