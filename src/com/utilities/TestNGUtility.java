package com.utilities;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.jopendocument.dom.spreadsheet.Sheet;
import org.jopendocument.dom.spreadsheet.SpreadSheet;

public class TestNGUtility {
	private File suiteFile;

	public TestNGUtility() {
		String suitExc = GlobalParam.CURRENT_PROJECT_PATH + "/TestRepository/TestSuite/" + GlobalParam.APP_NAME + "/"
				+ GlobalParam.APP_NAME + GlobalParam.CURRENT_EXECUTION_MODE + "Suite.ods";
		File file = new File(suitExc);
		this.suiteFile = file;
	}

	public Map<String, ArrayList<String>> getTrueTestCases(String executionMode) {
		Map<String, ArrayList<String>> testCases = new LinkedHashMap<String, ArrayList<String>>();
		try {
			Sheet sheet = SpreadSheet.createFromFile(suiteFile).getSheet(0);
			for (int colNum = 0; colNum < sheet.getColumnCount(); ++colNum) {
				String colName = sheet.getValueAt(colNum, 0).toString();
				if (colName.trim().isEmpty()) {
					break;
				}
				if (colName.trim().equalsIgnoreCase(executionMode)) {
					for (int rowNum = 1; rowNum < sheet.getRowCount(); ++rowNum) {
						String cellValue = sheet.getValueAt(colNum, rowNum).toString();
						if (cellValue.trim().isEmpty()) {
							break;
						}
						if (Boolean.parseBoolean(cellValue)) {
							String testCase = sheet.getValueAt(1, rowNum).toString();
							String browser = sheet.getValueAt(2, rowNum).toString();
							ArrayList<String> browsers = new ArrayList<String>();
							if (testCases.containsKey(testCase)) {
								browsers = testCases.get(testCase);
							}
							browsers.add(browser);
							testCases.put(testCase, new ArrayList<String>(browsers));
						}
					}
					break;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return testCases;
	}

	public Map<String, ArrayList<String>> getActionComponent(Map<String, ArrayList<String>> testCases) {
		HashMap<String, ArrayList<String>> actionComponent = new HashMap<String, ArrayList<String>>();
		for (String testCaseName : testCases.keySet()) {
			try {
				String testCaseOds = GlobalParam.CURRENT_PROJECT_PATH + "/TestRepository/TestCases/"
						+ GlobalParam.APP_NAME + "/" + testCaseName + ".ods";
				File file = new File(testCaseOds);
				Sheet sheet = SpreadSheet.createFromFile(file).getSheet(0);

				for (int i = 1; i < sheet.getRowCount(); i++) {
					String action = sheet.getValueAt(0, i).toString();
					if (action.trim().isEmpty()) {
						break;
					}
					ArrayList<String> actions = new ArrayList<String>();
					if (actionComponent.containsKey(testCaseName)) {
						actions = actionComponent.get(testCaseName);
					}
					actions.add(action);
					actionComponent.put(testCaseName, new ArrayList<String>(actions));
				}
			} catch (Exception e) {
				System.out.println("Ods file for the " + testCaseName + " TestCase do not exist. Please Check");
			}
		}
		return actionComponent;
	}
}