package com.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.text.WordUtils;
import org.apache.log4j.PropertyConfigurator;
import org.testng.TestNG;

import com.session.DriverSession;
import testCaseReporting.SuiteReporting;
import com.utilities.TestNGUtility;
import com.utilities.XMLFileUtility;

import com.utilities.GlobalParam;
import com.utilities.Utility;

public class Controller {
	static SuiteReporting suitreporting; // Object, defined for SuiteReporting
	// class

	public static void main(String[] ar) {
		// 'main' class, which initiates execution of Controller.java
		try {
			// Object declarations and definitions
			Controller c;
			GlobalParam.APP_NAME = WordUtils.capitalize(ar[0]);
			GlobalParam.FEATURE_TYPE = WordUtils.capitalize(ar[1]);
			GlobalParam.SERVER_NAME = ar[2];
			GlobalParam.serverIP = "localhost";
			GlobalParam.mergeCase = false;
			GlobalParam.appiumPort = 4723;

			String arguments = "";
			for (int i = 3; i < ar.length; i++)
				arguments = arguments + ar[i] + " ";

			arguments = arguments.toLowerCase();

			try {
				if (arguments.contains("merge"))
					GlobalParam.mergeCase = true;

				if (arguments.contains("orderidlogger"))
					GlobalParam.OrderIDLogger = true;

			} catch (Exception ex) {
				GlobalParam.serverIP = "localhost";
				GlobalParam.mergeCase = false;
			}

			if (GlobalParam.TESTNG_EXECUTION)
				if (arguments.contains("pickbrowserautomatically"))
					GlobalParam.pickBrowserAutomatically = true;

			if (GlobalParam.OrderIDLogger)
				PropertyConfigurator.configure("Log4j.properties");

			try {
				if (arguments.contains("appiumport=")) {
					String temp[] = arguments.split(" ");
					for (int j = 0; j < temp.length; j++) {
						if (temp[j].contains("appiumport=")) {
							String temp1[] = temp[j].split("=");
							GlobalParam.appiumPort = Integer.parseInt(temp1[1]);
							break;
						}
					}
				}
			} catch (Exception ex) {
			}

			try {
				if (arguments.contains("TakeBrowserNameFromPath".toLowerCase()))
					GlobalParam.TakeBrowserNameFromPath = true;
			} catch (Exception ex) {
			}

			if (GlobalParam.FEATURE_TYPE.equalsIgnoreCase("mobile")) {
				if (GlobalParam.serverIP.equalsIgnoreCase("localhost"))
					GlobalParam.serverIP = "mobile";
				GlobalParam.mergeCase = false;
			}

			try {
				if (arguments.contains("detailReport".toLowerCase()))
					GlobalParam.detailReporting = true;
			} catch (Exception ex) {
			}

			GlobalParam.SERVER_NAME = GlobalParam.SERVER_NAME.trim();

			// suitreporting = new SuiteReporting(GlobalParam.APP_NAME);
			c = new Controller();
			// suitreporting.setSuiteNameWithIp();
			// Object, defined for 'Controller' class
			Utility commonUtility = new Utility();

			// To initiate environment settings for 'Utility' instance
			commonUtility.initEnvSettings();
			// To set platform settings for all iterated test-scripts
			c.testNGSuitExecutor();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (DriverSession.getLastExecutionDriver() != null)
				DriverSession.getLastExecutionDriver().quit();
		}
	}

	public void testNGSuitExecutor() {
		XMLFileUtility xml = new XMLFileUtility();
		TestNGUtility testNGUtility;

		try {
			String appComponent = new String();
			Map<String, ArrayList<String>> testCase = new LinkedHashMap<String, ArrayList<String>>();
			Map<String, ArrayList<String>> actionComponents = new HashMap<String, ArrayList<String>>();

			appComponent = "applicationComponent." + GlobalParam.APP_NAME;

			switch (GlobalParam.FEATURE_TYPE.toLowerCase()) {
			case "ios":
				appComponent = appComponent.concat(".IOSAppAc");
				GlobalParam.CURRENT_EXECUTION_MODE = "IOSApp";
				break;
			case "android":
				appComponent = appComponent.concat(".AndroidAppAc");
				System.out.println(appComponent);
				GlobalParam.CURRENT_EXECUTION_MODE = "AndroidApp";
				break;
			case "web":
				appComponent = appComponent.concat(".WebAc");
				GlobalParam.CURRENT_EXECUTION_MODE = "DesktopWeb";
				break;
			case "msite":
				appComponent = appComponent.concat(".MobileWebAc");
				GlobalParam.CURRENT_EXECUTION_MODE = "MobileWeb";
				break;
			}

			testNGUtility = new TestNGUtility();

			GlobalParam.initialize();

			testCase = testNGUtility.getTrueTestCases(GlobalParam.CURRENT_EXECUTION_MODE);
			actionComponents = testNGUtility.getActionComponent(testCase);
			xml.createTestNGFile();

			for (String tCase : testCase.keySet())
				xml.modifySuite(tCase, appComponent, actionComponents.get(tCase), testCase.get(tCase));

			String xmlPath = xml.getTestNGFile().getAbsolutePath();
			TestNG runner = new TestNG();
			List<String> suiteFiles = new ArrayList<String>();
			suiteFiles.add(xmlPath);
			runner.setTestSuites(suiteFiles);
			runner.run();
			xml.deleteXMLFile();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
