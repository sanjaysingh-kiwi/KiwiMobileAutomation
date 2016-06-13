package com.utilities;

import java.io.File;
import java.util.HashMap;

import com.session.DriverSession;
import jxl.Cell;
import jxl.Sheet;
import jxl.Workbook;

public class ExcelUtility {

	Utility comnUtil = new Utility();

	public static ExcelUtility getInstance() {
		return new ExcelUtility();
	}

	public void fetchTestCaseData(int rowNumber) throws Exception {
		HashMap<String, String> rowData = new HashMap<String, String>();
		String Server = GlobalParam.SERVER_NAME;
		Server = Server.toUpperCase() + "_TestData";
		System.out.println("Server" + Server);
		System.out.println("excel" + DriverSession.getTestExcelPath());
		rowData = Utility.getOdsSheetData(DriverSession.getTestExcelPath(),
				Server, rowNumber);
		DriverSession.setTestCaseData(rowData);
	}

	public Workbook openWorkbook(String xlFilePath) throws Exception {
		return Workbook.getWorkbook(new File(xlFilePath));
	}

	public Sheet getSheetHandel(Workbook workbook, String sheetName)
			throws Exception {
		return workbook.getSheet(sheetName);
	}

	public Sheet getSheetHandel(Workbook workbook, int sheetIndex)
			throws Exception {
		return workbook.getSheet(sheetIndex);
	}

	public HashMap<String, String> fetchRowData(Sheet sheet, int rowNumber) {
		HashMap<String, String> rowData = new HashMap<String, String>();
		for (int i = 0; i < sheet.getColumns(); i++) {
			rowData.put(sheet.getCell(i, 0).getContents().trim(), sheet
					.getCell(i, rowNumber).getContents().trim());
		}
		return rowData;
	}

	public HashMap<String, String> fetchRow_TestData(Sheet sheet, int rowNumber) {
		HashMap<String, String> rowData = new HashMap<String, String>();
		for (int i = 2; i < sheet.getColumns(); i++) {
			rowData.put(sheet.getCell(i, 0).getContents(),
					sheet.getCell(i, rowNumber).getContents());
		}
		return rowData;
	}

	public void closeWorkbook(Workbook workbook) throws Exception {
		workbook.close();
	}

	public HashMap<String, String> getStockDataFromExcel(String excelPath)
			throws Exception {
		HashMap<String, String> rowData = new HashMap<String, String>();
		Workbook workbook = openWorkbook(excelPath);
		Sheet sheet = getSheetHandel(workbook, 1);
		for (int i = 0; i < sheet.getColumns(); i++) {
			for (int j = 0; j < sheet.getRows(); j++) {
				rowData.put(sheet.getCell(i, j).getContents().trim(), sheet
						.getCell(i, j).getContents().trim());
			}
		}
		closeWorkbook(workbook);
		return rowData;
	}

	public void fetchTransactionData(int rowNumber) throws Exception {
		HashMap<String, String> rowData = new HashMap<String, String>();
		Workbook workbook = openWorkbook(DriverSession.getTestExcelPath());
		Sheet sheet = getSheetHandel(workbook, 2);
		rowData = fetchRowData(sheet, rowNumber);
		closeWorkbook(workbook);
		GlobalParam.TransactionData = rowData;
	}

	public int returnColumnPosition(String headerName, Sheet sheet) {
		int columnCount = -1;
		int totalColumn = 0;
		String header = "";

		totalColumn = sheet.getColumns();
		// System.out.println(totalColumn + " " + sheet.getRows());
		for (int i = 0; i < totalColumn; i++) {
			Cell cell = sheet.getCell(i, 0);
			header = cell.getContents().trim();
			if (header.equalsIgnoreCase(headerName)) {
				columnCount = i;
				break;
			}
		}
		return columnCount;
	}

	public int returnRowPosition(String rowHeaderName, Sheet sheet) {

		int rowCount = -1;
		int totalRows = 0;
		String header = "";

		totalRows = sheet.getRows();
		for (int i = 0; i < totalRows; i++) {
			Cell cell = sheet.getCell(0, i);
			header = cell.getContents().trim();

			if (header.equalsIgnoreCase(rowHeaderName)) {
				rowCount = i;
				break;
			}
		}

		return rowCount;
	}

	public String getCellValueByCollumHeader(String colHeader, int rowNum,
			int sheetNumber) throws Exception {
		String value = "";
		int colNumber;
		Workbook workbook = null;
		Sheet sheet = null;
		try {
			workbook = openWorkbook(DriverSession.getTestExcelPath());
			sheet = getSheetHandel(workbook, sheetNumber);
			colNumber = returnColumnPosition(colHeader, sheet);
			Cell cell = sheet.getCell(colNumber, rowNum);
			value = cell.getContents().trim();
		}

		catch (Exception E) {

		}

		finally {
			if (workbook != null) {
				closeWorkbook(workbook);
			}
		}
		return value;
	}

	public String getCellValueByCollumAndRowHeader(String colHeader,
			String rowHeader, int sheetNumber) throws Exception {
		String value = "";
		int colNumber;
		int rowNumber;
		Workbook workbook = null;
		Sheet sheet = null;
		try {
			workbook = openWorkbook(DriverSession.getTestExcelPath());
			sheet = getSheetHandel(workbook, sheetNumber);
			colNumber = returnColumnPosition(colHeader, sheet);
			rowNumber = returnRowPosition(rowHeader, sheet);
			Cell cell = sheet.getCell(colNumber, rowNumber);
			value = cell.getContents().trim();
		}

		catch (Exception E) {

		}

		finally {
			if (workbook != null) {
				closeWorkbook(workbook);
			}
		}
		return value;
	}

	public static void main(String args[]) throws Exception {
		ExcelUtility eu = new ExcelUtility();
		HashMap<String, String> testData = eu
				.getStockDataFromExcel("D:\\Crestech-Data\\ETProject\\ETPortFolioMobileAutomation\\TestRepository\\TestData\\ET-Stocks.xls");
		testData.get("TransactionDate");
		// System.out.println(testData.get("TransactionDate"));
	}
}
