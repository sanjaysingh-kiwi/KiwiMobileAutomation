package com.utilities;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;
import java.util.Random;
import java.util.StringTokenizer;
import java.util.concurrent.TimeUnit;

import org.eclipse.jdt.core.compiler.InvalidInputException;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.session.DriverSession;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;

@SuppressWarnings("rawtypes")
public class Keywords {

	public static WebDriver driver;
	public static AppiumDriver a_Driver;
	// private static Logger logger =
	// Logger.getLogger(Keywords.class.getName());
	long strt_time, end_time, totalTime;
	public static int counter = 0;

	static {
		Keywords.driver = DriverSession.getLastExecutionDriver();
		try {
			a_Driver = (AppiumDriver) driver;
		} catch (Exception e) {
		}
	}

	public Keywords() {

	}

	public Keywords(AppiumDriver A_driver) { // ##U
		try {
			a_Driver = A_driver;
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public Keywords(AndroidDriver A_driver) { // ##U
		try {
			a_Driver = A_driver;
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public Keywords(WebDriver Driver) { // ##U
		try {
			driver = Driver;
			try {
				a_Driver = (AppiumDriver) driver;
			} catch (Exception e) {
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static String generateMobileNumber() { // ##U
		Random rm = new Random();
		String num = String.valueOf((int) (rm.nextInt(9) + 1));
		int i = 0;
		while (i != 9) {
			num = num.concat(String.valueOf((int) (rm.nextInt(9))));
			i++;
		}
		return num;
	}

	public static void scrollDown50PixelsFromTop(WebDriver driver) { // ##U
		scrollDownPixelsFromTop(driver, 50);
	}

	public static void scrollDownPixelsFromTop(WebDriver driver, int number) { // ##U
		((JavascriptExecutor) driver).executeScript("window.scrollTo(0," + number + ")");
	}

	public static void isCouponApplied(WebElement element) {
		String couponText;
		try {
			couponText = element.getText();
			if (couponText.contains("Successfully applied Coupon Code"))
				DriverSession.setStepResult(true);
			else
				DriverSession.setStepResult(false);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void clearEditField(WebElement element) { // ##U
		try {
			element.clear();
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void validateElementExistOrNot(WebElement element) { // ##U
		try {
			DriverSession.setStepResult(element.isDisplayed());
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
	}

	public static void waitForPageLoad(WebDriver driver) {
		driver.manage().timeouts().pageLoadTimeout(60, TimeUnit.SECONDS);
	}

	public static void waitForPage(WebDriver driver) { // ##U
		driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
	}

	public static void waitForPage(WebDriver driver, int time) { // ##U
		driver.manage().timeouts().implicitlyWait(time, TimeUnit.SECONDS);
	}

	public static void selectByIndex(WebElement element, int index) { // ##U
		try {
			new Select(element).selectByIndex(index);
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void keyBoardEvent(int eventNumber, String Environment) {
		try {
			if (Environment.equalsIgnoreCase("windows")) {
				Thread.sleep(1000);
				Runtime.getRuntime().exec("cmd /C adb shell input keyevent " + eventNumber);
				Thread.sleep(3000);
			} else if (Environment.equalsIgnoreCase("Linux")) {
				Runtime.getRuntime().exec(new String[] { "/usr/bin/adb", "shell input keyevent " + eventNumber });
			}
		} catch (Throwable t) {
			t.printStackTrace();
		}
	}

	public static double addOnePercentInValue(double value) {
		value = value + ((value * 1) / 100);
		return value;
	}

	public static double subtractOnePersentInValue(double value) {

		value = value - ((value * 1) / 100);
		return value;
	}

	public static void explicitWait(int timeInSec) { // ##U
		try {
			Thread.sleep(1000 * timeInSec);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void refreshPage() { // ##U
		driver.navigate().refresh();
		Keywords.explicitWait(5);
		DriverSession.getLastExecutionReportingInstance().teststepreporting("Page refreshed....", "INFO",
				"Should be able to reload page.");
	}

	public static Alert waitForAlert(WebDriver driver, Alert alert) throws InterruptedException { // ##U
		int i = 0;
		while (i++ < 5) {
			try {
				alert = driver.switchTo().alert();
				break;
			} catch (NoAlertPresentException e) {
				Thread.sleep(1000);
				continue;
			}
		}
		return alert;
	}

	public static void clickByText(List<WebElement> elements, String text) { // ##U
		try {
			DriverSession.setStepResult(false);
			for (WebElement elemnt : elements) {
				if (elemnt.getText().equalsIgnoreCase(text)) {
					elemnt.click();
					DriverSession.setStepResult(true);
					break;
				}
			}
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}
	
	public static void acceptAlert(){
		try{
			DriverSession.setStepResult(false);
			DriverSession.getLastExecutionDriver().switchTo().alert().accept();
			DriverSession.setStepResult(true);
		}catch(Exception e){
			DriverSession.setStepResult(false);
		}
	}

	public static void clickByPartialText(List<WebElement> elements, String text) {
		try {
			for (WebElement elemnt : elements) {
				if (elemnt.getText().toLowerCase().contains(text)) {
					elemnt.click();
					DriverSession.setStepResult(true);
					break;
				}
			}
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void click(WebElement element) { // ##U
		try {
			element.click();
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void typeText(WebElement element, String text) { // ##U
		try {
			element.clear();
			element.sendKeys(text);
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void typeTextByIndex(List<WebElement> elements, int index, String text) {
		try {
			int i = 0;
			for (WebElement element : elements) {
				if (i == index) {
					element.sendKeys(text);
					DriverSession.setStepResult(true);
					break;
				}
				i++;
			}
		} catch (Exception ee) {
		}
	}

	public static Properties loadPropertiesOfNiftyAndSensex() {
		InputStream input = null;
		Properties prop = null;
		String filePath = "";
		try {
			filePath = GlobalParam.CURRENT_PROJECT_PATH + "\\" + "sensexAndNiftyValues.properties";
			prop = new Properties();
			input = new FileInputStream(new File(filePath));
			prop.load(input);

		} catch (Exception ee) {
			ee.printStackTrace();
		}
		return prop;
	}

	public static double getNiftyValueFromSite() {
		Properties p = null;
		double currentNiftyPrice = 0;
		try {
			p = loadPropertiesOfNiftyAndSensex();
			currentNiftyPrice = Double.parseDouble(p.getProperty("currentNiftPrice"));
		} catch (Exception ee) {
		}
		return currentNiftyPrice;
	}

	public static double getSensexValueFromSite() {
		Properties p = null;
		double currentSensexPrice = 0;
		try {
			p = loadPropertiesOfNiftyAndSensex();
			currentSensexPrice = Double.parseDouble(p.getProperty("currentSensexPrice"));
		} catch (Exception ee) {
		}
		return currentSensexPrice;
	}

	public static String getTextByIndex(List<WebElement> elements, int index) { // ##U
		String text = "";
		try {
			int i = 0;
			for (WebElement element : elements) {
				if (i == index) {
					text = element.getText();
					DriverSession.setStepResult(true);
					break;
				}
				i++;
			}
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
		return text;
	}

	public boolean isProcessRunging(String serviceName) {
		try {
			Process p = Runtime.getRuntime().exec("TASKLIST");
			BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
			String line;
			while ((line = reader.readLine()) != null) {
				if (line.contains(serviceName)) {
					return true;
				}
			}
		} catch (Exception e) {

		}
		return false;
	}

	// public static void swipeVertically(int ScreenHightValue) {
	// try {
	//
	// Dimension screenSize = DriverSession.getLastExecutionDriver()
	// .manage().window().getSize();
	// Double screenWidth = Double.valueOf(String.valueOf(screenSize
	// .getWidth())) / 2;
	// Double screenHight = Double.valueOf(String.valueOf(screenSize
	// .getHeight())) / 2;
	// JavascriptExecutor js = (JavascriptExecutor) DriverSession
	// .getLastExecutionDriver();
	//
	// HashMap<String, Object> swipeObject = new HashMap<String, Object>();
	//
	// swipeObject.put("startX", screenWidth);
	// swipeObject.put("startY", screenHight + ScreenHightValue);
	// swipeObject.put("endX", screenWidth);
	// swipeObject.put("endY", screenHight);
	// swipeObject.put("duration", 1.8);
	// js.executeScript("mobile: swipe", swipeObject);
	//
	// } catch (Exception ex) {
	//
	// ex.printStackTrace();
	//
	// }
	//
	// }

	public static void swipeVertically(int swipeValue) {
		try {
			Double swipeHight = 0.0;
			swipeHight = (double) swipeValue;
			Dimension screenSize = DriverSession.getLastExecutionDriver().manage().window().getSize();
			Double screenWidth = Double.valueOf(String.valueOf(screenSize.getWidth())) / 2;
			Double screenHight = Double.valueOf(String.valueOf(screenSize.getHeight())) / 2;

			if (screenHight + swipeValue > screenHight * 2 || swipeValue == 0) {
				swipeHight = screenHight / 2;

			}

			JavascriptExecutor js = (JavascriptExecutor) DriverSession.getLastExecutionDriver();
			HashMap<String, Object> swipeObject = new HashMap<String, Object>();
			swipeObject.put("startX", screenWidth);
			swipeObject.put("startY", screenHight + swipeHight);
			swipeObject.put("endX", screenWidth);
			swipeObject.put("endY", screenHight);
			swipeObject.put("duration", 1.8);
			js.executeScript("mobile: swipe", swipeObject);

		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public static void swipeMultipleIteration(int iteration) {
		int i = 0;
		try {
			while (i < iteration) {
				// //System.out.println(element.getText());
				// if(element.getText().equals(text))
				// break;
				swipeVertically(300);
				i++;
				// elements=ViewPortFolioPage.getInstance().listCreatedPortFolios(DriverSession.getLastExecutionDriver());
			}
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
	}

	public static String getText(WebElement elemet) { // ##U
		String textVal = "";
		try {
			textVal = elemet.getText();
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
		return textVal;
	}

	public static boolean isElementPresent(WebElement elemet) { // ##U
		boolean flag = false;
		if (GlobalParam.setSafari)
			explicitWait(1);
		try {
			flag = elemet.isDisplayed();
			DriverSession.setStepResult(flag);
		} catch (Exception ee) {
			DriverSession.setStepResult(flag);
		}
		return flag;
	}

	public static String getAttributeVal(WebElement elemet, String text) { // ##U
		String textVal = "";
		try {
			textVal = elemet.getAttribute(text);
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
		return textVal;
	}

	public static String getTextByText(List<WebElement> elements, String text) {
		String value = "";
		try {
			for (WebElement element : elements) {

				if (element.getText().equals(text)) {
					value = element.getText();
					DriverSession.setStepResult(true);
					return value;
				}
			}
			DriverSession.setStepResult(false);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
		return text;
	}

	public static void verifyValues(double v1, double v2) {
		try {
			v1 = Math.round(v1);
			v2 = Math.round(v2);
			if (v1 == v2) {
				DriverSession.setStepResult(true);
			} else {
				DriverSession.setStepResult(false);
			}
		}

		catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void selectText(WebElement element, String text) { // ##U
		try {
			new Select(element).selectByVisibleText(text);
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public void javaScriptExecuter() {
		((JavascriptExecutor) driver).executeScript("document.getElementByClass('ui-datepicker-month').value = '3';");
		((JavascriptExecutor) driver).executeScript("document.getElementByClass('datepicker-year').value = '1998';");
		((JavascriptExecutor) driver)
				.executeScript("document.getElementByClass('ui-datepicker-current-day').value = '1998';");
		((JavascriptExecutor) driver)
				.executeScript("document.getElementsById('transactionDate').removeAttribute('readonly');");

	}

	public static double getTextFromPage(List<WebElement> elements) {
		String text = "";
		double currentAmount = 0;
		try {
			for (WebElement element : elements) {
				text = element.getText();
				// System.out.println("getTextFromPage" + text);
				if (text.equalsIgnoreCase("Current Value") || text.equalsIgnoreCase("Today's Change"))
					continue;

				if (text.contains("K")) {
					text = text.substring(0, text.length() - 1);
				} else {
					// System.out.println("R u mad ?");
				}
				currentAmount += Double.parseDouble(text);
			}
			// System.out.println("currentAmount " + currentAmount);
			DriverSession.setStepResult(true);
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
		return currentAmount;
	}

	public static String changeDateFormate(String oldDate) {
		String newDate = "";
		try {
			final String OLD_FORMAT = "dd/MM/yyyy";
			final String NEW_FORMAT = "dd-MM-yyyy";
			SimpleDateFormat sdf = new SimpleDateFormat(OLD_FORMAT);
			Date d = sdf.parse(oldDate);
			sdf.applyPattern(NEW_FORMAT);
			newDate = sdf.format(d);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return newDate;
	}

	public static void isColorRed(WebElement element) {
		String color;
		try {
			color = element.getAttribute("class");
			if (color.contains("red")) {
				DriverSession.setStepResult(true);
			} else {
				DriverSession.setStepResult(false);
			}
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static void waitForObject(WebElement element) { // ##U
		try {
			WebDriverWait wait = new WebDriverWait(DriverSession.getLastExecutionDriver(), 120);
			wait.until(ExpectedConditions.visibilityOf(element));
		} catch (Exception e) {
		}
	}

	public static void waitForObject(WebElement element, long tme) { // ##U
		try {
			WebDriverWait wait = new WebDriverWait(DriverSession.getLastExecutionDriver(), tme);
			wait.until(ExpectedConditions.visibilityOf(element));
		} catch (Exception e) {
			// Ignore in case of Exception
		}
	}

	public static void waitForObjectToInvisible(By element, long tme) { // ##U
		WebDriverWait wait = new WebDriverWait(DriverSession.getLastExecutionDriver(), tme);
		wait.until(ExpectedConditions.invisibilityOfElementLocated(element));
	}

	public static void swipeuntilObjectNotFound(int iterator) {
		try {
			for (int i = 0; i < iterator; i++)
				swipeVertically(300);
		} catch (Exception ee) {

		}
	}

	public static void clickByIndex(List<WebElement> elements, int index) { // ##U
		int idx = 0;
		try {
			for (WebElement elem : elements) {
				if (idx == index) {
					elem.click();
					DriverSession.setStepResult(true);
					break;
				}
				idx++;
			}
		} catch (Exception ee) {
			DriverSession.setStepResult(false);
		}
	}

	public static String getCssValue(WebElement element, String attributeName) { // ##U
		String value = "";
		try {
			value = element.getCssValue(attributeName);
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
		return value;
	}

	public static List<String> validatCredentials(WebElement ph_No, WebElement city_State, WebElement pin) {
		// TODO Auto-generated method stub
		List<String> al = new ArrayList<String>();
		try {

			al.add(ph_No.getText());
			al.add(city_State.getText());
			al.add(pin.getText());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return al;
	}

	public static float floatParser(WebElement element) { // ##U
		String elements = "";
		float value = 0.0f;
		DriverSession.setStepResult(false);
		try {
			elements = element.getText();
			elements = elements.replace(",", "");
			value = Float.parseFloat(elements);
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return value;
	}

	public static int integerParser(WebElement element) {
		String elements = "";
		int value = 0;
		DriverSession.setStepResult(false);
		try {
			elements = element.getText();
			value = Integer.parseInt(elements);
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return value;
	}

	// This method calculates total qty rate inside Shopping cart
	public static float verifyShoppingCartPageDetails(WebElement Quantity, WebElement rate) { // ##U
		int qty = 0;
		float amt = 0.0f;
		float total = 0;
		DriverSession.setStepResult(false);
		try {
			String qty1 = Quantity.getText();
			String amt1 = rate.getText();
			qty = Integer.parseInt(qty1);

			amt1 = amt1.replace(",", "");
			amt = Float.parseFloat(amt1);
			total = qty * amt;
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return total;
	}

	public static int expectedCalculation(String first, String middle) {
		int val1 = 0;
		int val2 = 0;
		int total = 0;
		try {
			val1 = Integer.parseInt(first);
			val2 = Integer.parseInt(middle);
			total = val1 + val2;
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return total;
	}

	public static int getCartValue(WebElement element) {
		int cartValue = 0;
		try {
			String value = element.getText();
			cartValue = Integer.valueOf(value);
			DriverSession.setStepResult(true);

		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return cartValue;
	}

	public static String verifyTextfromDropDown(WebElement element, String textName) { // ##U
		String textDropDownField = "";
		DriverSession.setStepResult(false);
		try {
			textDropDownField = element.getText();
			if (textDropDownField.equalsIgnoreCase(textName)) {
				DriverSession.setStepResult(true);
			}
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
		return textDropDownField;
	}

	public static String getRandomizedString(String fName, String lName, String domain) { // ##U
		String result = null;
		DriverSession.setStepResult(false);
		try {
			result = fName + "" + lName + "" + (Long.toHexString(System.currentTimeMillis())) + domain;
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return result;
	}

	public static void verifyTextOnPage(String text) {
		boolean textFound = false;
		try {
			textFound = driver.getPageSource().contains(text);

			if (textFound) {
				DriverSession.getLastExecutionReportingInstance().teststepreporting(text + "  Text verified.", "PASS",
						"Text should be verified.");
			} else {
				DriverSession.getLastExecutionReportingInstance().teststepreporting(text + "  Text not verified.",
						"FAIL", "Text should not  be verified.");
			}
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting(text + "  Text not verified.", "PASS",
					"Text should not be verified.");
		}
	}

	public static void validateSingleElementWithMultiple(List<WebElement> element, String option) { // ##U
		try {
			DriverSession.setStepResult(false);
			for (WebElement element2 : element) {
				if (element2.getText().equalsIgnoreCase(option)) {
					DriverSession.setStepResult(true);
					break;
				} else {
					DriverSession.setStepResult(false);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static String getRandomData() {
		String result = null;
		DriverSession.setStepResult(false);
		try {
			result = "" + System.currentTimeMillis();
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
		return result;
	}

	public static int getRandomInteger(int maxRange) { // ##U
		int result = 0;
		try {
			Random t = new Random();
			result = t.nextInt(maxRange);
		} catch (Exception e) {
		}
		return result;
	}

	public static void setChangePasswordProperties(String randomPassword) {
		try {
			Properties prop = new Properties();
			OutputStream output = null;
			try {
				output = new FileOutputStream(GlobalParam.PROJECT_ROOT_PATH
						+ "Regression Suite - crestech/ShopcluesMobileAutomation/TestRepository/ChangePassword.properties");
				prop.setProperty("New_Password", randomPassword);
				prop.store(output, null);

			} catch (IOException io) {
				io.printStackTrace();
			} finally {
				if (output != null) {
					try {
						output.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}

			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static String getChangePasswordProperties(String value) {
		FileInputStream fileInput = null;
		Properties prop = new Properties();
		try {
			File file = new File(GlobalParam.PROJECT_ROOT_PATH
					+ "Regression Suite - crestech/ShopcluesMobileAutomation/TestRepository/ChangePassword.properties");
			fileInput = new FileInputStream(file);

			try {
				prop.load(fileInput);
			} catch (Exception e) {
				e.printStackTrace();
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return (prop.getProperty(value));
	}

	public static ArrayList<String> verifyMultipleClickableObjects(List<WebElement> element) {
		ArrayList<String> al = new ArrayList<String>();
		try {
			DriverSession.setStepResult(false);
			for (WebElement elements : element) {
				if (elements.isDisplayed()) {
					DriverSession.setStepResult(true);
					al.add(elements.getText());
				} else {
					DriverSession.setStepResult(false);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return al;
	}

	public static String verifyMultipleIsEnabledObjects(List<WebElement> element) {
		String object_Name = null;
		try {
			DriverSession.setStepResult(false);
			// System.out.println(element.size());
			for (WebElement elements : element) {
				if (elements.getAttribute("checked").equalsIgnoreCase("true")) {

					DriverSession.setStepResult(true);
					object_Name = elements.getText();
					break;
				} else {
					DriverSession.setStepResult(false);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return object_Name;
	}

	public static List<String> splitRowDataWithPipeOperator(String dataSheet) { // ##U
		List<String> al = new ArrayList<String>();
		try {
			StringTokenizer split_Data = new StringTokenizer(dataSheet, GlobalParam.tokenType);
			while (split_Data.hasMoreTokens()) {
				al.add(split_Data.nextToken());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return al;
	}

	public static void validateAndFetchRadioButtonValue(List<WebElement> payment_RaddioButtons,
			String pmtTextFieldValue, String payment_Options) {
		DriverSession.setStepResult(false);
		int count = 0;
		String actual = null;
		List<String> options = new ArrayList<String>();
		List<String> option2 = new ArrayList<String>();
		try {
			DriverSession.setStepResult(true);
			options = Keywords.splitRowDataWithPipeOperator(payment_Options);
			option2 = Keywords.splitRowDataWithPipeOperator(pmtTextFieldValue);

			for (WebElement paymentOption : payment_RaddioButtons) {
				for (int i = count; i < options.size(); i++) {
					if (paymentOption.getText().equalsIgnoreCase(options.get(i))) {
						DriverSession.setStepResult(true);

						paymentOption.click();

						count++;
						try {
							actual = null;
							// actual = PaymentMethod.getInstance()
							// .getStringFromTextField(driver);

							if (actual.equalsIgnoreCase(option2.get(i)))
								;
							{
								DriverSession.setStepResult(true);

								DriverSession.getLastExecutionReportingInstance().teststepreporting(
										"<u>PaymentMethod Page : </u><br> By clicking to <b>" + paymentOption.getText()
												+ "</b> value is  <b><i> " + actual
												+ "</b><br>options is successfully validated ",
										"PASS",
										"<u>PaymentMethod Page : </u><br> clicking to <b>" + paymentOption.getText()
												+ "</b> - <b><i> " + actual
												+ " </b><br>options should be successfully validated Clicked");
							}
							break;
						} catch (Exception oo) {
							DriverSession.getLastExecutionReportingInstance().teststepreporting(
									"<u>PaymentMethod Page : </u><br> By clicking to <b> " + paymentOption.getText()
											+ " </b>no option in text field is visible successfully validated ",
									"PASS",
									"<u>PaymentMethod Page : </u><br> By clicking to <b> Cash on Delivery </b>no option in text field should be successfully validated Clicked");
						}
					} else {
						DriverSession.getLastExecutionReportingInstance().teststepreporting(
								"<u>PaymentMethod Page : </u><br> By clicking to <b>" + paymentOption.getText()
										+ " </b>value is <b><i> " + actual
										+ " </b><br>options is not successfully validated ",
								"FAIL",
								"<u>PaymentMethod Page : </u><br> clicking to <b>" + paymentOption.getText()
										+ "</b> - <b><i> " + actual
										+ " </b><br>options should be successfully validated Clicked");
						continue;

					}
				}
			}
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
	}

	public static void dynamicwait(WebDriver driver, Integer time, WebElement element) { // ##U
		try {
			(new WebDriverWait(driver, time)).until(ExpectedConditions.elementToBeClickable(element));
			if (DriverSession.getStepResult()) {
				DriverSession.getLastExecutionReportingInstance().teststepreporting("Wait for object successfully",
						"PASS", "Should be wait for object");
			} else {
				DriverSession.getLastExecutionReportingInstance().teststepreporting("Wait for object failed", "FAIL",
						"Should be wait for object");
			}
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Wait for object failed", "FAIL",
					"Should be wait for object");
		}
	}

	public static void dynamicwaitForElementToBeVisible(WebDriver driver, Integer time, WebElement element,
			boolean message) { // ##U
		try {
			(new WebDriverWait(driver, time)).until(ExpectedConditions.visibilityOf(element));
			if (message)
				DriverSession.getLastExecutionReportingInstance().teststepreporting(
						"Wait for Visibility of object successfully", "PASS",
						"Should be wait for Visibility of object");
		} catch (Exception e) {
			if (message)
				DriverSession.getLastExecutionReportingInstance().teststepreporting("Wait for object failed", "FAIL",
						"Should be wait for Visibility of object");
		}
	}

	public static void hideKeyBoard() { // ##U
		try {
			a_Driver.hideKeyboard();
		} catch (Exception e) {
			// e.printStackTrace();
		}
	}

	public static String ltrim(String name) {
		String option = "";
		String split[] = name.split(" ");
		for (int i = 1; i < split.length; i++) {
			option = option + " " + split[i];
		}
		return option;
	}

	public static void setValueToProperties(String key_Name, String value_Name) {
		try {
			Properties prop = new Properties();
			OutputStream output = null;
			try {
				output = new FileOutputStream(GlobalParam.PROJECT_ROOT_PATH
						+ "Regression Suite - crestech/ShopcluesMobileAutomation/TestRepository/MerchantEmailID.properties");
				prop.setProperty(key_Name, value_Name);
				prop.store(output, null);

			} catch (IOException io) {
				io.printStackTrace();
			} finally {
				if (output != null) {
					try {
						output.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}

			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static String getValueFromPropertiesFile(String key) {
		FileInputStream fileInput = null;
		Properties prop = new Properties();
		try {
			File file = new File(GlobalParam.PROJECT_ROOT_PATH
					+ "Regression Suite - crestech/ShopcluesMobileAutomation/TestRepository/MerchantEmailID.properties");
			fileInput = new FileInputStream(file);

			try {
				prop.load(fileInput);
			} catch (Exception e) {
				e.printStackTrace();
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return (prop.getProperty(key));
	}

	public static List<String> convertAlphaNumericToAlphabetical(String name) {
		DriverSession.setStepResult(false);
		char array[] = new char[26];
		List<String> list = new ArrayList<String>();
		int flag = 0, c = 0;
		try {
			char ch[] = name.toCharArray();
			for (int i = 0; i < ch.length; i++) {
				flag = 0;
				for (char j = '0'; j <= '9'; j++) {
					if (ch[i] == j) {
						flag++;
					} else {
						continue;
					}
				}
				if (flag == 0) {
					array[c] = ch[i];
					c++;
				}
			}
			String str = new String(array);
			list.add(str.trim());
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.setStepResult(false);
		}
		return list;
	}

	public static void selectByVisibleText(WebElement element, String name) { // ##U
		DriverSession.setStepResult(false);
		try {
			Select select1 = new Select(element);
			select1.selectByVisibleText(name);
			DriverSession.setStepResult(true);

			if (DriverSession.getStepResult()) {
				DriverSession.getLastExecutionReportingInstance().teststepreporting(
						"Product : " + element.getText() + " is successfully clicked and " + name
								+ " is selected successfully ",
						"PASS", "Product : " + element.getText() + " should be successfully clicked and " + name
								+ " should be selected successfully ");
			} else {
				DriverSession.getLastExecutionReportingInstance().teststepreporting(
						"Product : " + element.getText() + " is not successfully clicked and " + name
								+ " is not selected successfully ",
						"FAIL", "Product : " + element.getText() + " should be successfully clicked and " + name
								+ " should be selected successfully ");
			}
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Product : " + element.getText() + " is not successfully clicked and " + name
							+ " is not selected successfully ",
					"FAIL", "Product : " + element.getText() + " should be successfully clicked and " + name
							+ " should be selected successfully ");
		}
	}

	public static void keyEnter(WebElement element) { // ##U
		DriverSession.setStepResult(false);
		try {
			element.sendKeys(Keys.RETURN);
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
	}

	public static String getTextFromObject(WebElement element) {
		String message = "";
		DriverSession.setStepResult(false);
		try {
			message = element.getText();
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.getMessage();
		}
		return message;
	}

	public static float valueAfterCODCharges(float subTotal, int CODCharges) {
		float total = 0.0f;
		DriverSession.setStepResult(false);
		try {
			total = (subTotal + CODCharges);
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.getMessage();
		}
		return total;
	}

	public static String getRoundValue(String value) {
		DriverSession.setStepResult(false);
		String actualResult = "";
		int exp = 0;
		try {
			exp = Math.round(Float.parseFloat(value));
			actualResult = exp + "";
			DriverSession.setStepResult(true);
		} catch (NumberFormatException e) {
			DriverSession.setStepResult(false);
			e.getMessage();
		}
		return actualResult;
	}

	public static void moveToElementClick(WebElement element, WebDriver driver, int value) { // ##U
		try {
			DriverSession.setStepResult(false);
			switch (value) {
			case 1:
				Actions action1 = new Actions(driver);
				action1.moveToElement(element).perform();
				DriverSession.setStepResult(true);
				break;
			case 2:
				Actions action2 = new Actions(driver);
				action2.moveToElement(element).click();
				DriverSession.setStepResult(true);
				break;
			case 3:
				element.click();
				DriverSession.setStepResult(true);
				break;
			case 4:
				Actions action4 = new Actions(driver);
				action4.moveToElement(element).doubleClick().perform();
				DriverSession.setStepResult(true);
				break;
			default:
				DriverSession.setStepResult(false);
				throw new InvalidInputException();
			}
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.getMessage();
		}
	}

	public static void moveToElementClick(WebElement element, WebDriver driver) { // ##U
		try {
			DriverSession.setStepResult(false);
			Actions action2 = new Actions(driver);
			action2.moveToElement(element).click().perform();
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
	}

	public static List<String> getDropDownValue(WebElement element) { // ##U
		List<String> value = new ArrayList<String>();
		try {
			Select st = new Select(element);
			List<WebElement> al = st.getOptions();
			for (WebElement option : al) {
				value.add(option.getText());
			}
		} catch (Exception e) {
			e.getMessage();
		}
		return value;
	}

	public static void getDefaultDropDownValue(String tabName, WebElement element, WebDriver driver) {
		List<String> value = new ArrayList<String>();
		try {
			Select st = new Select(element);
			List<WebElement> al = st.getAllSelectedOptions();
			for (WebElement all : al) {

				value.add(all.getText());
				if (all.getText() != null) {
					DriverSession.getLastExecutionReportingInstance().teststepreporting(
							"<b> " + tabName + " </b> with default Value is <br><b><i>" + all.getText()
									+ "</b></i><br> is selected and validated successfully <br>",
							"PASS", "Search Field should be successfully typed and clicked");
					break;
				} else {
					DriverSession.getLastExecutionReportingInstance().teststepreporting(
							"<b> " + tabName + " </b> with default Value is <br><b><i>" + all.getText()
									+ "</b></i><br> is not selected and validated successfully <br>",
							"FAIL", "Search Field should be successfully typed and clicked");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void clickSelectTypetext(WebElement type, String string) { // ##U
		DriverSession.setStepResult(false);
		try {
			Select selectByIndex = new Select(type);
			selectByIndex.selectByVisibleText(string);
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
			e.printStackTrace();
		}
	}

	public static void closeAlertpopup(WebDriver driver2) { // ##U
		DriverSession.setStepResult(false);
		try {
			Alert alert = driver2.switchTo().alert();
			explicitWait(1);
			alert.accept();
			DriverSession.setStepResult(true);
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Popup is closed", "INFO",
					"Popup should be closed");
		} catch (Exception e) {
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Exception... " + e.getMessage(),
					"FAIL", "Popup should be closed");
			DriverSession.setStepResult(false);
			e.printStackTrace();
		} finally {
			driver2.switchTo().defaultContent();
		}
	}

	public static void validatePageContents(WebElement elements, List<String> val) {
		DriverSession.setStepResult(false);
		String gotText = elements.getText();
		try {
			for (int i = 0; i < val.size(); i++) {

				if (gotText.contains(val.get(i))) {

					DriverSession.getLastExecutionReportingInstance().teststepreporting(
							"<b><i>" + val.get(i) + "</i></b> is successfully Verified<br>", "PASS",
							"<b><i>" + val.get(i) + "</i></b> should be successfully Verified");
					DriverSession.setStepResult(true);
				} else {
					DriverSession.getLastExecutionReportingInstance().teststepreporting(
							"<b><i>" + val.get(i) + "</i></b> is not Verified", "FAIL",
							"<b><i>Task</i></b> should be successfully Verified");
					DriverSession.setStepResult(false);
					continue;
				}
			}
		} catch (Exception e) {
			e.getMessage();
		}
	}

	public static boolean isTextPresent(String text) {
		try {
			boolean b = driver.getPageSource().contains(text);
			return b;
		} catch (Exception e) {
			return false;
		}
	}

	public static void swiper() { // ##U
		try {
			a_Driver.swipe(150, 500, 150, 50, 100);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void scrollingToBottomOfAPage(WebDriver driver) { // ##U
		((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
	}

	// Munish - The below method is for debug purpose only, Remove the calling
	// of this method when we are running the things on production
	public static void getPageSource1(String pgSource) { // ##U
		try {
			File file = new File(GlobalParam.CURRENT_PROJECT_PATH + "/TestRepository/pageSource1Temp.txt");
			file.createNewFile();

			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(pgSource);
			bw.close();
		} catch (Exception e) {

		}
	}

	// Munish - The below method is for debug purpose only, Remove the calling
	// of this method when we are running the things on production
	public static void getPageSource2(String pgSource) { // ##U
		try {
			File file = new File(GlobalParam.CURRENT_PROJECT_PATH + "/TestRepository/pageSource2Temp.txt");
			file.createNewFile();

			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(pgSource);
			bw.close();
		} catch (Exception e) {

		}
	}

	public static void paceActiveCheck_t(WebDriver driver) { // ##U
		try {
			long startTime = System.currentTimeMillis();
			explicitWait(1);
			while ((System.currentTimeMillis() - startTime) < 2.5 * 60 * 1000) {
				try {
					if (driver.getPageSource().contains("pace-inactive"))
						break;
				} catch (Exception e) {
					break;
				}
			}
		} catch (Exception e) {
		}
		explicitWait(1);
	}

	public static void paceActiveCheck(WebDriver driver) { // ##U
		try {
			Keywords.explicitWait(5);
		} catch (Exception e) {
		}
	}

	public static void scrollingToTopOfAPage(WebDriver driver) { // ##U
		((JavascriptExecutor) driver).executeScript("window.scrollTo(0, 0)");
	}

	public By checkElement(WebDriver driver, By web) {
		WebDriverWait wait = new WebDriverWait(driver, 3);
		for (int i = 0; i < 6; i++) {
			try {
				wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(web));
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				return web;
			} catch (Exception e) {
				driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
				a_Driver.swipe(50, 500, 50, 50, 100);
			}
		}
		driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
		return web;
	}

	public static void scrollUntilTextFound() {
		try {
			a_Driver.swipe(50, 500, 50, 50, 100);
		} catch (Exception e) {
			e.getMessage();
		}
	}

	public static void scrollDown() { // ##U
		try {
			a_Driver.swipe(50, 500, 50, 50, 100);
		} catch (Exception e) {
			e.getMessage();
		}
	}

	public static void clickCancel(WebDriver driver) { // ##U
		try {
			waitForPage(driver, 1);
			driver.findElement(By.xpath("//div[@class='buttons-container']//a[@class='cm-dialog-closer tool-link']"))
					.click();
		} catch (Exception e) {
		} finally {
			waitForPage(driver, 60);
		}
	}

	public static String getTimeStampValue() {
		Date date = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("MM-dd-yyyy h:mm:ss.mmm");
		String formattedDate = sdf.format(date);
		System.out.println(formattedDate);
		return formattedDate;
	}

	public static void backPage() {
		try {
			driver.navigate().back();
		} catch (Exception e) {
		}
	}

	public static void swipeVerticallyTillObject(int swipeValue) { // ##U
		try {
			int swipeHight = 0;
			swipeHight = swipeValue;
			Dimension screenSize = a_Driver.manage().window().getSize();

			int screenWidth = screenSize.getWidth() / 2;
			int screenHight = screenSize.getHeight() / 2;
			if (screenHight + swipeValue > screenHight * 2 || swipeValue == 0) {
				swipeHight = screenHight / 2;
			}

			a_Driver.swipe(screenWidth, screenHight + swipeHight, screenWidth, screenHight, 1000);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public static void swipeVerticallyOneIteration() { // ##U
		try {
			int swipeHight = 0;
			Dimension screenSize = a_Driver.manage().window().getSize();

			int screenWidth = screenSize.getWidth() / 2;
			int screenHight = screenSize.getHeight() / 2;
			swipeHight = screenHight * 3 / 4;

			a_Driver.swipe(screenWidth, screenHight + swipeHight, screenWidth, screenHight, 1000);
			Keywords.explicitWait(4);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public static boolean swipeTillObjectDisplayedAndClick(WebDriver driver, String objectText) { // ##U
		int size;
		boolean flag = false;
		try {
			List<WebElement> elements = driver.findElements(By.id("com.shopclues:id/name"));
			size = elements.size();
			System.out.println("Size " + size);
			for (WebElement element : elements) {
				System.out.println("Itration " + element.getText());
				if (element.getText().equals(objectText)) {
					element.click();
					flag = true;
					break;
				}
				size--;
			}
			if (size == 0 && flag == false) {
				swipeVerticallyTillObject(600);
				flag = swipeTillObjectDisplayedAndClick(driver, objectText);
			}
		} catch (Exception e) {
			flag = false;
		}
		return flag;
	}

	public static boolean swipeTillCategoryDisplayedAndClick(WebDriver driver, String objectText) {
		int size;
		boolean flag = false;
		try {
			List<WebElement> elements = driver.findElements(By.id("com.shopclues:id/text"));
			size = elements.size();
			System.out.println("Size " + size);
			for (WebElement element : elements) {
				System.out.println("Itration " + element.getText());
				if (element.getText().equals(objectText)) {
					element.click();
					flag = true;
					break;
				}
				size--;
			}
			if (size == 0 && flag == false) {
				swipeVerticallyTillObject(600);
				flag = swipeTillObjectDisplayedAndClick(driver, objectText);
			}
		} catch (Exception e) {
			flag = false;
		}
		return flag;
	}

	public static boolean swipeTillObjectDisplayedAndClick(WebDriver driver, WebElement ele, int count) {
		boolean flag = false;
		DriverSession.setStepResult(false);
		try {
			if (ele.isDisplayed() && count < 6) {
				ele.click();
				flag = true;
				DriverSession.setStepResult(true);
				return flag;
			} else {
				scrollingToBottomOfAPage(driver);
				swipeTillObjectDisplayedAndClick(driver, ele, count++);
			}
		} catch (Exception e) {
			scrollingToBottomOfAPage(driver);
			// ele =
			// MobileLocators.getInstance().clickToServiceFeeAgreementLink(
			// driver);
			swipeTillObjectDisplayedAndClick(driver, ele, count++);
		}
		DriverSession.setStepResult(false);
		return flag;
	}

	public static void waitUntilPageLoading(WebDriver driver) { // ##U
		WebElement element1 = null;
		Keywords.waitForPage(driver, 2);
		long startTime = System.currentTimeMillis();
		explicitWait(2);
		element1 = driver.findElement(By.id("ajax_loading_box"));
		while ((System.currentTimeMillis() - startTime) < 2.5 * 60 * 1000) {
			try {
				String style = element1.getAttribute("style");
				if (style.contains("display: none"))
					break;
			} catch (Exception e) {
				break;
			} finally {
				Keywords.waitForPage(driver, 60);
			}
		}
	}

	public static void dynamicwaitForElementToBeVisible(WebDriver driver, Integer time, WebElement element) { // ##U
		try {
			(new WebDriverWait(driver, time)).until(ExpectedConditions.visibilityOf(element));
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Wait for Visibility of object successfully", "PASS", "Should be wait for Visibility of object");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Wait for object failed", "FAIL",
					"Should be wait for Visibility of object");
		}
	}

	public static void swipeTillButtonObjectAndClick(WebDriver driver, By byText, String objectText) { // ##U
		try {
			counter = 0;
			swipeTillButtonAndClick(driver, byText, objectText);
		} catch (Exception e) {
		}
	}

	private static void swipeTillButtonAndClick(WebDriver driver, By byText, String objectText) { // ##U
		counter++;
		if (counter > 5) {
			counter = 0;
			return;
		}
		int size = 0;
		List<WebElement> elements = driver.findElements(byText);
		try {
			size = elements.size();
			if (size == 0) {
				swipeVerticallyTillObject(600);
				swipeTillButtonObjectAndClick(driver, byText, objectText);
			}
			for (WebElement element : elements) {
				if (element.getText().equals(objectText)) {
					element.click();
					break;
				}
			}
		} catch (Exception e) {
		}
	}

	public static void swipeTillButtonObjectDisplayed(WebDriver driver, By byText) { // ##U
		try {
			counter = 0;
			swipeTillObjectDisplayed(driver, byText);
		} catch (Exception e) {
		}
	}

	private static void swipeTillObjectDisplayed(WebDriver driver, By byText) { // ##U
		counter++;
		if (counter > 5) {
			counter = 0;
			return;
		}
		int size = 0;
		List<WebElement> elements = driver.findElements(byText);
		try {
			size = elements.size();
			if (size == 0) {
				swipeVerticallyTillObject(600);
				swipeTillButtonObjectDisplayed(driver, byText);
			} else
				return;
		} catch (Exception e) {
		}
	}

	public static void moveToElement(WebElement element, WebDriver driver) { // ##U
		try {
			DriverSession.setStepResult(false);
			Actions action2 = new Actions(driver);
			action2.moveToElement(element).perform();
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
	}

	public static void swipeUpTillObjectDisplayed(WebDriver driver, By byText) { // ##U
		try {
			counter = 0;
			swipeUpTillObjectVisible(driver, byText);
		} catch (Exception e) {
		}
	}

	private static void swipeUpTillObjectVisible(WebDriver driver, By byText) { // ##U
		counter++;
		if (counter > 5) {
			counter = 0;
			return;
		}
		int size = 0;
		List<WebElement> elements = driver.findElements(byText);
		try {
			size = elements.size();
			if (size == 0) {
				swipeVerticallyUp();
				swipeUpTillObjectDisplayed(driver, byText);
			} else
				return;
		} catch (Exception e) {
		}
	}

	public static void swipeVerticallyUp() { // ##U
		try {
			Dimension screenSize = a_Driver.manage().window().getSize();
			int screenWidth = screenSize.getWidth();
			int screenHight = screenSize.getHeight();
			a_Driver.swipe(screenWidth / 4, screenHight / 4, screenWidth / 4, screenHight / 2 + 100, 1000);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public static void handleUploadFilePopup(String targetElement, WebDriver driver, String uploadFilePath) { // ##U
		try {
			DriverSession.setStepResult(false);
			JavascriptExecutor js = (JavascriptExecutor) driver;
			js.executeScript("document.getElementById('" + targetElement + "').style.display = 'block';");
			driver.findElement(By.id(targetElement)).sendKeys(uploadFilePath);
			js.executeScript("document.getElementById('" + targetElement + "').style.display = 'none';");
			DriverSession.setStepResult(true);
		} catch (Exception e) {
			DriverSession.setStepResult(false);
		}
	}

	public static void swipeUpRecursionCount(WebDriver driver, By byText) { // ##U
		int count = 0;
		if (count < 7) {
			swipeUpTillObjectDisplayed(driver, byText);
			count++;
		}
	}

	public static void dynamicwaitForElementPresence(WebDriver driver, Integer time, By byLocator) { // ##U
		try {
			WebDriverWait wait = new WebDriverWait(driver, time);
			wait.until(ExpectedConditions.presenceOfElementLocated(byLocator));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void androidScroll(String scrollToString) { // ##U
		try {
			a_Driver.scrollTo(scrollToString);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static double removeNonNumericFromString(String stringToConvert) {
		double value = 0.0;
		try {
			String[] splitForDecimal = stringToConvert.split("\\.");
			if (splitForDecimal.length == 2) {
				value = Double.valueOf(
						splitForDecimal[0].replaceAll("\\D+", "") + "." + splitForDecimal[1].replaceAll("\\D+", ""));
			} else if (splitForDecimal.length == 3) {
				value = Double.valueOf(
						splitForDecimal[1].replaceAll("\\D+", "") + "." + splitForDecimal[2].replaceAll("\\D+", ""));
			} else {
				value = Double.valueOf(stringToConvert.trim().replaceAll("\\D+", ""));
			}
		} catch (NumberFormatException e) {
			e.printStackTrace();
		}
		return value;
	}
}