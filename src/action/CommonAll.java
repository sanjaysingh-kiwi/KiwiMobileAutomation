package action;

import java.awt.Toolkit;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Random;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.session.DriverFactory;
import com.session.DriverSession;
import com.utilities.GlobalParam;
import com.utilities.Keywords;

public class CommonAll {
	public WebDriver driver;
	private ArrayList<String> blankURLs;

	public CommonAll(WebDriver driver) {
		this.driver = driver;
		blankURLs = new ArrayList<String>(Arrays.asList("", "about:blank"));
	}

	public void openBrowser(String url) throws Exception { // ##U
		try {
			this.driver = DriverSession.getLastExecutionDriver();

			if (GlobalParam.mergeCase) {
				String newURL = url;
				if (url.contains("@")) {
					String temp[] = url.split("//");
					String temp1[] = temp[1].split("@");
					newURL = temp[0] + "//" + temp1[1];
				}
				try {
					if (driver.getCurrentUrl().toLowerCase()
							.contains(newURL.toLowerCase())) {
						if (verifyPageInValid())
							reLaunchBrowser();
						else
							return;
					} else {
						if (!blankURLs.contains(driver.getCurrentUrl()
								.toLowerCase()))
							reLaunchBrowser();
					}
				} catch (Exception e) {
					reLaunchBrowser();
				}
			}

			if (!GlobalParam.CURRENT_EXECUTION_MODE.equals("androidWeb")) {
				try {
					Toolkit.getDefaultToolkit().getScreenSize();
					try {
						driver.manage().window().maximize();
					} catch (Exception e) {
						reLaunchBrowser();
						Keywords.explicitWait(1);
					}
				} catch (Exception ex) {
					ex.printStackTrace();
					System.out.println("old"
							+ driver.manage().window().getSize());
					Capabilities actualCapabilities = ((RemoteWebDriver) driver)
							.getCapabilities();
					System.out.println("get Platform"
							+ actualCapabilities.getPlatform().name());
					org.openqa.selenium.Dimension dim;
					if (actualCapabilities.getPlatform().name()
							.equalsIgnoreCase("mac"))
						dim = new org.openqa.selenium.Dimension(1920, 1080);
					else
						dim = new org.openqa.selenium.Dimension(1024, 768);
					driver.manage().window().setSize(dim);
					System.out.println("new"
							+ driver.manage().window().getSize());
				}
				try {
					System.out.println("Going to maximize browser window");
					driver.manage().window().maximize();
				} catch (Exception e) {

				}
			}

			if (GlobalParam.CURRENT_EXECUTION_MODE.equals("DesktopWeb"))
				if (url.contains("fqa") || url.contains("smoke")) {
					driver.navigate().to(url);
					Keywords.explicitWait(1);
					String newurl = url.replace("http://", "https://");
					if (!newurl.contains("fqa") || newurl.contains("staging1")) {
						String temp[] = newurl.split("@");
						String temp1[] = temp[1].split("shopclues");
						String server = "s" + temp1[0];
						if (server.contains("staging1"))
							server = server.replace("staging1", "staging");
						newurl = newurl.replace(temp1[0], server);
					}
					driver.navigate().to(newurl);
					Keywords.explicitWait(1);
				}

			driver.navigate().to(url);

			if (GlobalParam.CURRENT_EXECUTION_MODE.equals("DesktopWeb")
					&& !GlobalParam.FEATURE_TYPE.equalsIgnoreCase("MOBILE")) {
				Keywords.waitForPage(driver, 5);
				try {
					Alert alert = driver.switchTo().alert();
					alert.sendKeys("122001");
					alert.accept();
				} catch (Exception e) {
				} finally {
					driver.switchTo().defaultContent();
				}

			}
			driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Browser opened", "PASS",
							"Browser should be Open");
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Browser not opened", "FAIL",
							"Browser should be Open");
			throw new Exception("Browser is not launched");
		} finally {
			Keywords.waitForPage(driver, 60);
		}
	}

	public String getCurrentDateTime() { // ##U
		DateFormat dateFormat = new SimpleDateFormat("d-MMM-y H:m:s:SS");
		Date date = new Date();
		String currentTime = dateFormat.format(date);
		return currentTime;
	}

	public boolean verifyPageInValid() { // ##U
		try {
			String src = driver.getPageSource();
			if (src.contains("Problem loading page")
					|| src.contains("This webpage is not available")
					|| src.contains("Response denied by WatchGuard HTTP Proxy")
					|| src.contains("http://images.shopclues.com/images/msg_down.png")
					|| src.contains("You don't have permission to access the page.")
					|| src.isEmpty()
					|| GlobalParam.LastTestCaseSuccess.equals("0"))
				return true;
			return false;
		} catch (Exception e) {
			return false;
		}
	}

	public void reLaunchBrowser() { // ##U
		try {
			GlobalParam.LastTestCaseSuccess = "NA";
			DriverSession.getLastExecutionDriver().quit();
		} catch (Exception e) {
		} finally {
			DriverSession.setLastExecutionDriver(null);
		}
		DriverFactory df = new DriverFactory(GlobalParam.CURRENT_EXECUTION_MODE);
		driver = df.getDriver();
		DriverSession.setLastExecutionDriver(df.getDriver());
		Keywords.driver = df.getDriver();
	}

	public void closeBrowser() { // ##U
		try {
			DriverSession.getLastExecutionReportingInstance().footer();
			if (GlobalParam.mergeCase)
				return;
			if (GlobalParam.setSafari)
				this.clickLogOut();
			DriverSession.getLastExecutionDriver().quit();
			try {
				driver.quit();
			} catch (Exception e) {
			}
		} catch (Exception ee) {
		}
	}

	public void clickLogOut() throws Exception { // ##U
		WebElement element = null, logOutLink = null;
		try {
			if (DriverSession.getStepResult()) {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting(
								"Logout button clicked successfully", "PASS",
								"Logout button should be clicked successfully");
			} else {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting(
								"Logout button not clicked successfully",
								"FAIL",
								"Logout button should be clicked successfully");
			}
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Exception occured : ", "FAIL",
							e.toString());
			driver.get(GlobalParam.vendorUrl + "?dispatch=auth.logout");
			throw e;
		} finally {
			Keywords.waitForPage(driver, 60);
		}
	}

	public void logOutApplication() {
		try {
			if (GlobalParam.setSafari) {
				Keywords.waitForPage(driver, 30);
				clickLogOut();
			}
		} catch (Exception e) {
			e.getMessage();
		}
	}

	public void fillWebLoginForm() throws Exception { // ##U
		try {
			typeUserName();
			typePassword();
			clickOnLoginButton();
			Keywords.waitForPage(driver, 60);
			verifyValidCredentials();
			verifyUserIDOnHomePage();
		} catch (Exception e) {
			throw e;
		}
	}

	private void typeUserName() throws Exception { // ##U
		WebElement element = null;
		try {
			Keywords.typeText(element,
					DriverSession.getTestCaseData().get("User Name"));
			if (DriverSession.getStepResult()) {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting(
								"User name typed succefully. :: "
										+ DriverSession.getTestCaseData().get(
												"User Name"), "PASS",
								"User name should be entered.");
			} else {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting("User name not typed.", "FAIL",
								"User name should be typed.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Exception occured : ", "FAIL",
							e.toString());
			throw e;
		}
	}

	private void typePassword() throws Exception { // ##U
		WebElement element = null;
		try {
			Keywords.typeText(element,
					DriverSession.getTestCaseData().get("Password"));
			if (DriverSession.getStepResult()) {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting("Password typed succefully", "PASS",
								"Password should be entered");
			} else {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting("Password not typed.", "FAIL",
								"Password should be typed.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Exception occured : ", "FAIL",
							e.toString());
			throw e;
		}
	}

	private void clickOnLoginButton() throws Exception { // ##U
		WebElement element = null;
		try {
			Keywords.click(element);
			if (DriverSession.getStepResult()) {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting("Clicked on Login Button", "PASS",
								"Should be Clicked on Login Button");
			} else
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting("Not clicked On Login Button",
								"FAIL", "Should be Clicked on Login Button");
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting(
							"Not clicked On Login Button:: " + e.getMessage(),
							"FAIL", "Should be Clicked on Login Button");
			throw e;
		}
	}

	private void verifyValidCredentials() throws Exception { // ##U
		WebElement element = null;
		String text = "";
		try {

			if (element.isDisplayed()) {
				text = Keywords.getText(element);
				if (text.contains("invalid")) {
					DriverSession.getLastExecutionReportingInstance()
							.teststepreporting(text, "FAIL",
									"Error message should not show");
					GlobalParam.ExitTestCase = true;
					throw new Exception(
							"The username or password you have entered is invalid");
				}
			} else {
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"The username or password you have entered is valid.",
								"PASS", "Should be provide valid credentials.");
			}
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Exception...", "FAIL",
							"Error message should not show");
		}
	}

	private void verifyUserIDOnHomePage() throws Exception { // ##U
		WebElement element = null, loginLink = null;
		String text = "";
		try {
			try {
				Keywords.waitForPage(driver, 2);
				if (element.isDisplayed())
					text = Keywords.getText(element);
				else
					throw new Exception("");
			} catch (Exception e) {
				Keywords.waitForPage(driver, 60);
				Actions act = new Actions(driver);
				act.moveToElement(element).build().perform();
				text = Keywords.getText(loginLink);
			}

			if (text.equalsIgnoreCase(DriverSession.getTestCaseData().get(
					"User Name"))) {
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"User ID on Home page is verified successfully. :: "
										+ text
										+ "=="
										+ DriverSession.getTestCaseData().get(
												"User Name"), "PASS",
								"User ID on Home page should be verified successfully.");
			} else {
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"User ID on Home page is not verified successfully"
										+ text
										+ "!="
										+ DriverSession.getTestCaseData().get(
												"User Name"), "FAIL",
								"User ID on Home page should be verified successfully.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession
					.getLastExecutionReportingInstance()
					.teststepreporting(
							"User ID on Home page is not verified successfully : ",
							"FAIL",
							"User ID on Home page should be verified successfully.");
			throw e;
		} finally {
			Keywords.waitForPage(driver, 60);
		}
	}

	public void verifyTextOnPage(String message) { // ##U
		try {
			boolean present = driver.getPageSource().contains(message);
			if (present) {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting(message + " is present on page",
								"PASS", "Text should be present on page");
			} else {
				DriverSession.getLastExecutionReportingInstance()
						.teststepreporting(message + " is not present on page",
								"FAIL", "Text should be present on page");
			}
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Exception...", "FAIL",
							"Text should be present on page");
			e.printStackTrace();
		}
	}

	public void signOutExistingVendor() { // ##U
		try {
			Keywords.waitForPage(driver, 1);
			clickLogOut();
			Keywords.explicitWait(3);
		} catch (Exception e) {
		} finally {
			Keywords.waitForPage(driver, 60);
		}
	}

	public void openURL(String url) { // ##U
		try {
			driver.navigate().to(url);
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Successfully Navigate to Url : " + url,
							"PASS",
							"Should be able to navigate to specified URL");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Unable to Navigate to Url : " + url,
							"FAIL",
							"Should be able to navigate to specified URL");
		}
	}

	public void onlyInfo(String message) {
		DriverSession.getLastExecutionReportingInstance().teststepreporting(
				message, "INFO", "Only Information");
	}

	protected void readLoginDetails() { // ##U
		try {
			File file = getRandomRegistrationFile();
			Scanner sc = new Scanner(file);
			while (sc.hasNextLine()) {
				String line = sc.nextLine();
				String[] details = line.split(";");
				DriverSession.setUserName(details[0]);
				DriverSession.setPassword(details[1]);
				break;
			}
			sc.close();
		} catch (Exception e) {
		}
	}

	public void writeUserData(String emailRandom) { // ##U
		try {
			String userEmail = emailRandom;
			String password = DriverSession.getTestCaseData().get("Password");
			String userRegisterdFilePath = GlobalParam.CURRENT_PROJECT_PATH
					+ "/../UserRegistration/userRegistrationDetails"
					+ getTime() + ".txt";
			File file = new File(userRegisterdFilePath);
			file.createNewFile();
			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(userEmail + ";" + password);
			bw.close();
			DriverSession.setUserName(userEmail);
			DriverSession.setPassword(password);
			System.out.println("Text file created successfully at "
					+ file.getCanonicalPath());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void navigateToDesiredPage(String url) {
		try {
			if (!GlobalParam.CURRENT_EXECUTION_MODE.equals("androidWeb"))
				driver.manage().window().maximize();

			driver.navigate().to(url);
			Thread.sleep(1500);
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("Page Navigated successfully", "PASS",
							"page should be navigated to desired url");
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance()
					.teststepreporting("page not navigated", "FAIL",
							"page should be navigated to desired url");
		}
	}

	protected boolean verifyCartTotalEligibleForGC() throws Exception { // ##U
		int cartTotalEligible = 40;
		int total;
		try {
			WebElement element = null;
			if (GlobalParam.CURRENT_EXECUTION_MODE.equals("DesktopWeb"))
				element = null;
			String totalText = Keywords.getText(element);
			String split[] = totalText.split("s.");
			totalText = split[1];
			total = Integer.parseInt(totalText);
			if (total <= cartTotalEligible) {
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"Successfully verify Cart Total on payment page is eligible for apply GC",
								"PASS",
								"Should be able to verify Cart Total For GC applicable on Payment page");
				return true;
			} else
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"GC is not applicable for Cart Total Amout on payment page.",
								"FAIL",
								"Should be able to verify Cart Total For GC applicable on Payment page");
		} catch (Exception e) {
			DriverSession
					.getLastExecutionReportingInstance()
					.teststepreporting(
							"Exception ..verify Cart Total on payment page is eligible for apply GC.",
							"FAIL",
							"Should be able to verify Cart Total For GC applicable on Payment page");
		}
		return false;
	}

	protected boolean verifyCartTotalEligibleForGC(int maxValue)
			throws Exception { // ##U
		int total;
		try {
			WebElement element = null;
			if (GlobalParam.CURRENT_EXECUTION_MODE.equals("DesktopWeb"))
				element = null;
			String totalText = Keywords.getText(element);
			String split[] = totalText.split("s.");
			totalText = split[1];
			total = Integer.parseInt(totalText);
			if (total <= maxValue) {
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"Successfully verify Cart Total on payment page is eligible for apply GC",
								"PASS",
								"Should be able to verify Cart Total For GC applicable on Payment page");
				return true;
			} else
				DriverSession
						.getLastExecutionReportingInstance()
						.teststepreporting(
								"GC is not applicable for Cart Total Amout on payment page.",
								"FAIL",
								"Should be able to verify Cart Total For GC applicable on Payment page");
		} catch (Exception e) {
			DriverSession
					.getLastExecutionReportingInstance()
					.teststepreporting(
							"Exception ..verify Cart Total on payment page is eligible for apply GC.",
							"FAIL",
							"Should be able to verify Cart Total For GC applicable on Payment page");
		}
		return false;
	}

	public String getUrl(WebDriver driver) { // ##U
		String url = "";
		try {
			url = driver.getCurrentUrl();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return url;
	}

	public void undoTestChanges() throws IOException { // ##U
		try {
			String filepath = DriverSession.getUserRegistrationFilePath();
			File srcFile = new File(filepath);
			if (!filepath.isEmpty()) {
				File destDir = new File(GlobalParam.CURRENT_PROJECT_PATH
						+ "/../UserRegistration");
				FileUtils.moveFileToDirectory(srcFile, destDir, false);
			}
		} catch (Exception e) {

		}
	}

	private File getRandomRegistrationFile() throws IOException { // ##U
		File[] files;
		int value;
		File file;
		String path = GlobalParam.CURRENT_PROJECT_PATH + "/../UserRegistration";
		synchronized (this) {
			do {
				files = new File(path).listFiles();
				Random random = new Random();
				value = random.nextInt(files.length);
			} while (files[value].isDirectory() && files.length > 1);
			file = new File(path + "/Lock/" + files[value].getName());
			FileUtils.moveFile(files[value], file);
		}
		DriverSession.setUserRegistrationFilePath(file.getAbsolutePath());
		return file;
	}

	public long getTime() { // ##U
		Date date = new Date();
		return date.getTime();
	}
}