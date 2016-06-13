package testCaseReporting;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.WebDriver;

import com.utilities.GlobalParam;

public class SuiteReporting extends Reporting {

	public OutputStream consolidateHtmlFile;
	public PrintStream consolidatePrintHtml;
	public FileInputStream fis = null;
	public BufferedReader reader = null;
	private int totalPassTestCase = 0;
	public int totalFailTestCase = 0;
	public long sStartTimeConsolidate = 0;
	public long sEndTimeConsolidate = 0;
	public static String pathToSuiteFolder = "";
	private String PathToConsolidateResult = "";
	public String suiteName = "TestCaseSuite";
	public String resultPath = "";
	WebDriver driver = null;
	WebDriver augdDriver = null;

	public SuiteReporting(String suiteName) {
		setSuiteName(suiteName);
		deleteExistingFolder(destFolderPath);
		createResultFolderStructure();
		createConsolidateHeader();
	}

	public void setSuiteName(String suiteName) {
		this.suiteName = suiteName;

	}

	public void setSuiteNameWithIp() {
		this.suiteName = this.suiteName + "_" + GlobalParam.serverIP;
	}

	public String getTotalExecutionTime(long starttime, long endtime) {

		long diff = endtime - starttime;

		long diffSeconds = diff / 1000 % 60;
		long diffMinutes = diff / (60 * 1000) % 60;
		long diffHours = diff / (60 * 60 * 1000) % 24;
		// long diffDays = diff / (24 * 60 * 60 * 1000);

		return (diffHours + ":" + diffMinutes + ":" + diffSeconds);

	}

	public void openConsolidateFile() {
		try {
			consolidateHtmlFile = new FileOutputStream(new File(pathToSuiteFolder + "/suite.html"), true);
			consolidatePrintHtml = new PrintStream(consolidateHtmlFile);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public void createConsolidateHeader() {
		try {
			openConsolidateFile();
			consolidatePrintHtml.println("<html>");

			consolidatePrintHtml.println("<title> Test Script Report </title>");
			consolidatePrintHtml.println("<head></head>");
			consolidatePrintHtml.println("<body>");
			consolidatePrintHtml.println("<font face='Tahoma'size='2'>");

			consolidatePrintHtml.println("<h2 align='center'>" + GlobalParam.APP_NAME
					+"("+ GlobalParam.CURRENT_EXECUTION_MODE +")" +" Execution Report" + "</h2>");
			consolidatePrintHtml
					.println("<h3 align='right' ><font color='#000000' face='Tahoma' size='3'></font></h3>");
			consolidatePrintHtml.println("<table border='0' width='100%' height='47'>");
			consolidatePrintHtml.println("<tr>");
			consolidatePrintHtml.println(
					"<td width='2%' bgcolor='#CCCCFF' align='center'><b><font color='#000000' face='Tahoma' size='2'>TestCaseName</font></b></td>");
			consolidatePrintHtml.println(
					"<td width='52%' bgcolor='#CCCCFF'align='center'><b><font color='#000000' face='Tahoma' size='2'>Status</font></b></td>");
			consolidatePrintHtml.println(
					"<td width='30%' bgcolor='#CCCCFF'align='center'><b><font color='#000000' face='Tahoma' size='2'>Result File</font></b></td>");
			consolidatePrintHtml.println(
					"<td width='30%' bgcolor='#CCCCFF'align='center'><b><font color='#000000' face='Tahoma' size='2'>TestCase Percent</font></b></td>");
			consolidatePrintHtml.println("</tr>");
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public void writeFileInConsolidate() {
		try {
			openConsolidateFile();
			File folder = new File(pathToSuiteFolder + "/TestCase");
			System.out.println(folder.getAbsolutePath());
			File[] listOfFiles = folder.listFiles();

			for (File file : listOfFiles) {
				if (file.isFile()) {
					checkTestCaseStatus(file);
				}
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public void checkTestCaseStatus(File testCaseFile) {
		String Status = "PASS";
		String[] line3;
		String sPercent = "";
		Boolean bflagstatus = false;

		try {
			String resultLink = "<a href=\"" + "TestCase/" + testCaseFile.getName() + "\">TestCaseResultFile</a>";
			fis = new FileInputStream(testCaseFile);
			reader = new BufferedReader(new InputStreamReader(fis));

			String line = reader.readLine();
			while (line != null) {
				if (line.contains("FAIL")) {
					bflagstatus = true;
				}

				String[] sub1;
				if (line.contains("Total Pass")) {
					String[] lines = line.split("Total Pass");
					// Regex.Split(strLine, "Total Pass");

					line3 = lines[1].split(":");

					sub1 = line3[1].split("%");

					int stotallength = sub1[0].length();

					int lastindex = sub1[0].lastIndexOf(">");

					String a = sub1[0].substring(lastindex + 1, stotallength);
					if (!bflagstatus) {
						Status = "PASS";
						sPercent = a;
					} else {
						Status = "FAIL";
						sPercent = a;
					}
				}
				line = reader.readLine();
			}

			addTestToConsolidate(Status, getTestCaseName(testCaseFile.getName()), resultLink, sPercent);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public void addTestToConsolidate(String strPassFail, String testCaseName, String ResultFileLink,
			String sPassPercent) {

		consolidatePrintHtml.println("<tr>");

		consolidatePrintHtml.println(
				"<td width='22%' bgcolor='#FFFFDC' valign='top' align='justify' ><font color='#000000' face='Tahoma' size='2'>"
						+ testCaseName + "</font></td>");

		if (strPassFail.toUpperCase() == "PASS") {
			totalPassTestCase = totalPassTestCase + 1;
			consolidatePrintHtml.println(
					"<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
							+ strPassFail + "</font></b></td>");
		} else {
			totalFailTestCase = totalFailTestCase + 1;
			consolidatePrintHtml.println(
					"<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='Red' face='Tahoma' size='2'>"
							+ strPassFail + "</font></b></td>");
		}
		consolidatePrintHtml.println(
				"<td width='20%' bgcolor='#FFFFDC' valign='top' align='justify' ><font color='#000000' face='Tahoma' size='2'>"
						+ ResultFileLink + "</font></td>");
		consolidatePrintHtml.println(
				"<td width='13%' bgcolor='#FFFFDC' valign='middle' align='center' ><font color='#000000' face='Tahoma' size='2'>"
						+ sPassPercent + "%" + "</font></td>");

	}

	public void consolidateResultFooter() {
		writeFileInConsolidate();
		sEndTimeConsolidate = getTime();
		openConsolidateFile();
		int testcasetotal = totalPassTestCase + totalFailTestCase;
		int int_Pass = totalPassTestCase;
		int int_Fail = totalFailTestCase;
		String sDate = getSystemDate();
		String timeDiff = getTotalExecutionTime(sStartTimeConsolidate, sEndTimeConsolidate);

		int Passwidth = 0;
		String Failwidth = "";
		int SuccessRate = 0;
		String FailRate = "";

		testcasetotal = int_Pass + int_Fail;

		SuccessRate = (int_Pass * 100 / (testcasetotal));
		FailRate = Integer.toString(100 - SuccessRate);
		Passwidth = (300 * SuccessRate) / 100;
		Failwidth = Integer.toString(300 - Passwidth);

		consolidatePrintHtml.println("</table>");
		consolidatePrintHtml.println("<hr>");
		consolidatePrintHtml.println("<table border='0' width='50%'>");
		consolidatePrintHtml.println(
				"<tr><td width='100%' colspan='2' bgcolor='#000000'><b><font face='Tahoma' size='2' color='#FFFFFF'>Test Case Details :</font></b></td></tr>");
		consolidatePrintHtml.println(
				"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Total Tests Passed</font></b></td><td width='55%' bgcolor='#FFFFDC'><font face='Tahoma' size='2'>"
						+ int_Pass + "</td></tr>");
		consolidatePrintHtml.println(
				"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Total Tests Failed</font></b></td><td width='55%' bgcolor='#FFFFDC'><font face='Tahoma' size='2'>"
						+ int_Fail + "</td></tr>");
		consolidatePrintHtml.println(
				"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Executed On (DD.MM.YYYY)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
						+ sDate + "</td></tr>");
		consolidatePrintHtml.println(
				"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Start Time (HH:MM:SS)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
						+ getSystemTime(sStartTimeConsolidate) + "</td></tr>");
		consolidatePrintHtml.println(
				"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>End Time (HH:MM:SS)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
						+ getSystemTime(sEndTimeConsolidate) + "</td></tr>");
		consolidatePrintHtml.println(
				"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Execution Time (MM.SS)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
						+ timeDiff + "</td></tr>");
		consolidatePrintHtml.println("</table>");
		String totaltest = Integer.toString(testcasetotal);
		consolidatePrintHtml.println("<table border=0 cellspacing=1 cellpadding=1 ></table>");
		consolidatePrintHtml.println(
				"<table border=0 cellspacing=1 cellpadding=1 ><tr><td width='100%' colspan='2' bgcolor='#000000'><b><font face='Tahoma' size='2' color='#FFFFFF'>Test Result Summary :</font></b></td></tr></table>");
		consolidatePrintHtml.println(
				"<table border=0 cellspacing=1 cellpadding=1 ><tr>  <td width=70 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75 ><b>Total Test</b></td> <td width=10 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>:</b></td>     <td width=35 bgcolor= '#FFFFDC'><FONT FACE='Tahoma' SIZE=2.75><b>"
						+ totaltest
						+ "</b></td>  <td width=300 bgcolor='#E7A1B0'></td>  <td width=20><FONT COLOR='#000000' FACE='Tahoma' SIZE=1><b>100%</b></td></tr></table>");
		consolidatePrintHtml.println(
				"<table border=0 cellspacing=1 cellpadding=1 ><tr>  <td width=70 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75 ><b>Total Pass</b></td> <td width=10 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>:</b></td>     <td width=35 bgcolor= '#FFFFDC'><FONT FACE='Tahoma' SIZE=2.75><b>"
						+ Integer.toString(int_Pass) + "</b></td>  <td width= " + Passwidth
						+ " bgcolor='#008000'></td>  <td width=20><FONT COLOR='#000000' FACE='Tahoma' SIZE=1><b>"
						+ SuccessRate + "%</b></td></tr></table>");
		consolidatePrintHtml.println(
				"<table border=0 cellspacing=1 cellpadding=1 ><tr> <td width=70 bgcolor= '#FFFFDC'><FONT   FACE='Tahoma' SIZE=2.75 ><b>Total Fail</b></td>  <td width=10 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>:</b></td>     <td width=35 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>"
						+ Integer.toString(int_Fail) + "</b></td>   <td width= " + Failwidth
						+ " bgcolor='#FF0000'></td>     <td width=20><FONT COLOR='#000000' FACE='Tahoma' SIZE=1><b>"
						+ FailRate + "%</b></td> </tr></table>");
		consolidatePrintHtml.println("</font>");
		consolidatePrintHtml.println("</body>");
		consolidatePrintHtml.println("</html>");
		consolidatePrintHtml.close();
		copyFolderToWorkSpace();

	}

	public File createTempDir() throws IOException {

		if (resultPath.equals("")) {
			resultPath = System.getProperty("user.home");// System.getProperty("java.io.tmpdir");
		}
		File sysTempDir = new File(resultPath, "ExecutionReport");
		
		sysTempDir.mkdir();

		File newTempDir;
		int maxAttempts = 9;
		int attemptCount = 0;
		do {
			attemptCount++;
			if (attemptCount > maxAttempts) {
				throw new IOException("The highly improbable has occurred! Failed to "
						+ "create a unique temporary directory after " + maxAttempts + " attempts.");
			}
			String dirName = this.suiteName + "_Results_" + GlobalParam.CURRENT_EXECUTION_MODE + "_" + getTime();
			newTempDir = new File(sysTempDir, dirName);
		} while (newTempDir.exists());

		if (newTempDir.mkdirs()) {
			return newTempDir;
		} else {
			throw new IOException("Failed to create temp dir named " + newTempDir.getAbsolutePath());
		}
	}

	public void createResultFolderStructure() {
		try {
			sStartTimeConsolidate = getTime();
			PathToConsolidateResult = createTempDir().getAbsolutePath();
			pathToSuiteFolder = createDir(PathToConsolidateResult, suiteName + sStartTimeConsolidate).getAbsolutePath();

			createDir(pathToSuiteFolder, "TestCase");
			createDir(pathToSuiteFolder, "screenShot");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();

		}
	}

	public void copyFolderToWorkSpace() {
		File srcFolderPath = new File(pathToSuiteFolder);
		destFolderPath.mkdir();
		copyFolder(srcFolderPath, destFolderPath);
	}

	public void copyFolder(File srcFolderPath, File targertFolderPath) {
		try {
			FileUtils.copyDirectoryToDirectory(srcFolderPath, targertFolderPath);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public String getClassName(Object classObj) {
		String packagename = "";
		packagename = classObj.getClass().getName();
		if (packagename.length() == 0)
			System.out.println("Empty String Exception");
		int index = packagename.lastIndexOf(".");
		if (index != -1)
			return packagename.substring(index + 1, packagename.length());
		return "";
	}

	public String getTestCaseName(String fullTestCaseName) {

		if (fullTestCaseName.length() == 0)
			System.out.println("Empty String Exception");

		int index = fullTestCaseName.lastIndexOf(".");
		if (index != -1)
			return fullTestCaseName.substring(0, index);
		return "";
	}

}
