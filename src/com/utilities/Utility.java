package com.utilities;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Properties;
import java.util.Random;
import java.util.Scanner;

import org.jopendocument.dom.spreadsheet.Sheet;
import org.jopendocument.dom.spreadsheet.SpreadSheet;

import com.session.DriverSession;

public class Utility {
	Properties prop = null;

	public void initEnvSettings() throws Exception {
		try {
			String OS = System.getProperty("os.name");
			if (OS.contains("Mac OS") && GlobalParam.SERVER_NAME.equals("app")) {
				int portNumber = 4723;
				// int portNumber = generatePortNumber();
				// The method will start appium even when there is no Android
				// cases are run
				//startAppium(portNumber);
				GlobalParam.appiumPort = portNumber;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private int generatePortNumber() { // ##U
		Random rand = new Random();
		int max = 16000;
		int min = 11500;
		int randomNum = rand.nextInt((max - min) - 1) + min;
		return randomNum;
	}

	private void startAppium(int port) {
		Process p;
		System.out.println("Port number is: " + port);
		String command = "/Applications/Appium.app/Contents/Resources/node/bin/node /Applications/Appium.app/Contents/Resources/node_modules/appium/bin/appium.js --address 127.0.0.1 --port "
				// + port
				// + " --log /Users/Sanjay/DailyRunNew/Jobs/AppiumOutput/app"
				+ port;
		// + ".log"
		// + " --chromedriver-port 9516 --bootstrap-port 4725 --selendroid-port
		// 8082 --no-reset --local-timezone"
		// + " --platform-version 4.4 --automation-name Appium --command-timeout
		// 60 --device-ready-timeout 10";
		try {
			p = Runtime.getRuntime().exec(command);
			// Commented the below line to remove GlobalVar. We need to see if
			// the below code can be reused
			// GlobalVar.appiumProcess = p;
			Thread.sleep(3000);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public Properties loadPageProperties(String pathToPageProperties) {
		Properties pageProp = new Properties();
		String fileLoc = pathToPageProperties;
		try {
			File f = new File(fileLoc);
			FileInputStream fis = new FileInputStream(f);
			pageProp.load(fis);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return pageProp;
	}

	public ArrayList<String> fetchActionComponent(String testCaseName) {
		ArrayList<String> actionComponent = new ArrayList<String>();

		try {
			String testCaseOds = System.getProperty("user.dir") + "/TestRepository/TestCases/" + testCaseName + ".ods";
			DriverSession.setTestExcelPath(testCaseOds);
			File file = new File(testCaseOds);
			Sheet sheet = SpreadSheet.createFromFile(file).getSheet(0);

			for (int i = 1; i < sheet.getRowCount(); i++) {
				actionComponent.add(sheet.getValueAt(0, i).toString());
			}
		} catch (Exception ee) {
			ee.printStackTrace();
		}
		return actionComponent;
	}

	public ArrayList<String> fetchActionComponentApi(String testCaseName) {
		ArrayList<String> actionComponent = new ArrayList<String>();

		try {
			String testCaseOds = System.getProperty("user.dir") + "/TestRepository/TestCases/" + testCaseName + ".ods";
			DriverSession.setTestExcelPath(testCaseOds);
			File file = new File(testCaseOds);
			Sheet sheet = SpreadSheet.createFromFile(file).getSheet(0);

			for (int i = 1; i < sheet.getRowCount(); i++) {
				actionComponent.add(sheet.getValueAt(0, i).toString());
			}
		}

		catch (Exception ee) {
			ee.printStackTrace();
		}
		return actionComponent;

	}

	public static HashMap<String, String> getOdsSheetData(String odsFilePath, String server, int rowNumber) {
		Sheet sheet = null;
		try {
			File file = new File(odsFilePath);
			sheet = SpreadSheet.createFromFile(file).getSheet(server);
			fetchRowDataOds(sheet, rowNumber);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return fetchRowDataOds(sheet, rowNumber);
	}

	public static HashMap<String, String> fetchRowDataOds(Sheet sheet, int rowNumber) {
		HashMap<String, String> rowData = new HashMap<String, String>();
		for (int i = 0; i < sheet.getColumnCount(); i++) {
			rowData.put(sheet.getValueAt(i, 0).toString(), sheet.getValueAt(i, rowNumber).toString());
		}
		return rowData;
	}

	private static String getPortFolioCounter() throws FileNotFoundException {
		GlobalParam.CURRENT_PROJECT_PATH = System.getProperty("user.dir");

		// System.out.println(" current project path "
		// + GlobalParam.CURRENT_PROJECT_PATH);

		String counterFilePath = GlobalParam.CURRENT_PROJECT_PATH + "/portFolioCounter.txt";

		// System.out.println(" file path " + counterFilePath);

		Scanner sc = new Scanner(new File(counterFilePath));
		String nextLine = sc.nextLine();
		sc.close();
		return nextLine;
	}

	private static void setPortFolioNewCounter(String str) throws IOException {
		String counterFilePath = GlobalParam.CURRENT_PROJECT_PATH + "/portFolioCounter.txt";
		FileWriter fw = new FileWriter(new File(counterFilePath));
		fw.write(str);
		fw.flush();
		fw.close();
	}

	public static String getPortFolioSuffix() {
		String suf = "";
		try {
			suf = (Integer.parseInt(getPortFolioCounter()) + 1) + "";
			setPortFolioNewCounter(suf);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return suf;
	}

	public static File getLatestFilefromDir(String dirPath) {
		File dir = new File(dirPath);
		File[] files = dir.listFiles();
		if (files == null || files.length == 0) {
			return null;
		}

		File lastModifiedFile = files[0];
		for (int i = 1; i < files.length; i++) {
			if (lastModifiedFile.lastModified() < files[i].lastModified()) {
				lastModifiedFile = files[i];
			}
		}
		return lastModifiedFile;
	}
}