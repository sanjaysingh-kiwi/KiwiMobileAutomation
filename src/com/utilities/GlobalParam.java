package com.utilities;

import java.io.File;
import java.io.FileInputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.openqa.selenium.remote.DesiredCapabilities;

public abstract class GlobalParam {
	public static String APP_NAME = "";
	public static String CURRENT_PROJECT_PATH;
	public static String FEATURE_TYPE = "";
	public static String SERVER_NAME = "";
	public static boolean TESTNG_EXECUTION = false;
	public static String CURRENT_EXECUTION_MODE;
	public static boolean mergeCase;
	public static String threadCount = "3";
	public static String vendorUrl;
	public static DesiredCapabilities driverCapabilities = null;
	public static Properties masterProp = null;
	public static Properties suiteProp = null;
	public static boolean pickBrowserAutomatically = false;
	public static String screenshotOption = "ALL";
	public static String LastTestCaseSuccess = "NA";
	public static boolean detailReporting = false;
	public static String CURRENT_TEST_CASE_NAME;
	public static String url;
	public static HashMap<String, String> TransactionData;
	public static String PROJECT_ROOT_PATH = "/home/shopclues/";
	public static boolean setSafari = false;
	public static String serverIP = "localhost";
	public static boolean TakeBrowserNameFromPath = false;
	public static String DownloadLocation;
	public static String AddFeaturename;
	public static Logger logger = null;
	public static String OrderIDMessage;
	public static boolean OrderIDLogger = false;
	public static boolean RunAllOnServerIP = false;
	public static boolean Reporting = true;
	public static boolean ExitTestCase = false;

	public static String staticKey;
	public static int appiumPort;
	public static boolean appiumFromProgram = false;
	public static String ttlValue;
	public static HashMap<String, String> UserInfoData;
	public static String tokenValue;
	public static String tokenType = "|";

	static {
		CURRENT_PROJECT_PATH = System.getProperty("user.dir");
		loadSuiteProperties();
	}

	public static void initialize() {
		loadMasterProperties(CURRENT_EXECUTION_MODE);
		url = getUrl(GlobalParam.SERVER_NAME);
		loadDesiredCapabilities();
		threadCount = suiteProp.getProperty("threadCount");
	}

	private static void loadMasterProperties(String flavour) { // ##U
		masterProp = new Properties();
		String fileLoc = GlobalParam.CURRENT_PROJECT_PATH + "/" + flavour + ".properties";
		try {
			File f = new File(fileLoc);
			FileInputStream fis = new FileInputStream(f);
			masterProp.load(fis);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void loadSuiteProperties() { // ##U
		suiteProp = new Properties();
		String fileLoc = GlobalParam.CURRENT_PROJECT_PATH + "/suiteExecution.properties";
		try {
			File f = new File(fileLoc);
			FileInputStream fis = new FileInputStream(f);
			suiteProp.load(fis);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void loadDesiredCapabilities() { // ##U
		driverCapabilities = new DesiredCapabilities();
		try {
			Enumeration<?> e = masterProp.propertyNames();
			while (e.hasMoreElements()) {
				String prop = (String) e.nextElement();
				if (prop.startsWith("cap_")) {
					String capName = prop.replaceAll("cap_", "");
					String capVal = masterProp.getProperty(prop);

					if (capName.equals("app"))
						capVal = System.getProperty("user.dir") + "/app/" + capVal;

					if (capVal.equals("<NULL>"))
						capVal = "";
					driverCapabilities.setCapability(capName, capVal);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static String getUrl(String server) {
		System.out.println("*******getUrl*******************************************" + server
				+ GlobalParam.masterProp.getProperty(server));
		return GlobalParam.masterProp.getProperty(server);
	}

}
