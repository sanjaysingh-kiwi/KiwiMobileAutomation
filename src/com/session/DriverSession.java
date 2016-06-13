package com.session;

import java.util.HashMap;

import org.openqa.selenium.WebDriver;

import testCaseReporting.TestCaseReporting;

public class DriverSession {
	private static ThreadLocal<WebDriver> driver = new ThreadLocal<WebDriver>();
	private static ThreadLocal<String> BrowserName = new ThreadLocal<String>();
	private static ThreadLocal<HashMap<String, String>> TEST_DATA = new ThreadLocal<HashMap<String, String>>();
	private static ThreadLocal<TestCaseReporting> testaCaseReporting = new ThreadLocal<TestCaseReporting>();
	private static ThreadLocal<String> TestExcelPath = new ThreadLocal<String>();
	private static ThreadLocal<Boolean> stepResult = new ThreadLocal<Boolean>();
	private static ThreadLocal<String> userFilePath = new ThreadLocal<String>() {
		@Override
		protected String initialValue() {
			return "";
		}
	};

	private static ThreadLocal<String> USERNAME = new ThreadLocal<String>() {
		@Override
		protected String initialValue() {
			return "";
		}
	};
	private static ThreadLocal<String> PASSWORD = new ThreadLocal<String>() {
		@Override
		protected String initialValue() {
			return "";
		}
	};

	public static void setLastExecutionDriver(WebDriver wd) { // ##U
		driver.set(wd);
	}

	public static WebDriver getLastExecutionDriver() { // ##U
		return driver.get();
	}

	public static void setLastExecutionReportingInstance(
			TestCaseReporting testReporting) {
		testaCaseReporting.set(testReporting);
	}

	public static TestCaseReporting getLastExecutionReportingInstance() {
		return testaCaseReporting.get();
	}

	public static void setStepResult(boolean status) {
		stepResult.set(status);
	}

	public static boolean getStepResult() {
		return stepResult.get();
	}

	public static void setBrowserName(String browser) {
		BrowserName.set(browser);
	}

	public static String getBrowserName() {
		return BrowserName.get();
	}

	public static void setUserRegistrationFilePath(String filePath) {
		userFilePath.set(filePath);
	}

	public static String getUserRegistrationFilePath() {
		return userFilePath.get();
	}

	public static void setUserName(String userName) {
		USERNAME.set(userName);
	}

	public static String getUserName() {
		return USERNAME.get();
	}

	public static void setPassword(String password) {
		PASSWORD.set(password);
	}

	public static String getPassword() {
		return PASSWORD.get();
	}

	public static void setTestCaseData(HashMap<String, String> data) {
		TEST_DATA.set(data);
	}

	public static HashMap<String, String> getTestCaseData() {
		return TEST_DATA.get();
	}

	public static void setTestExcelPath(String path) {
		TestExcelPath.set(path);
	}

	public static String getTestExcelPath() {
		return TestExcelPath.get();
	}

	public static void addTestCaseData(String key, String value) {
		TEST_DATA.get().put(key, value);
	}
}